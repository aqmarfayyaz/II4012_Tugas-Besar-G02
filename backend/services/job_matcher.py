
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

_FAMILY_TO_DEPT_KEYWORDS: Dict[str, List[str]] = {
    "TECH": ["engineering", "software", "technical", "it", "data", "technology", "developer", "devops"],
    "BUSINESS": ["business", "finance", "hr", "operations", "sales", "management", "product", "strategy"],
    "CREATIVE": ["design", "creative", "marketing", "ux", "ui", "media", "content", "brand"],
    "SERVICES": ["services", "support", "customer", "success", "operations", "service"],
}

class JobMatcher:

    def __init__(self, classifier=None, similarity_scorer=None):
        self.classifier = classifier
        self.similarity_scorer = similarity_scorer

    def rank_candidates(
        self,
        candidates: List[Dict[str, Any]],
        jd_data: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        ranked = []

        for candidate in candidates:
            try:
                similarity_score = self._calculate_similarity_score(candidate, jd_data)
                skill_score, skill_details = self._calculate_skill_score(candidate, jd_data)
                category_match = self._check_category_match(candidate, jd_data)

                combined_score = (
                    similarity_score * 0.50
                    + skill_score   * 0.35
                    + category_match * 15
                )
                combined_score = round(min(100.0, max(0.0, combined_score)), 2)

                logger.info(
                    "Candidate %s | semantic=%.1f skill=%.1f category=%.2f → overall=%.1f",
                    candidate.get("name", "?"),
                    similarity_score, skill_score, category_match, combined_score,
                )

                scores = {
                    "overall_score": combined_score,
                    "similarity_score": similarity_score,
                    "skill_score": skill_score,
                    "skill_details": skill_details,
                }

                insight = self.generate_insight(candidate, jd_data, scores)

                ranked.append({
                    "candidate_id":      candidate.get("id") or candidate.get("candidate_id"),
                    "name":              candidate.get("name") or candidate.get("candidate_name", ""),
                    "email":             candidate.get("email", ""),
                    "skills":            candidate.get("skills", []),
                    "summary":           candidate.get("summary", ""),
                    "predicted_category": candidate.get("predicted_category", ""),
                    "overall_score":     combined_score,
                    "similarity_score":  round(similarity_score, 2),
                    "skill_score":       round(skill_score, 2),
                    "skill_details":     skill_details,
                    "category_match":    category_match,
                    "insight":           insight,
                    "rank":              0,
                })

            except Exception as exc:
                logger.error("Error ranking candidate %s: %s", candidate.get("name", "?"), exc)
                continue

        ranked.sort(key=lambda x: x["overall_score"], reverse=True)
        for idx, c in enumerate(ranked, start=1):
            c["rank"] = idx

        return ranked

    def _calculate_similarity_score(self, candidate: Dict, jd_data: Dict) -> float:
        if not self.similarity_scorer:
            return 0.0
        try:
            result = self.similarity_scorer.full_similarity_analysis(candidate, jd_data)
            return float(result.get("semantic_score", 0.0))
        except Exception as exc:
            logger.error("Similarity calculation error for %s: %s", candidate.get("name", "?"), exc)
            return 0.0

    def _calculate_skill_score(self, candidate: Dict, jd_data: Dict) -> tuple:
        if not self.similarity_scorer:
            return 0.0, {}
        try:
            return self.similarity_scorer.score_skill_match(
                candidate.get("skills", []),
                jd_data.get("required_skills", []),
                jd_data.get("preferred_skills", []),
            )
        except Exception as exc:
            logger.error("Skill score error for %s: %s", candidate.get("name", "?"), exc)
            return 0.0, {}

    def _check_category_match(self, candidate: Dict, jd_data: Dict) -> float:
        candidate_cat = str(candidate.get("predicted_category") or "").strip().upper()
        jd_cat = str(jd_data.get("job_category") or "").strip().lower()

        if not candidate_cat or not jd_cat:
            return 0.5

        if candidate_cat.lower() == jd_cat:
            return 1.0

        keywords = _FAMILY_TO_DEPT_KEYWORDS.get(candidate_cat, [])
        if any(kw in jd_cat for kw in keywords):
            return 1.0

        if candidate_cat.lower() in jd_cat:
            return 1.0

        return 0.2

    def generate_insight(self, candidate: Dict, jd_data: Dict, scores: Dict) -> str:
        parts = []
        details = scores.get("skill_details") or {}

        if details and details.get("required_total", 0) > 0:
            matched = details.get("required_matched", 0)
            total = details.get("required_total", 1)
            parts.append(f"Matched {matched}/{total} required skills.")

            missing = details.get("missing_skills", [])
            if missing:
                parts.append(f"Missing: {', '.join(missing[:3])}{'...' if len(missing) > 3 else ''}.")

        overall = scores.get("overall_score", 0)
        if overall >= 80:
            parts.append("⭐ Strong candidate — highly recommended.")
        elif overall >= 65:
            parts.append("👍 Good match — worth interviewing.")
        elif overall >= 45:
            parts.append("⚠️ Moderate fit — review carefully.")
        else:
            parts.append("❌ Limited alignment with this role.")

        return " ".join(parts) if parts else "Evaluation complete."
