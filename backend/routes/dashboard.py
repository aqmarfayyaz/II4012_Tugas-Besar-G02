
import json
import logging
import os
from datetime import datetime

from flask import Blueprint, request, jsonify, g

from utils.helpers import format_response
from routes.auth import require_auth
from services import firebase_db

bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")
logger = logging.getLogger(__name__)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_PROJECTS_FILE = os.path.join(_DATA_DIR, "projects.json")

def _load_projects(owner: str) -> list:
    if firebase_db.is_available():
        result = firebase_db.list_projects(owner=owner)
        if result is not None:
            return result
    try:
        with open(_PROJECTS_FILE, "r", encoding="utf-8") as f:
            all_projects = json.load(f)
        return [p for p in all_projects.values() if not owner or p.get("created_by") == owner]
    except Exception:
        return []

def _ts_from_candidate_id(cid: str) -> datetime:
    try:
        ts_part = str(cid).rsplit("_", 1)[-1]
        if len(ts_part) == 14 and ts_part.isdigit():
            return datetime.strptime(ts_part, "%Y%m%d%H%M%S")
    except Exception:
        pass
    return datetime.min

def _generate_insights(all_scored, candidates, projects, job_categories, avg_score):
    insights = []

    if all_scored:
        top = max(all_scored, key=lambda x: x["score"])
        label = "Highly recommended" if top["score"] >= 80 else "Review recommended"
        insights.append({
            "type": "match",
            "text": f"Top candidate {top['name'] or 'Unknown'} scored {top['score']:.0f}% — {label}.",
            "icon": "check_circle",
        })

    if job_categories:
        cat = job_categories[0]
        insights.append({
            "type": "trend",
            "text": (
                f"{cat['category']} has the most applicants "
                f"({cat['count']}) across your projects."
            ),
            "icon": "trending_up",
        })

    if avg_score > 0:
        quality = "strong" if avg_score >= 70 else "moderate" if avg_score >= 50 else "low"
        insights.append({
            "type": "info" if avg_score >= 60 else "alert",
            "text": f"Average match score is {avg_score}% — {quality} overall candidate quality.",
            "icon": "auto_awesome" if avg_score >= 60 else "warning",
        })
    elif candidates and not all_scored:
        insights.append({
            "type": "info",
            "text": (
                f"{len(candidates)} candidate(s) uploaded but not yet screened. "
                "Run AI Screening to get match scores."
            ),
            "icon": "info",
        })

    if not candidates and not projects:
        insights.append({
            "type": "info",
            "text": "Create a project and upload CVs to start using TalentPulse AI.",
            "icon": "rocket_launch",
        })

    return insights[:3]

@bp.route("/metrics", methods=["GET"])
@require_auth
def get_metrics():
    try:
        project_id = request.args.get("project_id") or None
        owner = g.current_username

        candidates = firebase_db.list_candidates(owner=owner, project_id=project_id) or []
        screening_results = (
            firebase_db.list_screening_results(owner=owner, project_id=project_id) or []
        )
        projects = _load_projects(owner=owner)
        if project_id:
            projects = [p for p in projects if p.get("id") == project_id]

        all_scored = []
        for result in screening_results:
            for cand in result.get("ranked_candidates", []):
                score = float(cand.get("overall_score") or cand.get("score") or 0)
                all_scored.append({
                    "score": score,
                    "name": cand.get("candidate_name") or cand.get("name") or "",
                    "email": str(cand.get("email") or "").strip().lower(),
                    "predicted_category": cand.get("predicted_category") or "",
                    "project_id": result.get("project_id") or "",
                })

        total_applicants = len(candidates)
        candidates_screened = len(all_scored)
        shortlisted = sum(1 for c in all_scored if c["score"] >= 80)
        avg_match_score = (
            round(sum(c["score"] for c in all_scored) / len(all_scored), 1)
            if all_scored else 0
        )

        project_map = {p.get("id"): p for p in projects}
        dept_count: dict = {}
        for cand in candidates:
            pid = cand.get("project_id") or ""
            proj = project_map.get(pid)
            dept = (
                proj.get("department") if proj else None
            ) or cand.get("predicted_label") or "Other"
            dept_count[dept] = dept_count.get(dept, 0) + 1

        if not dept_count:
            for p in projects:
                dept = p.get("department") or "Other"
                dept_count[dept] = dept_count.get(dept, 0) + 1

        sorted_depts = sorted(dept_count.items(), key=lambda x: x[1], reverse=True)[:6]
        job_categories = [{"category": d, "count": c} for d, c in sorted_depts]

        low = sum(1 for c in all_scored if c["score"] < 40)
        medium = sum(1 for c in all_scored if 40 <= c["score"] < 80)
        high = sum(1 for c in all_scored if c["score"] >= 80)
        score_distribution = [
            {"range": "LOW (0-39)", "count": low},
            {"range": "MED (40-79)", "count": medium},
            {"range": "HIGH (80+)", "count": high},
        ]

        if candidates_screened > 0:
            high_pct = round(high / candidates_screened * 100)
            med_pct = round(medium / candidates_screened * 100)
            low_pct = 100 - high_pct - med_pct
        else:
            high_pct = med_pct = low_pct = 0
        match_quality = {
            "analyzed": candidates_screened,
            "high_match": high_pct,
            "medium_match": med_pct,
            "low_match": low_pct,
        }

        sorted_candidates = sorted(
            candidates,
            key=lambda c: _ts_from_candidate_id(c.get("candidate_id") or c.get("id") or ""),
            reverse=True,
        )
        score_by_email: dict = {}
        for c in all_scored:
            email = c["email"]
            if email and c["score"] > score_by_email.get(email, -1):
                score_by_email[email] = c["score"]

        latest_submissions = []
        for cand in sorted_candidates[:5]:
            email = str(cand.get("email") or "").strip().lower()
            score = score_by_email.get(email)
            if score is None:
                status = "PENDING"
            elif score >= 80:
                status = "HIGH MATCH"
            elif score >= 40:
                status = "MED MATCH"
            else:
                status = "LOW MATCH"

            pid = cand.get("project_id") or ""
            proj = project_map.get(pid)
            position = (
                (proj.get("job_title") if proj else None)
                or cand.get("predicted_label")
                or "—"
            )
            cid = cand.get("candidate_id") or cand.get("id") or ""
            ts = _ts_from_candidate_id(cid)
            uploaded_at = ts.isoformat() if ts != datetime.min else ""

            latest_submissions.append({
                "candidate_id": cid,
                "name": cand.get("candidate_name") or cand.get("name") or "Unknown",
                "position": position,
                "uploaded_at": uploaded_at,
                "match_status": status,
                "score": score,
            })

        ai_insights = _generate_insights(
            all_scored, candidates, projects, job_categories, avg_match_score
        )

        screened_emails = {c["email"] for c in all_scored if c["email"]}
        candidate_emails = {
            str(cand.get("email") or "").strip().lower()
            for cand in candidates
            if cand.get("email")
        }
        screened_unique = len(screened_emails & candidate_emails)
        queue_count = max(0, total_applicants - screened_unique)
        processing_load = (
            round(screened_unique / total_applicants * 100) if total_applicants > 0 else 0
        )
        active_projects = sum(1 for p in projects if p.get("status") == "active")

        system_engine = {
            "queue_status": (
                f"{queue_count} candidate(s) pending screening"
                if queue_count > 0
                else "All candidates screened"
            ),
            "processing_load": processing_load,
        }

        return jsonify(format_response(
            data={
                "total_applicants": total_applicants,
                "candidates_screened": candidates_screened,
                "shortlisted": shortlisted,
                "avg_match_score": avg_match_score,
                "time_to_screen": None,
                "job_categories": job_categories,
                "score_distribution": score_distribution,
                "match_quality": match_quality,
                "latest_submissions": latest_submissions,
                "ai_insights": ai_insights,
                "system_engine": system_engine,
                "projects_count": len(projects),
                "active_projects": active_projects,
            },
            message="Dashboard metrics retrieved",
        )), 200

    except Exception as exc:
        logger.error("dashboard get_metrics error: %s", exc)
        return jsonify(
            format_response(message=str(exc), status="error", code=500)
        ), 500
