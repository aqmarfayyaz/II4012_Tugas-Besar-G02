"""
Analytics aggregation endpoint.
Computes real recruitment metrics from candidates, screening results, and projects.
No fake/mock data — every figure is derived from persisted database records.
"""
import csv
import io
import json
import logging
import os
from collections import defaultdict
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, g, make_response

from utils.helpers import format_response
from routes.auth import require_auth
from services import firebase_db

bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")
logger = logging.getLogger(__name__)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_PROJECTS_FILE = os.path.join(_DATA_DIR, "projects.json")


# ── Helpers ────────────────────────────────────────────────────────────────

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


def _parse_dt(s) -> datetime:
    try:
        return datetime.fromisoformat(str(s))
    except Exception:
        return datetime.min


def _score_f(candidate) -> float:
    return float(candidate.get("match_score") or candidate.get("overall_score") or 0)


# ── Main analytics endpoint ────────────────────────────────────────────────

@bp.route("", methods=["GET"])
@require_auth
def get_analytics():
    """
    Get aggregated analytics for the authenticated user.
    ---
    tags:
      - Analytics
    security:
      - BearerAuth: []
    parameters:
      - in: query
        name: project_id
        type: string
        required: false
      - in: query
        name: days
        type: integer
        required: false
        description: "Filter to last N days (0 = all time)"
    responses:
      200:
        description: Analytics data
    """
    try:
        project_id = request.args.get("project_id") or None
        days = int(request.args.get("days", "0") or 0)
        owner = g.current_username

        # ── Raw data ────────────────────────────────────────────────────────
        candidates = firebase_db.list_candidates(owner=owner, project_id=project_id) or []
        screening_results = (
            firebase_db.list_screening_results(owner=owner, project_id=project_id) or []
        )
        projects = _load_projects(owner=owner)
        if project_id:
            projects = [p for p in projects if p.get("id") == project_id]

        # ── Time filter ──────────────────────────────────────────────────────
        if days > 0:
            cutoff = datetime.utcnow() - timedelta(days=days)
            candidates = [c for c in candidates if _parse_dt(c.get("created_at")) >= cutoff]
            screening_results = [
                r for r in screening_results if _parse_dt(r.get("created_at")) >= cutoff
            ]

        project_map = {p.get("id"): p for p in projects}

        # ── Status distribution ──────────────────────────────────────────────
        status_counts: dict = defaultdict(int)
        for c in candidates:
            status_counts[c.get("status", "applied")] += 1

        # ── Scored subset ────────────────────────────────────────────────────
        # Only candidates that have gone through AI screening (match_score > 0)
        scored = [c for c in candidates if _score_f(c) > 0]
        total = len(candidates)
        screened_count = len(scored)
        scores = [_score_f(c) for c in scored]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0

        high_count = sum(1 for s in scores if s >= 80)
        medium_count = sum(1 for s in scores if 40 <= s < 80)
        low_count = sum(1 for s in scores if s < 40)

        # ── AI accuracy proxy ────────────────────────────────────────────────
        # Percentage of screened candidates that achieved a relevant score (≥50)
        relevant = sum(1 for s in scores if s >= 50)
        ai_accuracy = round(relevant / len(scores) * 100, 1) if scores else 0

        # Screening coverage: % of all uploaded candidates that have been screened
        screening_coverage = round(screened_count / total * 100, 1) if total else 0

        # ── Funnel ───────────────────────────────────────────────────────────
        shortlisted_count = sum(
            1 for c in candidates
            if c.get("status") == "shortlisted" or _score_f(c) >= 80
        )
        interviewed_count = status_counts.get("interviewed", 0)
        rejected_count = status_counts.get("rejected", 0)

        funnel = []
        if total > 0:
            funnel = [
                {"stage": "Uploaded", "count": total, "percentage": 100},
                {"stage": "AI Screened", "count": screened_count,
                 "percentage": round(screened_count / total * 100)},
                {"stage": "High Match (≥80%)", "count": high_count,
                 "percentage": round(high_count / total * 100)},
                {"stage": "Shortlisted", "count": shortlisted_count,
                 "percentage": round(shortlisted_count / total * 100)},
                {"stage": "Interviewed", "count": interviewed_count,
                 "percentage": round(interviewed_count / total * 100)},
            ]

        # ── Score trend (group screened candidates by month of last_screened_at) ──
        month_buckets: dict = defaultdict(list)
        for c in candidates:
            ts = c.get("last_screened_at") or c.get("created_at")
            s = _score_f(c)
            if s > 0 and ts and _parse_dt(ts) != datetime.min:
                key = _parse_dt(ts).strftime("%b").upper()
                month_buckets[key].append(s)

        # Sort by calendar order
        _MONTH_ORDER = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
        score_trend = [
            {
                "month": m,
                "avg_score": round(sum(month_buckets[m]) / len(month_buckets[m]), 1),
                "count": len(month_buckets[m]),
            }
            for m in _MONTH_ORDER
            if m in month_buckets
        ]

        # ── Department breakdown ──────────────────────────────────────────────
        dept_stats: dict = defaultdict(lambda: {
            "project_count": 0, "candidate_count": 0,
            "total_score": 0.0, "scored_count": 0,
        })

        for proj in projects:
            dept = proj.get("department") or "Other"
            dept_stats[dept]["project_count"] += 1

        for c in candidates:
            pid = c.get("project_id", "")
            proj = project_map.get(pid)
            dept = (proj.get("department") if proj else None) or c.get("predicted_label") or "Other"
            dept_stats[dept]["candidate_count"] += 1
            s = _score_f(c)
            if s > 0:
                dept_stats[dept]["total_score"] += s
                dept_stats[dept]["scored_count"] += 1

        departments = []
        for dept, st in dept_stats.items():
            avg_dept = round(st["total_score"] / st["scored_count"], 1) if st["scored_count"] > 0 else 0
            departments.append({
                "name": dept,
                "roles": st["project_count"],
                "candidates": st["candidate_count"],
                "avg_score": avg_dept,
                "quality": avg_dept,
            })
        departments.sort(key=lambda x: x["candidates"], reverse=True)

        # ── Top required skills from all JDs ─────────────────────────────────
        skill_freq: dict = defaultdict(int)
        for r in screening_results:
            for skill in (r.get("jd_data") or {}).get("required_skills", []):
                if skill and str(skill).strip():
                    skill_freq[str(skill).lower().strip()] += 1
        top_skills = [
            {"skill": s, "count": c}
            for s, c in sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        ]

        # ── Job categories distribution ───────────────────────────────────────
        cat_counts: dict = defaultdict(int)
        for r in screening_results:
            cat = r.get("job_category") or "Unknown"
            if cat and cat != "Unknown":
                cat_counts[cat] += r.get("total_candidates", 0)
        for c in candidates:
            pid = c.get("project_id", "")
            proj = project_map.get(pid)
            cat = (proj.get("department") if proj else None) or c.get("predicted_label") or "Other"
            cat_counts[cat] += 0  # ensure key exists without double-counting

        # ── Screening session stats ───────────────────────────────────────────
        screening_sessions = len(screening_results)
        all_ranked_scores = []
        for r in screening_results:
            for rc in r.get("ranked_candidates", []):
                s = float(rc.get("overall_score") or 0)
                if s > 0:
                    all_ranked_scores.append(s)

        return jsonify(format_response(
            data={
                # KPIs
                "total_candidates": total,
                "screened_candidates": screened_count,
                "shortlisted": shortlisted_count,
                "interviewed": interviewed_count,
                "rejected": rejected_count,
                "avg_match_score": avg_score,
                "ai_accuracy": ai_accuracy,
                "screening_coverage": screening_coverage,
                "screening_sessions": screening_sessions,
                "projects_count": len(projects),
                # Score breakdown
                "score_distribution": {
                    "high": high_count,
                    "medium": medium_count,
                    "low": low_count,
                },
                # Charts
                "funnel": funnel,
                "score_trend": score_trend,
                "departments": departments,
                "top_skills": top_skills,
                # Status
                "candidates_by_status": dict(status_counts),
            },
            message="Analytics retrieved",
        )), 200

    except Exception as exc:
        logger.error("get_analytics error: %s", exc)
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500


# ── CSV Export ─────────────────────────────────────────────────────────────

@bp.route("/export", methods=["GET"])
@require_auth
def export_analytics():
    """
    Export analytics as CSV.
    ---
    tags:
      - Analytics
    security:
      - BearerAuth: []
    parameters:
      - in: query
        name: project_id
        type: string
        required: false
    responses:
      200:
        description: CSV file
    """
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
        project_map = {p.get("id"): p for p in projects}

        scored = [c for c in candidates if _score_f(c) > 0]
        avg_score = round(sum(_score_f(c) for c in scored) / len(scored), 1) if scored else 0

        output = io.StringIO()
        w = csv.writer(output)

        # Header
        w.writerow(["TalentPulse AI — Recruitment Analytics Report"])
        w.writerow([f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}"])
        w.writerow([f"Account: {owner}"])
        w.writerow([])

        # Summary
        w.writerow(["SUMMARY METRICS"])
        w.writerow(["Metric", "Value"])
        w.writerow(["Total Candidates", len(candidates)])
        w.writerow(["AI Screened", len(scored)])
        w.writerow(["Screening Coverage", f"{round(len(scored)/len(candidates)*100,1) if candidates else 0}%"])
        w.writerow(["Average Match Score", f"{avg_score}%"])
        w.writerow(["High Match (≥80%)", sum(1 for c in scored if _score_f(c) >= 80)])
        w.writerow(["Medium Match (40-79%)", sum(1 for c in scored if 40 <= _score_f(c) < 80)])
        w.writerow(["Low Match (<40%)", sum(1 for c in scored if _score_f(c) < 40)])
        w.writerow(["Screening Sessions", len(screening_results)])
        w.writerow(["Active Projects", len(projects)])
        w.writerow([])

        # Candidates
        w.writerow(["CANDIDATES"])
        w.writerow(["Name", "Email", "Project", "Department", "Status",
                    "Match Score", "Similarity Score", "Skill Score",
                    "Recommendation", "Uploaded At", "Last Screened At"])
        for c in candidates:
            pid = c.get("project_id", "")
            proj = project_map.get(pid)
            w.writerow([
                c.get("candidate_name") or c.get("name", ""),
                c.get("email", ""),
                proj.get("name", "") if proj else "",
                (proj.get("department", "") if proj else "") or c.get("predicted_label", ""),
                c.get("status", "applied"),
                f"{_score_f(c):.1f}",
                f"{float(c.get('similarity_score') or 0):.1f}",
                f"{float(c.get('skill_score') or 0):.1f}",
                c.get("recommendation", ""),
                c.get("created_at", ""),
                c.get("last_screened_at", ""),
            ])
        w.writerow([])

        # Projects
        w.writerow(["PROJECTS"])
        w.writerow(["Name", "Job Title", "Department", "Status",
                    "Employment Type", "Priority", "Hiring Quota", "Created At"])
        for p in projects:
            w.writerow([
                p.get("name", ""),
                p.get("job_title", ""),
                p.get("department", ""),
                p.get("status", ""),
                p.get("employment_type", ""),
                p.get("priority", ""),
                p.get("hiring_quota", ""),
                p.get("created_at", ""),
            ])
        w.writerow([])

        # Screening sessions
        w.writerow(["SCREENING SESSIONS"])
        w.writerow(["Session ID", "Project", "Job Category", "Candidates Ranked",
                    "Avg Score", "Created At"])
        for r in screening_results:
            pid = r.get("project_id", "")
            proj = project_map.get(pid)
            rc_scores = [float(rc.get("overall_score") or 0)
                         for rc in r.get("ranked_candidates", [])]
            session_avg = round(sum(rc_scores) / len(rc_scores), 1) if rc_scores else 0
            w.writerow([
                r.get("result_id", ""),
                proj.get("name", "") if proj else "",
                r.get("job_category", ""),
                r.get("total_candidates", 0),
                f"{session_avg}%",
                r.get("created_at", ""),
            ])

        output.seek(0)
        resp = make_response(output.getvalue())
        resp.headers["Content-Disposition"] = (
            f"attachment; filename=talentpulse_analytics_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        )
        resp.headers["Content-Type"] = "text/csv; charset=utf-8"
        return resp

    except Exception as exc:
        logger.error("export_analytics error: %s", exc)
        return jsonify(format_response(message=str(exc), status="error", code=500)), 500
