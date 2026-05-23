
import json
import logging
import os
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

_db = None
_initialized = False
_available = False

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
CANDIDATES_FILE = os.path.join(DATA_DIR, "candidates.json")
SCREENING_RESULTS_FILE = os.path.join(DATA_DIR, "screening_results.json")

def _ensure_data_dir() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)

def _json_load(path: str) -> Dict[str, Any]:
    _ensure_data_dir()
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _json_save(path: str, payload: Dict[str, Any]) -> None:
    _ensure_data_dir()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

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

def _stream(collection, filters: list) -> Optional[List[Dict]]:
    try:
        ref = _db.collection(collection)
        for field, value in filters:
            ref = ref.where(field, "==", value)
        return [{"id": d.id, **d.to_dict()} for d in ref.stream()]
    except Exception as exc:
        logger.error(f"Firestore _stream({collection}): {exc}")
        return None

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

def save_candidate(owner: str, project_id: str, candidate_id: str, data: Dict) -> bool:
    _init()
    if _available:
        try:
            doc = {**data, "owner": owner, "project_id": project_id}
            _db.collection("candidates").document(candidate_id).set(doc)
            return True
        except Exception as exc:
            logger.error(f"Firestore save_candidate: {exc}")
            return False

    data = {**data, "owner": owner, "project_id": project_id}
    payload = _json_load(CANDIDATES_FILE)
    payload[candidate_id] = data
    _json_save(CANDIDATES_FILE, payload)
    return True

def list_candidates(owner: str, project_id: str = None) -> Optional[List[Dict]]:
    _init()
    if _available:
        filters = [("owner", owner)]
        if project_id:
            filters.append(("project_id", project_id))
        return _stream("candidates", filters)

    data = _json_load(CANDIDATES_FILE)
    results = [
        {"id": cid, **candidate}
        for cid, candidate in data.items()
        if candidate.get("owner") == owner
    ]
    if project_id:
        results = [c for c in results if c.get("project_id") == project_id]
    return results

def get_candidate(candidate_id: str) -> Optional[Dict]:
    _init()
    if _available:
        try:
            doc = _db.collection("candidates").document(candidate_id).get()
            if doc.exists:
                return {"id": doc.id, **doc.to_dict()}
            return {}
        except Exception as exc:
            logger.error(f"Firestore get_candidate: {exc}")
            return None

    data = _json_load(CANDIDATES_FILE)
    candidate = data.get(candidate_id)
    if candidate is None:
        return {}
    return {"id": candidate_id, **candidate}

def update_candidate(candidate_id: str, updates: Dict[str, Any]) -> bool:
    _init()
    if _available:
        try:
            _db.collection("candidates").document(candidate_id).set(updates, merge=True)
            return True
        except Exception as exc:
            logger.error(f"Firestore update_candidate: {exc}")
            return False

    data = _json_load(CANDIDATES_FILE)
    current = data.get(candidate_id)
    if current is None:
        return False
    data[candidate_id] = {**current, **updates}
    _json_save(CANDIDATES_FILE, data)
    return True

def delete_candidate(candidate_id: str) -> bool:
    _init()
    if _available:
        try:
            _db.collection("candidates").document(candidate_id).delete()
            return True
        except Exception as exc:
            logger.error(f"Firestore delete_candidate: {exc}")
            return False

    data = _json_load(CANDIDATES_FILE)
    if candidate_id in data:
        data.pop(candidate_id, None)
        _json_save(CANDIDATES_FILE, data)
    return True

def save_screening_result(owner: str, project_id: str, result_id: str, data: Dict) -> bool:
    _init()
    if _available:
        try:
            doc = {**data, "owner": owner, "project_id": project_id}
            _db.collection("screening_results").document(result_id).set(doc)
            return True
        except Exception as exc:
            logger.error(f"Firestore save_screening_result: {exc}")
            return False

    data = {**data, "owner": owner, "project_id": project_id}
    payload = _json_load(SCREENING_RESULTS_FILE)
    payload[result_id] = data
    _json_save(SCREENING_RESULTS_FILE, payload)
    return True

def list_screening_results(owner: str, project_id: str = None) -> Optional[List[Dict]]:
    _init()
    if _available:
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

    data = _json_load(SCREENING_RESULTS_FILE)
    results = [
        {"id": rid, **result}
        for rid, result in data.items()
        if result.get("owner") == owner
    ]
    if project_id:
        results = [r for r in results if r.get("project_id") == project_id]
    return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

def get_screening_result(result_id: str) -> Optional[Dict]:
    _init()
    if _available:
        try:
            doc = _db.collection("screening_results").document(result_id).get()
            if doc.exists:
                return {"id": doc.id, **doc.to_dict()}
            return {}
        except Exception as exc:
            logger.error(f"Firestore get_screening_result: {exc}")
            return None

    data = _json_load(SCREENING_RESULTS_FILE)
    result = data.get(result_id)
    if result is None:
        return {}
    return {"id": result_id, **result}