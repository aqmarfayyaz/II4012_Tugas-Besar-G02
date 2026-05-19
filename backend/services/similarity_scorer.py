"""
Similarity Scoring Service
Computes semantic similarity between CV and JD
using embeddings + skill analysis
"""

import logging
import numpy as np
from typing import Tuple

logger = logging.getLogger(__name__)


class SimilarityScorer:

    def __init__(
        self,
        embedder=None
    ):
        """
        Initialize similarity scorer
        """

        self.embedder = embedder

    def compute_embedding(
        self,
        text: str
    ) -> np.ndarray:
        """
        Generate embedding vector
        """

        if not self.embedder:

            raise ValueError(
                "Embedder not initialized"
            )

        return self.embedder.embed_text(
            text
        )

    @staticmethod
    def cosine_similarity(
        vec1: np.ndarray,
        vec2: np.ndarray
    ) -> float:
        """
        Compute cosine similarity
        """

        if len(vec1) == 0 or len(vec2) == 0:
            return 0.0

        dot_product = np.dot(
            vec1,
            vec2
        )

        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        similarity = (
            dot_product /
            (norm1 * norm2)
        )

        # Normalize similarity
        normalized_similarity = (
            similarity + 1
        ) / 2

        return float(
            max(
                0.0,
                min(
                    1.0,
                    normalized_similarity
                )
            )
        )

    def score_cv_jd_match(
        self,
        cv_embedding: np.ndarray,
        jd_embedding: np.ndarray
    ) -> float:
        """
        Calculate semantic similarity score
        """

        similarity = (
            self.cosine_similarity(
                cv_embedding,
                jd_embedding
            )
        )

        return round(
            similarity * 100,
            2
        )

    def score_skill_match(
        self,
        cv_skills: list,
        required_skills: list,
        preferred_skills: list = None
    ) -> Tuple[float, dict]:
        """
        Skill overlap scoring
        """

        if not required_skills:
            return 0.0, {}

        cv_skills_set = set([
            s.lower()
            for s in cv_skills
        ])

        required_set = set([
            s.lower()
            for s in required_skills
        ])

        preferred_set = set([
            s.lower()
            for s in (preferred_skills or [])
        ])

        # Count matched skills
        required_matched = len(
            cv_skills_set &
            required_set
        )

        preferred_matched = len(
            cv_skills_set &
            preferred_set
        )

        # Required skill score
        required_score = (
            required_matched /
            len(required_set)
        ) * 100 if required_set else 0

        # Preferred skill score
        preferred_score = (
            preferred_matched /
            len(preferred_set)
        ) * 100 if preferred_set else 0

        # Combined weighted score
        combined_score = (
            required_score * 0.7
        ) + (
            preferred_score * 0.3
        )

        details = {

            "required_matched":
                required_matched,

            "required_total":
                len(required_set),

            "preferred_matched":
                preferred_matched,

            "preferred_total":
                len(preferred_set),

            "matched_skills":
                list(
                    cv_skills_set &
                    required_set
                ),

            "missing_skills":
                list(
                    required_set -
                    cv_skills_set
                )
        }

        return round(
            combined_score,
            2
        ), details

    def full_similarity_analysis(
        self,
        cv_data: dict,
        jd_data: dict
    ) -> dict:
        """
        Complete semantic analysis
        """

        logger.info(
            "Starting similarity analysis"
        )

        # Generate embeddings
        cv_embedding = (
            self.embedder.embed_cv(
                cv_data
            )
        )

        jd_embedding = (
            self.embedder.embed_jd(
                jd_data
            )
        )

        # Semantic similarity
        semantic_score = (
            self.score_cv_jd_match(
                cv_embedding,
                jd_embedding
            )
        )

        # Skill similarity
        skill_score, skill_details = (
            self.score_skill_match(
                cv_data.get(
                    "skills",
                    []
                ),
                jd_data.get(
                    "required_skills",
                    []
                ),
                jd_data.get(
                    "preferred_skills",
                    []
                )
            )
        )

        # Final weighted score
        final_score = (
            semantic_score * 0.7
        ) + (
            skill_score * 0.3
        )

        return {

            "semantic_score":
                round(
                    semantic_score,
                    2
                ),

            "skill_score":
                round(
                    skill_score,
                    2
                ),

            "final_score":
                round(
                    final_score,
                    2
                ),

            "skill_analysis":
                skill_details
        }