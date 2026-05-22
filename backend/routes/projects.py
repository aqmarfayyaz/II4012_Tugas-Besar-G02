"""
Project management routes — stores data in Firebase Firestore
(falls back to local projects.json when Firebase is not configured).
"""

from flask import Blueprint, request, jsonify, g
import json
import os
import uuid
from datetime import datetime

from utils.helpers import format_response
from routes.auth import require_auth
from services import firebase_db
from routes.candidates import _candidate_view, _get_project, _latest_score_map

bp = Blueprint("projects", __name__, url_prefix="/api/projects")

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
PROJECTS_FILE = os.path.join(DATA_DIR, "projects.json")

REQUIRED_FIELDS = [
    "name",
    "job_title",
    "department",
    "job_description",
    "required_skills",
    "employment_type",
    "start_date",
    "end_date",
]

ALLOWED_EMPLOYMENT_TYPES = {"full-time", "internship", "contract"}
ALLOWED_STATUS = {"draft", "active", "closed"}


# ─── Local JSON storage (fallback) ────────────────────────────────────────

def _ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(PROJECTS_FILE):
        with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)


def _json_load() -> dict:
    _ensure_data_dir()
    with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _json_save(projects: dict) -> None:
    _ensure_data_dir()
    with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2)


# ─── Storage abstraction (Firestore ↔ JSON) ───────────────────────────────

def _load_all(owner: str = None) -> dict:
    """Return {project_id: project_dict}, optionally filtered by owner."""
    if firebase_db.is_available():
        result = firebase_db.list_projects(owner=owner)
        if result is not None:
            return {p["id"]: p for p in result}
    all_projects = _json_load()
    if owner:
        return {pid: p for pid, p in all_projects.items() if p.get("created_by") == owner}
    return all_projects


def _get_one(project_id: str):
    """Return project dict or None."""
    if firebase_db.is_available():
        result = firebase_db.get_project(project_id)
        if result is None:
            # Firestore call failed — fall back
            return _json_load().get(project_id)
        return result if result else None  # {} means not found
    return _json_load().get(project_id)


def _save_one(project_id: str, project: dict) -> None:
    if firebase_db.is_available():
        if firebase_db.save_project(project_id, project):
            return
    # fallback
    projects = _json_load()
    projects[project_id] = project
    _json_save(projects)


def _delete_one(project_id: str) -> None:
    if firebase_db.is_available():
        if firebase_db.delete_project(project_id):
            return
    # fallback
    projects = _json_load()
    projects.pop(project_id, None)
    _json_save(projects)


# ─── Validation helpers ───────────────────────────────────────────────────

def _normalize_skills(value):
    if isinstance(value, list):
        return [item.strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return []


def _validate_payload(data, partial=False):
    if not partial:
        missing = [f for f in REQUIRED_FIELDS if not data.get(f)]
        if missing:
            return False, f"Missing fields: {', '.join(missing)}"

    employment_type = data.get("employment_type")
    if employment_type and employment_type not in ALLOWED_EMPLOYMENT_TYPES:
        return False, "Invalid employment_type"

    status = data.get("status")
    if status and status not in ALLOWED_STATUS:
        return False, "Invalid status"

    return True, None


# ─── Routes ───────────────────────────────────────────────────────────────

@bp.route("", methods=["GET"])
@require_auth
def list_projects():
    """
    List projects
    ---
    tags:
      - Projects
    security:
      - BearerAuth: []
    responses:
      200:
        description: Projects retrieved
      401:
        description: Unauthorized
    """
    projects = _load_all(owner=g.current_username)
    project_list = list(projects.values())
    return jsonify(format_response(
        data={"projects": project_list},
        message=f"Retrieved {len(project_list)} projects",
    )), 200


@bp.route("/<project_id>/candidates", methods=["GET"])
@require_auth
def get_project_candidates(project_id):
    """
    Get candidates for a specific project
    ---
    tags:
      - Projects
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: project_id
        required: true
        type: string
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
        search = request.args.get("search", "").strip().lower()
        status_param = request.args.get("status", "").strip().lower()
        min_score = request.args.get("min_score")
        max_score = request.args.get("max_score")
        page = int(request.args.get("page", "1") or 1)
        page_size = int(request.args.get("page_size", "20") or 20)

        candidates = firebase_db.list_candidates(
            owner=g.current_username, project_id=project_id
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
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500


@bp.route("", methods=["POST"])
@require_auth
def create_project():
    """
    Create project
    ---
    tags:
      - Projects
    security:
      - BearerAuth: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - job_title
            - department
            - job_description
            - required_skills
            - employment_type
            - start_date
            - end_date
    responses:
      201:
        description: Project created
      400:
        description: Validation error
    """
    data = request.get_json() or {}
    valid, error = _validate_payload(data)
    if not valid:
        return jsonify(format_response(message=error, status="error", code=400)), 400

    project_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    project = {
        "id": project_id,
        "name": data.get("name"),
        "job_title": data.get("job_title"),
        "department": data.get("department"),
        "job_description": data.get("job_description"),
        "required_skills": _normalize_skills(data.get("required_skills")),
        "employment_type": data.get("employment_type"),
        "start_date": data.get("start_date"),
        "end_date": data.get("end_date"),
        "hiring_quota": data.get("hiring_quota"),
        "hiring_manager": data.get("hiring_manager"),
        "priority": data.get("priority"),
        "notes": data.get("notes"),
        "status": data.get("status", "draft"),
        "created_by": g.current_username,
        "created_at": now,
        "updated_at": now,
    }

    _save_one(project_id, project)

    return jsonify(format_response(
        data={"project": project},
        message="Project created",
        code=201,
    )), 201


@bp.route("/<project_id>", methods=["GET"])
@require_auth
def get_project(project_id):
    """
    Get project detail
    ---
    tags:
      - Projects
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: project_id
        required: true
        type: string
    responses:
      200:
        description: Project retrieved
      404:
        description: Project not found
    """
    project = _get_one(project_id)
    if not project:
        return jsonify(format_response(
            message="Project not found", status="error", code=404
        )), 404

    return jsonify(format_response(
        data={"project": project},
        message="Project retrieved",
    )), 200


@bp.route("/<project_id>", methods=["PUT"])
@require_auth
def update_project(project_id):
    """
    Update project
    ---
    tags:
      - Projects
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: project_id
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
    responses:
      200:
        description: Project updated
      404:
        description: Project not found
    """
    data = request.get_json() or {}
    valid, error = _validate_payload(data, partial=True)
    if not valid:
        return jsonify(format_response(message=error, status="error", code=400)), 400

    project = _get_one(project_id)
    if not project:
        return jsonify(format_response(
            message="Project not found", status="error", code=404
        )), 404

    if "required_skills" in data:
        data["required_skills"] = _normalize_skills(data["required_skills"])

    project.update(data)
    project["updated_at"] = datetime.utcnow().isoformat()

    _save_one(project_id, project)

    return jsonify(format_response(
        data={"project": project},
        message="Project updated",
    )), 200


@bp.route("/<project_id>", methods=["DELETE"])
@require_auth
def delete_project(project_id):
    """
    Delete project
    ---
    tags:
      - Projects
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: project_id
        required: true
        type: string
    responses:
      200:
        description: Project deleted
      404:
        description: Project not found
    """
    project = _get_one(project_id)
    if not project:
        return jsonify(format_response(
            message="Project not found", status="error", code=404
        )), 404

    _delete_one(project_id)

    return jsonify(format_response(message="Project deleted")), 200
