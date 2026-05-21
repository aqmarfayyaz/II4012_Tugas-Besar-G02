from flask import Blueprint, request, jsonify
import logging

import os

from services.cv_parser import CVParser
from models.embedder import TextEmbedder
from services.similarity_scorer import SimilarityScorer
from services.job_matcher import JobMatcher
from services.data_cleaner import DataCleaner
from services.department_classifier import DepartmentClassifier
from services.job_classifier import JobFamilyClassifier
from config import Config

from utils.helpers import format_response

bp = Blueprint("screening", __name__, url_prefix="/api/screening")
logger = logging.getLogger(__name__)

department_classifier = DepartmentClassifier()
job_family_classifier = JobFamilyClassifier(
    word_vectorizer_path=Config.TFIDF_WORD_PATH,
    char_vectorizer_path=Config.TFIDF_CHAR_PATH,
    classifier_path=Config.LR_CLASSIFIER_PATH,
)

embedder = TextEmbedder()
similarity_scorer = SimilarityScorer(embedder=embedder)
job_matcher = JobMatcher(similarity_scorer=similarity_scorer)
cv_parser = CVParser()


@bp.route("/parse-cv", methods=["POST"])
def parse_cv():
    """
    Parse uploaded CV using LlamaParse + OpenAI
    ---
    tags:
      - Screening
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: file
        type: file
        required: true
    responses:
      200:
        description: CV parsed
      400:
        description: Invalid request
    """
    try:
        if "file" not in request.files:
            return jsonify(
                format_response(
                    message="No file uploaded",
                    status="error",
                    code=400,
                )
            ), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify(
                format_response(
                    message="Empty filename",
                    status="error",
                    code=400,
                )
            ), 400

        temp_path = f"temp_{file.filename}"
        file.save(temp_path)

        parsed_data = cv_parser.parse_cv(temp_path)

        return jsonify(
            format_response(
                data=parsed_data,
                message="CV parsed successfully",
            )
        ), 200

    except Exception as e:
        logger.error(f"CV parsing error: {str(e)}")
        return jsonify(
            format_response(
                message=str(e),
                status="error",
                code=500,
            )
        ), 500


@bp.route("/match", methods=["POST"])
def match_cv_jd():
    """
    Match single CV against job description
    ---
    tags:
      - Screening
    description: Uses tfidf_word.pkl, tfidf_char.pkl, and lr_classifier_family.pkl for classification.
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
    responses:
      200:
        description: Match result
      400:
        description: Invalid request
    """
    try:
        data = request.get_json()
        if not data or "cv_data" not in data or "jd_data" not in data:
            return jsonify(
                format_response(
                    message="Missing cv_data or jd_data",
                    status="error",
                    code=400,
                )
            ), 400

        cv_data = DataCleaner.structure_cv_data(data["cv_data"])
        cv_data["predicted_category"] = department_classifier.classify(
            cv_data.get("full_text", "")
        )

        jd_data = DataCleaner.structure_jd_data(data["jd_data"])
        jd_data["job_category"] = department_classifier.classify(
            jd_data.get("full_text", "")
        )

        analysis = similarity_scorer.full_similarity_analysis(cv_data, jd_data)
        overall_score = analysis["final_score"]

        if overall_score >= 80:
            recommendation = "Highly Recommended"
        elif overall_score >= 60:
            recommendation = "Potential Match"
        elif overall_score >= 40:
            recommendation = "Moderate Match"
        else:
            recommendation = "Low Match"

        response_data = {
            "overall_score": overall_score,
            "semantic_score": analysis["semantic_score"],
            "skill_score": analysis["skill_score"],
            "skill_analysis": analysis["skill_analysis"],
            "recommendation": recommendation,
        }

        return jsonify(
            format_response(
                data=response_data,
                message="Semantic matching completed",
            )
        ), 200

    except Exception as e:
        logger.error(f"Matching error: {str(e)}")
        return jsonify(
            format_response(
                message=str(e),
                status="error",
                code=500,
            )
        ), 500


@bp.route("/rank", methods=["POST"])
def rank_candidates():
    """
    Rank multiple candidates against JD
    ---
    tags:
      - Screening
    description: Uses tfidf_word.pkl, tfidf_char.pkl, and lr_classifier_family.pkl for classification.
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
    responses:
      200:
        description: Ranking results
      400:
        description: Invalid request
    """
    try:
        data = request.get_json()
        if not data or "candidates" not in data or "jd_data" not in data:
            return jsonify(
                format_response(
                    message="Missing candidates or jd_data",
                    status="error",
                    code=400,
                )
            ), 400

        candidates = data["candidates"]
        jd_data = DataCleaner.structure_jd_data(data["jd_data"])

        job_category = department_classifier.classify(jd_data.get("full_text", ""))
        jd_data["job_category"] = job_category

        cleaned_candidates = []
        for candidate in candidates:
            try:
                cleaned_candidate = DataCleaner.structure_cv_data(candidate)
                cleaned_candidate["predicted_category"] = department_classifier.classify(
                    cleaned_candidate.get("full_text", "")
                )
                cleaned_candidates.append(cleaned_candidate)
            except Exception as e:
                logger.warning(f"Candidate cleaning failed: {str(e)}")

        ranked_candidates = job_matcher.rank_candidates(cleaned_candidates, jd_data)

        response_data = {
            "total_candidates": len(ranked_candidates),
            "ranked_candidates": ranked_candidates,
            "job_category": job_category,
        }

        return jsonify(
            format_response(
                data=response_data,
                message=f"Ranked {len(ranked_candidates)} candidates successfully",
            )
        ), 200

    except Exception as e:
        logger.error(f"Ranking error: {str(e)}")
        return jsonify(
            format_response(
                message=str(e),
                status="error",
                code=500,
            )
        ), 500


@bp.route("/classify-text", methods=["POST"])
def classify_text():
    """
    Classify CV text using TF-IDF + Logistic Regression
    ---
    tags:
      - Screening
    description: Uses tfidf_word.pkl, tfidf_char.pkl, and lr_classifier_family.pkl.
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
    responses:
      200:
        description: Classification result
      400:
        description: Invalid request
    """
    try:
        data = request.get_json() or {}
        text = data.get("text", "")
        if not text:
            return jsonify(
                format_response(
                    message="Missing text",
                    status="error",
                    code=400,
                )
            ), 400

        result = job_family_classifier.predict(text)
        return jsonify(
            format_response(
                data=result,
                message="Classification completed",
            )
        ), 200

    except Exception as exc:
        logger.error(f"Classification error: {exc}")
        return jsonify(
            format_response(
                message=str(exc),
                status="error",
                code=500,
            )
        ), 500
