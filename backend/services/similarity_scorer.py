"""
Similarity Scoring Service
Computes cosine similarity between CV and JD using embeddings
"""

import numpy as np
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

class SimilarityScorer:
    def __init__(self, embedder=None):
        """Initialize similarity scorer with embedder"""
        self.embedder = embedder
    
    def compute_embedding(self, text: str) -> np.ndarray:
        """
        Compute embedding for text
        
        Args:
            text: Input text to embed
            
        Returns:
            Embedding vector
        """
        if not self.embedder:
            raise ValueError("Embedder not initialized")
        
        # TODO: Implement embedding computation
        embedding = np.zeros(384)  # Example for all-MiniLM-L6-v2
        return embedding
    
    @staticmethod
    def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """
        Compute cosine similarity between two vectors
        
        Args:
            vec1: First vector
            vec2: Second vector
            
        Returns:
            Cosine similarity score (0-1)
        """
        if len(vec1) == 0 or len(vec2) == 0:
            return 0.0
        
        # Compute cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = dot_product / (norm1 * norm2)
        # Normalize to 0-1 range
        return max(0.0, min(1.0, (similarity + 1) / 2))
    
    def score_cv_jd_match(self, cv_embedding: np.ndarray, jd_embedding: np.ndarray) -> float:
        """
        Score CV-JD match using cosine similarity
        
        Args:
            cv_embedding: CV text embedding
            jd_embedding: JD text embedding
            
        Returns:
            Match score (0-100)
        """
        similarity = self.cosine_similarity(cv_embedding, jd_embedding)
        return similarity * 100
    
    def score_skill_match(self, cv_skills: list, required_skills: list, preferred_skills: list = None) -> Tuple[float, dict]:
        """
        Score skill match between CV and JD
        
        Args:
            cv_skills: Skills from CV
            required_skills: Required skills from JD
            preferred_skills: Preferred skills from JD
            
        Returns:
            Skill match score and details
        """
        if not required_skills:
            return 0.0, {}
        
        cv_skills_set = set([s.lower() for s in cv_skills])
        required_set = set([s.lower() for s in required_skills])
        preferred_set = set([s.lower() for s in (preferred_skills or [])])
        
        # Match scores
        required_matched = len(cv_skills_set & required_set)
        preferred_matched = len(cv_skills_set & preferred_set)
        
        # Calculate percentage
        required_score = (required_matched / len(required_set)) * 100 if required_set else 0
        preferred_score = (preferred_matched / len(preferred_set)) * 100 if preferred_set else 0
        
        details = {
            'required_matched': required_matched,
            'required_total': len(required_set),
            'preferred_matched': preferred_matched,
            'preferred_total': len(preferred_set),
            'matched_skills': list(cv_skills_set & required_set),
            'missing_skills': list(required_set - cv_skills_set)
        }
        
        # Combined score (70% required, 30% preferred)
        combined_score = (required_score * 0.7) + (preferred_score * 0.3)
        
        return combined_score, details
