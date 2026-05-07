"""
Data Cleaning and Structuring Service
Processes and normalizes extracted CV data
"""

import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class DataCleaner:
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ''
        # Remove extra whitespace, normalize encoding
        text = ' '.join(text.split())
        return text.strip()
    
    @staticmethod
    def normalize_skills(skills: List[str]) -> List[str]:
        """Normalize and deduplicate skills"""
        if not skills:
            return []
        
        normalized = []
        seen = set()
        for skill in skills:
            clean_skill = DataCleaner.clean_text(skill).lower()
            if clean_skill and clean_skill not in seen:
                normalized.append(clean_skill)
                seen.add(clean_skill)
        
        return normalized
    
    @staticmethod
    def structure_cv_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Structure and clean raw CV data
        
        Args:
            raw_data: Raw extracted CV data
            
        Returns:
            Cleaned and structured CV data
        """
        structured = {
            'name': DataCleaner.clean_text(raw_data.get('name', '')),
            'email': raw_data.get('email', '').lower().strip(),
            'phone': raw_data.get('phone', ''),
            'skills': DataCleaner.normalize_skills(raw_data.get('skills', [])),
            'experience_text': DataCleaner.clean_text(raw_data.get('experience', '')),
            'education_text': DataCleaner.clean_text(raw_data.get('education', '')),
            'summary': DataCleaner.clean_text(raw_data.get('summary', '')),
            'full_text': DataCleaner.clean_text(raw_data.get('raw_text', ''))
        }
        
        return structured
    
    @staticmethod
    def structure_jd_data(raw_jd: Dict[str, str]) -> Dict[str, Any]:
        """
        Structure and clean raw Job Description data
        
        Args:
            raw_jd: Raw job description
            
        Returns:
            Cleaned and structured JD data
        """
        structured = {
            'job_title': DataCleaner.clean_text(raw_jd.get('title', '')),
            'department': DataCleaner.clean_text(raw_jd.get('department', '')),
            'required_skills': DataCleaner.normalize_skills(raw_jd.get('required_skills', [])),
            'preferred_skills': DataCleaner.normalize_skills(raw_jd.get('preferred_skills', [])),
            'description': DataCleaner.clean_text(raw_jd.get('description', '')),
            'requirements': DataCleaner.clean_text(raw_jd.get('requirements', '')),
            'full_text': DataCleaner.clean_text(raw_jd.get('full_text', ''))
        }
        
        return structured
