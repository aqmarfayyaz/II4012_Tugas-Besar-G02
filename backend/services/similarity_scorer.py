
import logging
import numpy as np
from typing import Tuple

logger = logging.getLogger(__name__)

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity as _sk_cosine
    _SKLEARN_AVAILABLE = True
except ImportError:
    _SKLEARN_AVAILABLE = False
    logger.warning("scikit-learn not available — TF-IDF fallback disabled")

class SimilarityScorer:

    def __init__(self, embedder=None):
        self.embedder = embedder

    def compute_embedding(self, text: str) -> np.ndarray:
        if not self.embedder:
            raise ValueError("Embedder not initialized")
        return self.embedder.embed_text(text)

    @staticmethod
    def _is_zero_vector(v: np.ndarray) -> bool:
        return float(np.linalg.norm(v)) < 1e-9

    @staticmethod
    def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        if len(vec1) == 0 or len(vec2) == 0:
            return 0.0
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        similarity = np.dot(vec1, vec2) / (norm1 * norm2)

        return float(max(0.0, min(1.0, (similarity + 1) / 2)))

    @staticmethod
    def _tfidf_similarity(text1: str, text2: str) -> float:
        if not _SKLEARN_AVAILABLE:
            return 0.0
        t1 = (text1 or "").strip()
        t2 = (text2 or "").strip()
        if not t1 or not t2:
            return 0.0
        try:
            vec = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", min_df=1)
            mat = vec.fit_transform([t1, t2])
            sim = float(_sk_cosine(mat[0:1], mat[1:2])[0][0])

            return round(min(100.0, sim * 130), 2)
        except Exception as exc:
            logger.warning("TF-IDF fallback error: %s", exc)
            return 0.0

    def score_cv_jd_match(self, cv_embedding: np.ndarray, jd_embedding: np.ndarray) -> float:
        similarity = self.cosine_similarity(cv_embedding, jd_embedding)
        return round(similarity * 100, 2)

    def score_skill_match(
        self,
        cv_skills: list,
        required_skills: list,
        preferred_skills: list = None,
    ) -> Tuple[float, dict]:
        preferred_skills = preferred_skills or []

        if not required_skills and not preferred_skills:
            logger.debug("No required or preferred skills defined — returning neutral skill score")
            return 50.0, {"note": "no required skills defined in JD"}

        if not required_skills:
            required_skills = list(preferred_skills)
            preferred_skills = []

        cv_set = {s.lower().strip() for s in cv_skills if s and str(s).strip()}
        req_set = {s.lower().strip() for s in required_skills if s and str(s).strip()}
        pref_set = {s.lower().strip() for s in preferred_skills if s and str(s).strip()}

        exact_req = cv_set & req_set
        partial_req = set()
        for cv_s in cv_set:
            for req_s in req_set - exact_req:
                if len(cv_s) >= 2 and len(req_s) >= 2:
                    if cv_s in req_s or req_s in cv_s:
                        partial_req.add(req_s)

        req_matched_count = len(exact_req) + len(partial_req) * 0.5
        req_score = (req_matched_count / len(req_set)) * 100 if req_set else 0.0

        logger.debug(
            "Skill match — cv_skills=%s | required=%s | exact=%s | partial=%s | req_score=%.1f",
            list(cv_set)[:10], list(req_set)[:10], list(exact_req), list(partial_req), req_score,
        )

        exact_pref = cv_set & pref_set
        partial_pref = set()
        for cv_s in cv_set:
            for pref_s in pref_set - exact_pref:
                if len(cv_s) >= 2 and len(pref_s) >= 2:
                    if cv_s in pref_s or pref_s in cv_s:
                        partial_pref.add(pref_s)

        pref_matched_count = len(exact_pref) + len(partial_pref) * 0.5
        pref_score = (pref_matched_count / len(pref_set)) * 100 if pref_set else 0.0

        combined_score = req_score * 0.7 + pref_score * 0.3

        all_matched = exact_req | partial_req
        all_missing = req_set - exact_req - partial_req

        details = {
            "required_matched": int(len(exact_req) + len(partial_req)),
            "required_total": len(req_set),
            "preferred_matched": int(len(exact_pref) + len(partial_pref)),
            "preferred_total": len(pref_set),
            "matched_skills": sorted(all_matched),
            "missing_skills": sorted(all_missing),
        }

        return round(combined_score, 2), details

    def full_similarity_analysis(self, cv_data: dict, jd_data: dict) -> dict:
        logger.info(
            "Starting similarity analysis — candidate=%s, jd=%s",
            cv_data.get("name", "?"),
            jd_data.get("job_title", "?"),
        )

        cv_embedding = self.embedder.embed_cv(cv_data)
        jd_embedding = self.embedder.embed_jd(jd_data)

        if self._is_zero_vector(cv_embedding) or self._is_zero_vector(jd_embedding):
            logger.warning(
                "Zero embedding detected (OpenAI likely unavailable) — using TF-IDF fallback"
            )
            cv_text = " ".join(filter(None, [
                cv_data.get("full_text", ""),
                cv_data.get("summary", ""),
                " ".join(cv_data.get("skills", [])),
                cv_data.get("experience_text", ""),
            ]))
            jd_text = " ".join(filter(None, [
                jd_data.get("full_text", ""),
                jd_data.get("description", ""),
                jd_data.get("requirements", ""),
                " ".join(jd_data.get("required_skills", [])),
                " ".join(jd_data.get("preferred_skills", [])),
            ]))
            semantic_score = self._tfidf_similarity(cv_text, jd_text)
            embedding_source = "tfidf"
        else:
            semantic_score = self.score_cv_jd_match(cv_embedding, jd_embedding)
            embedding_source = "openai"

        logger.info("Semantic score=%.2f (source=%s)", semantic_score, embedding_source)

        skill_score, skill_details = self.score_skill_match(
            cv_data.get("skills", []),
            jd_data.get("required_skills", []),
            jd_data.get("preferred_skills", []),
        )

        logger.info("Skill score=%.2f | details=%s", skill_score, skill_details)

        if skill_details.get("note") == "no required skills defined in JD":
            final_score = semantic_score * 0.85 + skill_score * 0.15
        else:
            final_score = semantic_score * 0.7 + skill_score * 0.3

        logger.info("Final score=%.2f", final_score)

        return {
            "semantic_score": round(semantic_score, 2),
            "skill_score": round(skill_score, 2),
            "final_score": round(final_score, 2),
            "skill_analysis": skill_details,
            "embedding_source": embedding_source,
        }
