"""
Firebase Firestore storage service.
Reads FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON from .env.
Falls back silently to local JSON storage when credentials are not configured.

Firestore collections:
  projects/{project_id}          — owned by a user (created_by field)
  candidates/{candidate_id}      — owner + project_id fields
  screening_results/{result_id}  — owner + project_id fields
"""

import json
import logging
import os
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

_db = None
_initialized = False
_available = False


def _init() -> None:
    global _db, _initialized, _available
    if _initialized:
        return
    _initialized = True

    sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "").strip()
    sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    project_id = os.getenv(
        "FIREBASE_PROJECT_ID",
        os.getenv("REACT_APP_FIREBASE_PROJECT_ID", ""),
    ).strip()

    if not sa_path and not sa_json:
        logger.info("No Firebase credentials configured — using local JSON storage")
        return

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            if sa_path and os.path.exists(sa_path):
                cred = credentials.Certificate(sa_path)
                firebase_admin.initialize_app(cred)
                logger.info(f"Firebase initialised via service account file: {sa_path}")
            elif sa_json:
                cred = credentials.Certificate(json.loads(sa_json))
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialised via FIREBASE_SERVICE_ACCOUNT_JSON")
            elif project_id:
                firebase_admin.initialize_app(options={"projectId": project_id})
                logger.info(f"Firebase initialised with project ID only: {project_id}")
            else:
                logger.warning("Firebase: no usable credentials found")
                return

        _db = firestore.client()
        _available = True
        logger.info("Firestore client ready")

    except Exception as exc:
        logger.warning(f"Firebase init failed ({exc}) — falling back to local JSON storage")
        _db = None
        _available = False


def is_available() -> bool:
    _init()
    return _available


# ─── Helper ───────────────────────────────────────────────────────────────

def _stream(collection, filters: list) -> Optional[List[Dict]]:
    """Stream a Firestore collection with equality filters.  Returns None on error."""
    try:
        ref = _db.collection(collection)
        for field, value in filters:
            ref = ref.where(field, "==", value)
        return [{"id": d.id, **d.to_dict()} for d in ref.stream()]
    except Exception as exc:
        logger.error(f"Firestore _stream({collection}): {exc}")
        return None


# ─── Projects ─────────────────────────────────────────────────────────────

def list_projects(owner: str = None) -> Optional[List[Dict]]:
    _init()
    if not _available:
        return None
    filters = [("created_by", owner)] if owner else []
    try:
        ref = _db.collection("projects")
        for field, value in filters:
            ref = ref.where(field, "==", value)
        return [{"id": d.id, **d.to_dict()} for d in ref.stream()]
    except Exception as exc:
        logger.error(f"Firestore list_projects: {exc}")
        return None


def get_project(project_id: str) -> Optional[Dict]:
    _init()
    if not _available:
        return None
    try:
        doc = _db.collection("projects").document(project_id).get()
        if doc.exists:
            return {"id": doc.id, **doc.to_dict()}
        return {}
    except Exception as exc:
        logger.error(f"Firestore get_project: {exc}")
        return None


def save_project(project_id: str, data: Dict) -> bool:
    _init()
    if not _available:
        return False
    try:
        _db.collection("projects").document(project_id).set(data)
        return True
    except Exception as exc:
        logger.error(f"Firestore save_project: {exc}")
        return False


def delete_project(project_id: str) -> bool:
    _init()
    if not _available:
        return False
    try:
        _db.collection("projects").document(project_id).delete()
        return True
    except Exception as exc:
        logger.error(f"Firestore delete_project: {exc}")
        return False


# ─── Candidates ───────────────────────────────────────────────────────────

def save_candidate(owner: str, project_id: str, candidate_id: str, data: Dict) -> bool:
    _init()
    if not _available:
        return False
    try:
        doc = {**data, "owner": owner, "project_id": project_id}
        _db.collection("candidates").document(candidate_id).set(doc)
        return True
    except Exception as exc:
        logger.error(f"Firestore save_candidate: {exc}")
        return False


def list_candidates(owner: str, project_id: str = None) -> Optional[List[Dict]]:
    _init()
    if not _available:
        return None
    filters = [("owner", owner)]
    if project_id:
        filters.append(("project_id", project_id))
    return _stream("candidates", filters)


def get_candidate(candidate_id: str) -> Optional[Dict]:
    _init()
    if not _available:
        return None
    try:
        doc = _db.collection("candidates").document(candidate_id).get()
        if doc.exists:
            return {"id": doc.id, **doc.to_dict()}
        return {}
    except Exception as exc:
        logger.error(f"Firestore get_candidate: {exc}")
        return None


def delete_candidate(candidate_id: str) -> bool:
    _init()
    if not _available:
        return False
    try:
        _db.collection("candidates").document(candidate_id).delete()
        return True
    except Exception as exc:
        logger.error(f"Firestore delete_candidate: {exc}")
        return False


# ─── Screening Results ────────────────────────────────────────────────────

def save_screening_result(owner: str, project_id: str, result_id: str, data: Dict) -> bool:
    _init()
    if not _available:
        return False
    try:
        doc = {**data, "owner": owner, "project_id": project_id}
        _db.collection("screening_results").document(result_id).set(doc)
        return True
    except Exception as exc:
        logger.error(f"Firestore save_screening_result: {exc}")
        return False


def list_screening_results(owner: str, project_id: str = None) -> Optional[List[Dict]]:
    _init()
    if not _available:
        return None
    filters = [("owner", owner)]
    if project_id:
        filters.append(("project_id", project_id))
    try:
        ref = _db.collection("screening_results")
        for field, value in filters:
            ref = ref.where(field, "==", value)
        return sorted(
            [{"id": d.id, **d.to_dict()} for d in ref.stream()],
            key=lambda x: x.get("created_at", ""),
            reverse=True,
        )
    except Exception as exc:
        logger.error(f"Firestore list_screening_results: {exc}")
        return None


def get_screening_result(result_id: str) -> Optional[Dict]:
    _init()
    if not _available:
        return None
    try:
        doc = _db.collection("screening_results").document(result_id).get()
        if doc.exists:
            return {"id": doc.id, **doc.to_dict()}
        return {}
    except Exception as exc:
        logger.error(f"Firestore get_screening_result: {exc}")
        return None
