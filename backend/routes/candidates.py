"""
Candidate management routes — data stored per-user in Firestore (JSON fallback).
"""

from flask import Blueprint, request, jsonify, g, send_file
import json
import logging
import os

from utils.helpers import format_response
from routes.auth import require_auth
from services import firebase_db

bp = Blueprint("candidates", __name__, url_prefix="/api/candidates")
logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
PROJECTS_FILE = os.path.join(DATA_DIR, "projects.json")

ALLOWED_STATUS = {"applied", "review", "shortlisted", "interviewed", "rejected"}


def _load_projects_json() -> dict:
  if not os.path.exists(PROJECTS_FILE):
    return {}
  with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
    return json.load(f)


def _get_project(project_id: str) -> dict:
  if not project_id:
    return {}
  if firebase_db.is_available():
    result = firebase_db.get_project(project_id)
    if result is not None:
      return result or {}
  return _load_projects_json().get(project_id, {})


def _recommendation_for_score(score: float) -> str:
  if score >= 80:
    return "Highly Recommended"
  if score >= 60:
    return "Potential Match"
  if score >= 40:
    return "Moderate Match"
  return "Low Match"


def _latest_score_map(owner: str, project_id: str) -> dict:
  if not project_id:
    return {}
  results = firebase_db.list_screening_results(owner=owner, project_id=project_id) or []
  if not results:
    return {}
  latest = results[0]
  ranked = latest.get("ranked_candidates", [])
  score_map = {}
  for candidate in ranked:
    candidate_id = candidate.get("candidate_id")
    if not candidate_id:
      continue
    score = float(candidate.get("overall_score", 0))
    score_map[candidate_id] = {
      "match_score": score,
      "similarity_score": float(candidate.get("similarity_score", 0)),
      "skill_score": float(candidate.get("skill_score", 0)),
      "skill_details": candidate.get("skill_details", {}),
      "recommendation": _recommendation_for_score(score),
      "rank": candidate.get("rank", 0),
    }
  return score_map


def _normalize_status(value: str) -> str:
  if not value:
    return "applied"
  value = value.lower().strip()
  return value if value in ALLOWED_STATUS else "applied"


def _candidate_view(candidate: dict, project: dict, score_map: dict) -> dict:
  candidate_id = candidate.get("id") or candidate.get("candidate_id")
  score_data = score_map.get(candidate_id, {})

  match_score = candidate.get("match_score")
  if match_score is None:
    match_score = score_data.get("match_score", 0)

  recommendation = candidate.get("recommendation") or score_data.get("recommendation", "")
  skill_details = candidate.get("skill_details") or score_data.get("skill_details") or {}

  return {
    "id": candidate_id,
    "candidate_id": candidate_id,
    "name": candidate.get("candidate_name") or candidate.get("name", ""),
    "email": candidate.get("email", ""),
    "applied_position": candidate.get("applied_position") or project.get("job_title", ""),
    "department": candidate.get("department") or project.get("department", ""),
    "match_score": float(match_score or 0),
    "status": _normalize_status(candidate.get("status")),
    "skills": candidate.get("skills", []),
    "summary": candidate.get("summary", ""),
    "experience_text": candidate.get("experience_text", ""),
    "education_text": candidate.get("education_text", ""),
    "recommendation": recommendation,
    "skill_details": skill_details,
    "rank": candidate.get("rank", score_data.get("rank", 0)),
    "created_at": candidate.get("created_at", ""),
    "project_id": candidate.get("project_id", ""),
    "cv_file_name": candidate.get("cv_file_name", ""),
    "cv_download_url": f"/api/candidates/{candidate_id}/cv" if candidate.get("cv_file_path") else "",
  }


@bp.route("", methods=["GET"])
@require_auth
def get_candidates():
    """
    Get all candidates for current user
    ---
    tags:
      - Candidates
    security:
      - BearerAuth: []
    parameters:
      - in: query
        name: project_id
        type: string
        required: false
      - in: query
        name: search
        type: string
        required: false
      - in: query
        name: status
        type: string
        required: false
      - in: query
        name: min_score
        type: number
        required: false
      - in: query
        name: max_score
        type: number
        required: false
      - in: query
        name: page
        type: integer
        required: false
      - in: query
        name: page_size
        type: integer
        required: false
    responses:
      200:
        description: Candidate list
    """
    try:
        project_id = request.args.get("project_id", "")
        search = request.args.get("search", "").strip().lower()
        status_param = request.args.get("status", "").strip().lower()
        min_score = request.args.get("min_score")
        max_score = request.args.get("max_score")
        page = int(request.args.get("page", "1") or 1)
        page_size = int(request.args.get("page_size", "20") or 20)

        candidates = firebase_db.list_candidates(
            owner=g.current_username, project_id=project_id or None
        ) or []

        project = _get_project(project_id)
        score_map = _latest_score_map(g.current_username, project_id)
        enriched = [_candidate_view(candidate, project, score_map) for candidate in candidates]

        if search:
            def matches(item):
                return (
                    search in (item.get("name") or "").lower()
                    or search in (item.get("email") or "").lower()
                    or search in (item.get("applied_position") or "").lower()
                )
            enriched = [c for c in enriched if matches(c)]

        if status_param:
            statuses = {s.strip() for s in status_param.split(",") if s.strip()}
            enriched = [c for c in enriched if c.get("status") in statuses]

        if min_score is not None:
            try:
                min_score_val = float(min_score)
                enriched = [c for c in enriched if float(c.get("match_score", 0)) >= min_score_val]
            except ValueError:
                pass

        if max_score is not None:
            try:
                max_score_val = float(max_score)
                enriched = [c for c in enriched if float(c.get("match_score", 0)) <= max_score_val]
            except ValueError:
                pass

        enriched.sort(key=lambda x: (x.get("match_score", 0), x.get("created_at", "")), reverse=True)

        total = len(enriched)
        page = max(page, 1)
        page_size = max(min(page_size, 100), 1)
        start = (page - 1) * page_size
        end = start + page_size
        paginated = enriched[start:end]

        return jsonify(format_response(
            data={
                "candidates": paginated,
                "total": total,
                "page": page,
                "page_size": page_size,
            },
            message=f"Retrieved {len(paginated)} candidates",
        )), 200
    except Exception as exc:
        logger.error(f"get_candidates: {exc}")
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500


@bp.route("/<candidate_id>", methods=["GET"])
@require_auth
def get_candidate(candidate_id):
    """
    Get candidate details
    ---
    tags:
      - Candidates
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: candidate_id
        type: string
        required: true
    responses:
      200:
        description: Candidate details
      404:
        description: Not found
    """
    try:
        candidate = firebase_db.get_candidate(candidate_id)
        if not candidate:
            return jsonify(format_response(
                message="Candidate not found", status="error", code=404
            )), 404
        # Enforce ownership
        if candidate.get("owner") and candidate["owner"] != g.current_username:
            return jsonify(format_response(
                message="Not found", status="error", code=404
            )), 404
        project = _get_project(candidate.get("project_id", ""))
        score_map = _latest_score_map(g.current_username, candidate.get("project_id", ""))
        payload = _candidate_view(candidate, project, score_map)
        return jsonify(format_response(data=payload, message="Candidate retrieved")), 200
    except Exception as exc:
        logger.error(f"get_candidate: {exc}")
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500


@bp.route("/<candidate_id>/status", methods=["PATCH"])
@require_auth
def update_candidate_status(candidate_id):
    """
    Update candidate status
    ---
    tags:
      - Candidates
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: candidate_id
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - status
          properties:
            status:
              type: string
              enum: [applied, review, shortlisted, interviewed, rejected]
    responses:
      200:
        description: Status updated
      400:
        description: Validation error
      404:
        description: Not found
    """
    try:
        candidate = firebase_db.get_candidate(candidate_id)
        if not candidate:
            return jsonify(format_response(
                message="Candidate not found", status="error", code=404
            )), 404
        if candidate.get("owner") and candidate["owner"] != g.current_username:
            return jsonify(format_response(
                message="Not found", status="error", code=404
            )), 404

        data = request.get_json() or {}
        raw_status = (data.get("status") or "").lower().strip()
        if raw_status not in ALLOWED_STATUS:
            return jsonify(format_response(
                message="Invalid status", status="error", code=400
            )), 400

        status = raw_status

        updated = firebase_db.update_candidate(candidate_id, {"status": status})
        if not updated:
            return jsonify(format_response(
                message="Failed to update candidate", status="error", code=500
            )), 500

        return jsonify(format_response(
            data={"candidate_id": candidate_id, "status": status},
            message="Candidate status updated",
        )), 200
    except Exception as exc:
        logger.error(f"update_candidate_status: {exc}")
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500


@bp.route("/<candidate_id>/cv", methods=["GET"])
@require_auth
def download_candidate_cv(candidate_id):
    """
    Download candidate CV file
    ---
    tags:
      - Candidates
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: candidate_id
        type: string
        required: true
    responses:
      200:
        description: CV file
      404:
        description: Not found
    """
    try:
        candidate = firebase_db.get_candidate(candidate_id)
        if not candidate:
            return jsonify(format_response(
                message="Candidate not found", status="error", code=404
            )), 404
        if candidate.get("owner") and candidate["owner"] != g.current_username:
            return jsonify(format_response(
                message="Not found", status="error", code=404
            )), 404

        file_path = candidate.get("cv_file_path", "")
        if not file_path or not os.path.exists(file_path):
            return jsonify(format_response(
                message="CV file not found", status="error", code=404
            )), 404

        return send_file(file_path, as_attachment=True)
    except Exception as exc:
        logger.error(f"download_candidate_cv: {exc}")
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500


@bp.route("", methods=["POST"])
@require_auth
def create_candidate():
    """
    Manually create a candidate record
    ---
    tags:
      - Candidates
    security:
      - BearerAuth: []
    parameters:
      - in: body
        name: body
        required: true
    responses:
      201:
        description: Candidate created
    """
    try:
        data = request.get_json() or {}
        candidate_id = data.get("candidate_id")
        if not candidate_id:
            return jsonify(format_response(
                message="candidate_id required", status="error", code=400
            )), 400

        project_id = data.get("project_id", "")
        saved = firebase_db.save_candidate(
            owner=g.current_username,
            project_id=project_id,
            candidate_id=candidate_id,
            data={**data, "owner": g.current_username},
        )
        if not saved:
            return jsonify(format_response(
                message="Failed to save candidate (Firestore not configured)", status="error", code=503
            )), 503

        return jsonify(format_response(
            data={"candidate_id": candidate_id},
            message="Candidate created",
            code=201,
        )), 201
    except Exception as exc:
        logger.error(f"create_candidate: {exc}")
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500


@bp.route("/<candidate_id>", methods=["DELETE"])
@require_auth
def delete_candidate(candidate_id):
    """
    Delete candidate
    ---
    tags:
      - Candidates
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: candidate_id
        type: string
        required: true
    responses:
      200:
        description: Deleted
      404:
        description: Not found
    """
    try:
        candidate = firebase_db.get_candidate(candidate_id)
        if not candidate:
            return jsonify(format_response(
                message="Candidate not found", status="error", code=404
            )), 404
        if candidate.get("owner") and candidate["owner"] != g.current_username:
            return jsonify(format_response(
                message="Not found", status="error", code=404
            )), 404

        firebase_db.delete_candidate(candidate_id)
        return jsonify(format_response(message="Candidate deleted")), 200
    except Exception as exc:
        logger.error(f"delete_candidate: {exc}")
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500
