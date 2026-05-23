"""
Activity log endpoint — returns per-user event history.
"""
from flask import Blueprint, request, jsonify, g

from routes.auth import require_auth
from services.activity_log import list_activities
from utils.helpers import format_response

bp = Blueprint("activity", __name__, url_prefix="/api/activity")


@bp.route("", methods=["GET"])
@require_auth
def get_activity():
    """
    Get activity log for the current user
    ---
    tags:
      - Activity
    security:
      - BearerAuth: []
    parameters:
      - in: query
        name: limit
        type: integer
        required: false
        description: "Max number of events to return (default 50)"
    responses:
      200:
        description: Activity events
    """
    limit = int(request.args.get("limit", "50") or 50)
    events = list_activities(owner=g.current_username, limit=limit)
    return jsonify(format_response(
        data={"events": events, "total": len(events)},
        message=f"Retrieved {len(events)} events",
    )), 200
