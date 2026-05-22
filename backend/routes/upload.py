"""
Upload routes for CV and JD files
"""

from flask import Blueprint, request, jsonify, current_app, g
import logging

from utils.file_handler import save_uploaded_file
from utils.helpers import format_response, generate_candidate_id
from services.data_cleaner import DataCleaner
from services.department_classifier import DepartmentClassifier
from services.job_classifier import JobFamilyClassifier
from services.cv_parser import CVParser
from services import firebase_db
from routes.auth import require_auth
from config import Config

bp = Blueprint("upload", __name__, url_prefix="/api/upload")
logger = logging.getLogger(__name__)

department_classifier = DepartmentClassifier()
job_family_classifier = JobFamilyClassifier(
    word_vectorizer_path=Config.TFIDF_WORD_PATH,
    char_vectorizer_path=Config.TFIDF_CHAR_PATH,
    classifier_path=Config.LR_CLASSIFIER_PATH,
)
cv_parser = CVParser(api_key=Config.LLAMA_API_KEY or None)


@bp.route("/cv", methods=["POST"])
@require_auth
def upload_cv():
    """
    Upload and parse CV file
    ---
    tags:
      - Upload
    description: Uses tfidf_word.pkl, tfidf_char.pkl, and lr_classifier_family.pkl for classification.
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: file
        type: file
        required: true
    responses:
      200:
        description: CV uploaded
      400:
        description: Invalid request
    """
    try:
        if "file" not in request.files:
            return jsonify(
                format_response(
                    message="No file provided",
                    status="error",
                    code=400,
                )
            ), 400

        file = request.files["file"]
        upload_folder = current_app.config["UPLOAD_FOLDER"]

        success, result = save_uploaded_file(file, upload_folder)
        if not success:
            return jsonify(
                format_response(
                    message=result,
                    status="error",
                    code=400,
                )
            ), 400

        raw_text = ""
        raw_data = None
        parsed_source = ""
        try:
            if result.lower().endswith(".txt"):
                with open(result, "r", encoding="utf-8", errors="ignore") as f:
                    raw_text = f.read()
                parsed_source = "plain_text"
            elif Config.LLAMA_API_KEY:
                parsed = cv_parser.parse_cv(result)
                raw_text = parsed.get("raw_text", "")
                raw_data = parsed
                parsed_source = "llama_parse"
        except Exception as exc:
            logger.warning(f"CV parsing fallback used: {exc}")
            raw_text = raw_text or ""

        if raw_data is None:
            raw_data = {
                "name": file.filename.rsplit(".", 1)[0],
                "email": "",
                "phone": "",
                "skills": [],
                "experience": "",
                "education": "",
                "summary": "",
                "raw_text": raw_text,
            }

        cleaned_data = DataCleaner.structure_cv_data(raw_data)

        candidate_id = generate_candidate_id(
            cleaned_data["name"],
            cleaned_data["email"],
        )

        summary = cleaned_data.get("summary") or ""
        if not summary and raw_text:
            snippet = raw_text.strip().replace("\n", " ")
            summary = (snippet[:300] + "...") if len(snippet) > 300 else snippet

        prediction = job_family_classifier.predict(cleaned_data.get("full_text", ""))

        project_id = request.form.get("project_id", "") or (request.get_json() or {}).get("project_id", "")

        response_data = {
            "candidate_id": candidate_id,
            "candidate_name": cleaned_data["name"],
            "email": cleaned_data["email"],
            "skills": cleaned_data["skills"],
            "summary": summary,
            "full_text": cleaned_data.get("full_text", ""),
            "predicted_label": prediction["label"],
            "prediction_confidence": prediction["confidence"],
            "parsed_source": parsed_source or "none",
            "project_id": project_id,
            "owner": g.current_username,
        }

        # Persist candidate per-user to Firestore (or JSON fallback)
        firebase_db.save_candidate(
            owner=g.current_username,
            project_id=project_id,
            candidate_id=candidate_id,
            data=response_data,
        )

        return jsonify(
            format_response(
                data=response_data,
                message="cv uploaded successfully",
            )
        ), 200

    except Exception as e:
        logger.error(f"Error uploading CV: {str(e)}")
        return jsonify(
            format_response(
                message=f"Error: {str(e)}",
                status="error",
                code=500,
            )
        ), 500


@bp.route("/candidates", methods=["GET"])
@require_auth
def get_my_candidates():
    """
    Get all candidates uploaded by current user (optionally filtered by project)
    ---
    tags:
      - Upload
    security:
      - BearerAuth: []
    responses:
      200:
        description: Candidate list
    """
    project_id = request.args.get("project_id")
    candidates = firebase_db.list_candidates(owner=g.current_username, project_id=project_id)
    if candidates is None:
        candidates = []
    return jsonify(format_response(
        data={"candidates": candidates},
        message=f"Retrieved {len(candidates)} candidates",
    )), 200


@bp.route("/jd", methods=["POST"])
@require_auth
def upload_jd():
    """
    Upload Job Description (can be file or text)
    ---
    tags:
      - Upload
    description: Uses tfidf_word.pkl, tfidf_char.pkl, and lr_classifier_family.pkl for classification reference.
    consumes:
      - multipart/form-data
      - application/json
    parameters:
      - in: formData
        name: file
        type: file
        required: false
      - in: body
        name: body
        required: false
    responses:
      200:
        description: JD uploaded
      400:
        description: Invalid request
    """
    try:
        jd_text = None

        if "file" in request.files:
            file = request.files["file"]
            upload_folder = current_app.config["UPLOAD_FOLDER"]

            success, result = save_uploaded_file(file, upload_folder)
            if not success:
                return jsonify(
                    format_response(
                        message=result,
                        status="error",
                        code=400,
                    )
                ), 400

            jd_text = ""
            try:
                if result.lower().endswith(".txt"):
                    with open(result, "r", encoding="utf-8", errors="ignore") as f:
                        jd_text = f.read()
            except Exception:
                jd_text = ""

        elif request.is_json and "text" in (request.json or {}):
            jd_text = request.json["text"]
        else:
            return jsonify(
                format_response(
                    message="No JD file or text provided",
                    status="error",
                    code=400,
                )
            ), 400

        jd_data = {
            "title": request.json.get("title", "Job Position") if request.is_json else "Job Position",
            "department": request.json.get("department", "") if request.is_json else "",
            "description": jd_text,
            "requirements": request.json.get("requirements", "") if request.is_json else "",
            "required_skills": request.json.get("required_skills", []) if request.is_json else [],
            "preferred_skills": request.json.get("preferred_skills", []) if request.is_json else [],
            "full_text": jd_text,
        }

        cleaned_jd = DataCleaner.structure_jd_data(jd_data)

        job_category = department_classifier.classify(cleaned_jd.get("full_text", ""))

        response_data = {
            "jd_id": "JD_" + str(hash(jd_text))[-8:].upper(),
            "job_title": cleaned_jd["job_title"],
            "required_skills": cleaned_jd["required_skills"],
            "preferred_skills": cleaned_jd["preferred_skills"],
            "job_category": job_category,
            "full_text": cleaned_jd.get("full_text", ""),
        }

        return jsonify(
            format_response(
                data=response_data,
                message="jd uploaded successfully",
            )
        ), 200

    except Exception as e:
        logger.error(f"Error uploading JD: {str(e)}")
        return jsonify(
            format_response(
                message=f"Error: {str(e)}",
                status="error",
                code=500,
            )
        ), 500
