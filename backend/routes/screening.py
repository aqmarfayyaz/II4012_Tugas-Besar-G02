from flask import Blueprint, request, jsonify, g
import logging
import os
import uuid
from datetime import datetime

from services.cv_parser import CVParser
from models.embedder import TextEmbedder
from services.similarity_scorer import SimilarityScorer
from services.job_matcher import JobMatcher
from services.data_cleaner import DataCleaner
from services.department_classifier import DepartmentClassifier
from services.job_classifier import JobFamilyClassifier
from services import firebase_db
from routes.auth import require_auth
from config import Config

from utils.helpers import format_response
from services.activity_log import log_activity

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


def _recommendation_for_score(score: float) -> str:
    if score >= 80:
        return "Highly Recommended"
    if score >= 60:
        return "Potential Match"
    if score >= 40:
        return "Moderate Match"
    return "Low Match"


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

        try:
            parsed_data = cv_parser.parse_cv(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        raw_text = parsed_data.get("raw_text", "")
        if raw_text:
            clf_result = job_family_classifier.predict(raw_text)
            parsed_data["predicted_family"] = clf_result.get("label")
            parsed_data["confidence"] = clf_result.get("confidence")
            parsed_data["probabilities"] = clf_result.get("probabilities", {})
            parsed_data["needs_human_review"] = clf_result.get("confidence", 0) < 0.75

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
        if not cv_data.get("predicted_category"):
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
                if not cleaned_candidate.get("predicted_category"):
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


@bp.route("/save-results", methods=["POST"])
@require_auth
def save_results():
    """
    Save screening result to Firestore for current user
    ---
    tags:
      - Screening
    security:
      - BearerAuth: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            project_id:
              type: string
            ranked_candidates:
              type: array
            jd_data:
              type: object
            job_category:
              type: string
    responses:
      201:
        description: Result saved
    """
    try:
        data = request.get_json() or {}
        project_id = data.get("project_id", "")
        result_id = str(uuid.uuid4())
        doc = {
            "result_id": result_id,
            "project_id": project_id,
            "ranked_candidates": data.get("ranked_candidates", []),
            "jd_data": data.get("jd_data", {}),
            "job_category": data.get("job_category", ""),
            "total_candidates": data.get("total_candidates", 0),
            "created_at": datetime.utcnow().isoformat(),
        }
        saved = firebase_db.save_screening_result(
            owner=g.current_username,
            project_id=project_id,
            result_id=result_id,
            data=doc,
        )

        ranked_candidates = data.get("ranked_candidates", [])
        for candidate in ranked_candidates:
            candidate_id = candidate.get("candidate_id")
            if not candidate_id:
                continue
            score = float(candidate.get("overall_score", 0))
            firebase_db.update_candidate(
                candidate_id,
                {
                    "match_score": score,
                    "similarity_score": float(candidate.get("similarity_score", 0)),
                    "skill_score": float(candidate.get("skill_score", 0)),
                    "skill_details": candidate.get("skill_details", {}),
                    "recommendation": _recommendation_for_score(score),
                    "rank": candidate.get("rank", 0),
                    "last_screened_at": doc["created_at"],
                    "screening_result_id": result_id,
                },
            )
        n = len(data.get("ranked_candidates", []))
        log_activity(
            owner=g.current_username,
            event_type="screening_complete",
            title="AI Screening Completed",
            detail=f"{n} candidate{'s' if n != 1 else ''} ranked · {data.get('job_category', '')}",
            link=f"/ranking",
        )

        return jsonify(format_response(
            data={"result_id": result_id, "saved_to_firestore": saved},
            message="Screening result saved",
            code=201,
        )), 201
    except Exception as exc:
        logger.error(f"save_results error: {exc}")
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500


@bp.route("/results", methods=["GET"])
@require_auth
def get_results():
    """
    Get screening results for current user
    ---
    tags:
      - Screening
    security:
      - BearerAuth: []
    parameters:
      - in: query
        name: project_id
        type: string
        required: false
    responses:
      200:
        description: Screening results list
    """
    try:
        project_id = request.args.get("project_id")
        results = firebase_db.list_screening_results(
            owner=g.current_username, project_id=project_id
        )
        if results is None:
            results = []
        return jsonify(format_response(
            data={"results": results, "total": len(results)},
            message=f"Retrieved {len(results)} screening results",
        )), 200
    except Exception as exc:
        logger.error(f"get_results error: {exc}")
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500
