"""
Job Matcher Service
Matches and ranks candidates against job descriptions
using semantic similarity + skill analysis
"""

import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class JobMatcher:

    def __init__(
        self,
        classifier=None,
        similarity_scorer=None
    ):
        """
        Initialize Job Matcher

        Args:
            classifier:
                Optional ML classifier

            similarity_scorer:
                Semantic similarity scorer
        """

        self.classifier = classifier

        self.similarity_scorer = (
            similarity_scorer
        )

    def classify_job_category(
        self,
        jd_text: str
    ) -> Dict[str, Any]:
        """
        Classify job category
        """

        if not self.classifier:

            return {
                "category": "Unknown",
                "confidence": 0.0,
                "probabilities": {}
            }

        try:

            prediction = (
                self.classifier.predict(
                    [jd_text]
                )[0]
            )

            probabilities = (
                self.classifier
                .predict_proba([jd_text])[0]
            )

            confidence = float(
                max(probabilities)
            )

            return {
                "category": prediction,
                "confidence": round(
                    confidence,
                    2
                ),
                "probabilities": {}
            }

        except Exception as e:

            logger.error(
                f"Classification error: {str(e)}"
            )

            return {
                "category": "Unknown",
                "confidence": 0.0,
                "probabilities": {}
            }

    def rank_candidates(
        self,
        candidates: List[Dict[str, Any]],
        jd_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Rank candidates against job description
        """

        ranked_candidates = []

        for candidate in candidates:

            try:

                # Semantic similarity
                similarity_score = (
                    self._calculate_similarity_score(
                        candidate,
                        jd_data
                    )
                )

                # Skill analysis
                skill_score, skill_details = (
                    self._calculate_skill_score(
                        candidate,
                        jd_data
                    )
                )

                # Category match
                category_match = (
                    self._check_category_match(
                        candidate,
                        jd_data
                    )
                )

                # Final weighted score
                combined_score = (

                    similarity_score * 0.5 +

                    skill_score * 0.35 +

                    category_match * 15
                )

                scores = {

                    "overall_score":
                        combined_score,

                    "similarity_score":
                        similarity_score,

                    "skill_score":
                        skill_score,

                    "skill_details":
                        skill_details
                }

                insight = (
                    self.generate_insight(
                        candidate,
                        jd_data,
                        scores
                    )
                )

                ranked_candidates.append({
                    "candidate_id":    candidate.get("id"),
                    "name":            candidate.get("name"),
                    "email":           candidate.get("email", ""),
                    "skills":          candidate.get("skills", []),
                    "summary":         candidate.get("summary", ""),
                    "predicted_category": candidate.get("predicted_category", ""),
                    "overall_score":   round(combined_score, 2),
                    "similarity_score": round(similarity_score, 2),
                    "skill_score":     round(skill_score, 2),
                    "skill_details":   skill_details,
                    "category_match":  category_match,
                    "insight":         insight,
                    "rank":            0,
                })

            except Exception as e:

                logger.error(
                    f"Error ranking candidate: {str(e)}"
                )

                continue

        # Sort descending
        ranked_candidates.sort(
            key=lambda x: x[
                "overall_score"
            ],
            reverse=True
        )

        # Add ranking number
        for idx, candidate in enumerate(
            ranked_candidates,
            start=1
        ):

            candidate["rank"] = idx

        return ranked_candidates

    def _calculate_similarity_score(
        self,
        candidate: Dict,
        jd_data: Dict
    ) -> float:
        """
        Calculate semantic similarity score
        """

        if not self.similarity_scorer:
            return 0.0

        try:

            result = (
                self.similarity_scorer
                .full_similarity_analysis(
                    candidate,
                    jd_data
                )
            )

            return result.get(
                "semantic_score",
                0.0
            )

        except Exception as e:

            logger.error(
                f"Similarity calculation error: {str(e)}"
            )

            return 0.0

    def _calculate_skill_score(
        self,
        candidate: Dict,
        jd_data: Dict
    ) -> tuple:
        """
        Calculate skill overlap score
        """

        if not self.similarity_scorer:
            return 0.0, {}

        cv_skills = candidate.get(
            "skills",
            []
        )

        required_skills = jd_data.get(
            "required_skills",
            []
        )

        preferred_skills = jd_data.get(
            "preferred_skills",
            []
        )

        score, details = (
            self.similarity_scorer
            .score_skill_match(
                cv_skills,
                required_skills,
                preferred_skills
            )
        )

        return score, details

    def _check_category_match(
        self,
        candidate: Dict,
        jd_data: Dict
    ) -> float:
        """
        Check category compatibility
        """

        candidate_category = (
            candidate.get(
                "predicted_category",
                ""
            ).lower()
        )

        jd_category = (
            jd_data.get(
                "job_category",
                ""
            ).lower()
        )

        if (
            not candidate_category or
            not jd_category
        ):

            return 0.5

        return (
            1.0
            if candidate_category ==
            jd_category
            else 0.0
        )

    def generate_insight(
        self,
        candidate: Dict,
        jd_data: Dict,
        scores: Dict
    ) -> str:
        """
        Generate recruiter-friendly insight
        """

        insights = []

        # Skill analysis
        if scores.get("skill_details"):

            matched = (
                scores["skill_details"]
                .get(
                    "required_matched",
                    0
                )
            )

            total = (
                scores["skill_details"]
                .get(
                    "required_total",
                    1
                )
            )

            insights.append(
                f"Matched {matched}/{total} required skills."
            )

            missing_skills = (
                scores["skill_details"]
                .get(
                    "missing_skills",
                    []
                )
            )

            if missing_skills:

                missing = ", ".join(
                    missing_skills[:3]
                )

                insights.append(
                    f"Missing skills: {missing}."
                )

        # Recommendation
        overall = scores.get(
            "overall_score",
            0
        )

        if overall >= 80:

            insights.append(
                "⭐ Strong candidate match."
            )

        elif overall >= 60:

            insights.append(
                "👍 Good potential match."
            )

        elif overall >= 40:

            insights.append(
                "⚠️ Moderate fit, worth reviewing."
            )

        else:

            insights.append(
                "❌ Limited match for this role."
            )

        return " ".join(insights)