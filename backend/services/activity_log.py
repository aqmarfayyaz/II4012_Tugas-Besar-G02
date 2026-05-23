"""
Lightweight per-user activity log.
Stores up to MAX_EVENTS_PER_USER events in backend/data/activity.json.
All writes are fire-and-forget (errors are logged but never propagated to callers).
"""
import json
import logging
import os
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_ACTIVITY_FILE = os.path.join(_DATA_DIR, "activity.json")
MAX_EVENTS_PER_USER = 100


def _load() -> dict:
    if not os.path.exists(_ACTIVITY_FILE):
        return {}
    try:
        with open(_ACTIVITY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save(data: dict) -> None:
    os.makedirs(_DATA_DIR, exist_ok=True)
    try:
        with open(_ACTIVITY_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as exc:
        logger.warning("activity_log: could not save: %s", exc)


def log_activity(
    owner: str,
    event_type: str,
    title: str,
    detail: str = "",
    link: str = "",
) -> None:
    """Append one event for *owner*. Silently swallows errors so callers are never affected."""
    try:
        data = _load()
        events: list = data.get(owner, [])
        events.insert(0, {
            "id": str(uuid.uuid4()),
            "event_type": event_type,
            "title": title,
            "detail": detail,
            "link": link,
            "created_at": datetime.utcnow().isoformat(),
        })
        data[owner] = events[:MAX_EVENTS_PER_USER]
        _save(data)
    except Exception as exc:
        logger.warning("log_activity failed (owner=%s): %s", owner, exc)


def list_activities(owner: str, limit: int = 50) -> list:
    """Return the *limit* most recent events for *owner*, newest first."""
    try:
        return _load().get(owner, [])[:limit]
    except Exception:
        return []
