"""
Job Matcher Service
Matches and ranks candidates against job descriptions
"""

import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class JobMatcher:
    def __init__(self, classifier=None, similarity_scorer=None):
        """
        Initialize job matcher
        
        Args:
            classifier: Logistic regression classifier for job category
            similarity_scorer: Similarity scorer for matching
        """
        self.classifier = classifier
        self.similarity_scorer = similarity_scorer
    
    def classify_job_category(self, jd_text: str) -> Dict[str, Any]:
        """
        Classify job into category using trained model
        
        Args:
            jd_text: Job description text
            
        Returns:
            Classification result with category and confidence
        """
        if not self.classifier:
            raise ValueError("Classifier not initialized")
        
        try:
            # TODO: Implement classification
            result = {
                'category': 'Unknown',
                'confidence': 0.0,
                'probabilities': {}
            }
            return result
        except Exception as e:
            logger.error(f"Error classifying job: {str(e)}")
            raise
    
    def rank_candidates(self, candidates: List[Dict[str, Any]], jd_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Rank candidates based on JD match
        
        Args:
            candidates: List of candidate data (with CV info)
            jd_data: Job description data
            
        Returns:
            Ranked list of candidates with scores
        """
        ranked_candidates = []
        
        for candidate in candidates:
            try:
                # Calculate various match scores
                similarity_score = self._calculate_similarity_score(candidate, jd_data)
                skill_score, skill_details = self._calculate_skill_score(candidate, jd_data)
                category_match = self._check_category_match(candidate, jd_data)
                
                # Combined ranking score (weighted)
                combined_score = (
                    similarity_score * 0.5 +      # Text similarity (50%)
                    skill_score * 0.35 +           # Skill match (35%)
                    category_match * 0.15          # Category match (15%)
                )
                
                ranked_candidates.append({
                    'candidate_id': candidate.get('id'),
                    'name': candidate.get('name'),
                    'overall_score': round(combined_score, 2),
                    'similarity_score': round(similarity_score, 2),
                    'skill_score': round(skill_score, 2),
                    'skill_details': skill_details,
                    'category_match': category_match,
                    'rank': 0  # Will be set after sorting
                })
            except Exception as e:
                logger.error(f"Error ranking candidate: {str(e)}")
                continue
        
        # Sort by overall score
        ranked_candidates.sort(key=lambda x: x['overall_score'], reverse=True)
        
        # Add rank
        for idx, candidate in enumerate(ranked_candidates, 1):
            candidate['rank'] = idx
        
        return ranked_candidates
    
    def _calculate_similarity_score(self, candidate: Dict, jd_data: Dict) -> float:
        """Calculate text similarity score"""
        # TODO: Implement using embeddings
        return 0.0
    
    def _calculate_skill_score(self, candidate: Dict, jd_data: Dict) -> tuple:
        """Calculate skill match score"""
        if not self.similarity_scorer:
            return 0.0, {}
        
        cv_skills = candidate.get('skills', [])
        required_skills = jd_data.get('required_skills', [])
        preferred_skills = jd_data.get('preferred_skills', [])
        
        score, details = self.similarity_scorer.score_skill_match(
            cv_skills, 
            required_skills, 
            preferred_skills
        )
        
        return score, details
    
    def _check_category_match(self, candidate: Dict, jd_data: Dict) -> float:
        """Check if candidate category matches job category"""
        # TODO: Implement category matching
        return 0.5
    
    def generate_insight(self, candidate: Dict, jd_data: Dict, scores: Dict) -> str:
        """
        Generate explanation/insight for matching
        
        Args:
            candidate: Candidate data
            jd_data: Job description data
            scores: Calculated scores
            
        Returns:
            Human-readable insight text
        """
        insights = []
        
        # Skill analysis
        if scores.get('skill_details'):
            matched = scores['skill_details'].get('required_matched', 0)
            total = scores['skill_details'].get('required_total', 1)
            insights.append(f"Matched {matched}/{total} required skills.")
            
            if scores['skill_details'].get('missing_skills'):
                missing = ', '.join(scores['skill_details']['missing_skills'][:3])
                insights.append(f"Missing: {missing}.")
        
        # Overall recommendation
        overall = scores.get('overall_score', 0)
        if overall >= 80:
            insights.append("⭐ Strong candidate match.")
        elif overall >= 60:
            insights.append("👍 Good potential match.")
        elif overall >= 40:
            insights.append("⚠️ Moderate fit, worth reviewing.")
        else:
            insights.append("❌ Limited match for this role.")
        
        return ' '.join(insights)
