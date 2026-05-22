"""
Candidate management routes — data stored per-user in Firestore (JSON fallback).
"""

from flask import Blueprint, request, jsonify, g
import logging

from utils.helpers import format_response
from routes.auth import require_auth
from services import firebase_db

bp = Blueprint("candidates", __name__, url_prefix="/api/candidates")
logger = logging.getLogger(__name__)


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
    responses:
      200:
        description: Candidate list
    """
    try:
        project_id = request.args.get("project_id")
        candidates = firebase_db.list_candidates(
            owner=g.current_username, project_id=project_id
        )
        if candidates is None:
            candidates = []
        return jsonify(format_response(
            data={"candidates": candidates},
            message=f"Retrieved {len(candidates)} candidates",
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
        return jsonify(format_response(data=candidate, message="Candidate retrieved")), 200
    except Exception as exc:
        logger.error(f"get_candidate: {exc}")
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
