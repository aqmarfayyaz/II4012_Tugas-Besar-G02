"""
AI-Powered Screening Routes
CV Parsing + Embedding + Semantic Matching
"""

from flask import Blueprint, request, jsonify
import logging

import os

from services.cv_parser import CVParser
from services.embedder import TextEmbedder
from services.similarity_scorer import SimilarityScorer
from services.job_matcher import JobMatcher
from services.data_cleaner import DataCleaner
from models.classifier import JobCategoryClassifier, CONFIDENCE_THRESHOLD

from utils.helpers import format_response

bp = Blueprint(
    "screening",
    __name__,
    url_prefix="/api/screening"
)

logger = logging.getLogger(__name__)

# ==========================================
# Initialize AI Services
# ==========================================

embedder = TextEmbedder()

similarity_scorer = SimilarityScorer(
    embedder=embedder
)

job_matcher = JobMatcher(
    similarity_scorer=similarity_scorer
)

cv_parser = CVParser()

classifier = JobCategoryClassifier()


# ==========================================
# Parse CV Endpoint
# ==========================================

@bp.route("/parse-cv", methods=["POST"])
def parse_cv():
    """
    Parse uploaded CV using LlamaParse + OpenAI
    """

    try:

        if "file" not in request.files:

            return jsonify(
                format_response(
                    message="No file uploaded",
                    status="error",
                    code=400
                )
            ), 400

        file = request.files["file"]

        if file.filename == "":

            return jsonify(
                format_response(
                    message="Empty filename",
                    status="error",
                    code=400
                )
            ), 400

        temp_path = f"temp_{file.filename}"

        file.save(temp_path)

        try:
            parsed_data = cv_parser.parse_cv(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        # Run job-family classification using pkl model when available
        if classifier.is_loaded:
            text_for_clf = parsed_data.get("raw_text", "")
            if text_for_clf:
                pred, conf = classifier.predict(text_for_clf)
                parsed_data["predicted_family"] = pred
                parsed_data["confidence"] = round(conf, 4)
                parsed_data["probabilities"] = classifier.predict_proba(
                    text_for_clf
                )
                parsed_data["needs_human_review"] = conf < CONFIDENCE_THRESHOLD

        return jsonify(
            format_response(
                data=parsed_data,
                message="CV parsed successfully"
            )
        ), 200

    except Exception as e:

        logger.error(
            f"CV parsing error: {str(e)}"
        )

        return jsonify(
            format_response(
                message=str(e),
                status="error",
                code=500
            )
        ), 500


# ==========================================
# Match Single CV Against JD
# ==========================================

@bp.route("/match", methods=["POST"])
def match_cv_jd():
    """
    Match single CV against job description
    """

    try:

        data = request.get_json()

        if (
            not data or
            "cv_data" not in data or
            "jd_data" not in data
        ):

            return jsonify(
                format_response(
                    message="Missing cv_data or jd_data",
                    status="error",
                    code=400
                )
            ), 400

        cv_data = (
            DataCleaner.structure_cv_data(
                data["cv_data"]
            )
        )

        jd_data = (
            DataCleaner.structure_jd_data(
                data["jd_data"]
            )
        )

        # AI Similarity Analysis
        analysis = (
            similarity_scorer
            .full_similarity_analysis(
                cv_data,
                jd_data
            )
        )

        overall_score = (
            analysis["final_score"]
        )

        # Generate recommendation
        if overall_score >= 80:

            recommendation = (
                "Highly Recommended"
            )

        elif overall_score >= 60:

            recommendation = (
                "Potential Match"
            )

        elif overall_score >= 40:

            recommendation = (
                "Moderate Match"
            )

        else:

            recommendation = (
                "Low Match"
            )

        response_data = {

            "overall_score":
                overall_score,

            "semantic_score":
                analysis["semantic_score"],

            "skill_score":
                analysis["skill_score"],

            "skill_analysis":
                analysis["skill_analysis"],

            "recommendation":
                recommendation
        }

        return jsonify(
            format_response(
                data=response_data,
                message="Semantic matching completed"
            )
        ), 200

    except Exception as e:

        logger.error(
            f"Matching error: {str(e)}"
        )

        return jsonify(
            format_response(
                message=str(e),
                status="error",
                code=500
            )
        ), 500


# ==========================================
# Rank Multiple Candidates
# ==========================================

@bp.route("/rank", methods=["POST"])
def rank_candidates():
    """
    Rank multiple candidates against JD
    """

    try:

        data = request.get_json()

        if (
            not data or
            "candidates" not in data or
            "jd_data" not in data
        ):

            return jsonify(
                format_response(
                    message="Missing candidates or jd_data",
                    status="error",
                    code=400
                )
            ), 400

        candidates = data["candidates"]

        jd_data = (
            DataCleaner.structure_jd_data(
                data["jd_data"]
            )
        )

        cleaned_candidates = []

        for candidate in candidates:

            try:

                cleaned_candidate = (
                    DataCleaner.structure_cv_data(
                        candidate
                    )
                )

                cleaned_candidates.append(
                    cleaned_candidate
                )

            except Exception as e:

                logger.warning(
                    f"Candidate cleaning failed: {str(e)}"
                )

        ranked_candidates = (
            job_matcher.rank_candidates(
                cleaned_candidates,
                jd_data
            )
        )

        response_data = {

            "total_candidates":
                len(ranked_candidates),

            "ranked_candidates":
                ranked_candidates
        }

        return jsonify(
            format_response(
                data=response_data,
                message=f"""
                Ranked
                {len(ranked_candidates)}
                candidates successfully
                """
            )
        ), 200

    except Exception as e:

        logger.error(
            f"Ranking error: {str(e)}"
        )

        return jsonify(
            format_response(
                message=str(e),
                status="error",
                code=500
            )
        ), 500