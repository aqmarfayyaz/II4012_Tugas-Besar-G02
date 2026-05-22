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
    def _coerce_text(value) -> str:
        """Convert list-or-string to a single string."""
        if isinstance(value, list):
            return ' '.join(str(item) for item in value if item)
        return value or ''

    @staticmethod
    def structure_cv_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Structure and clean raw CV data.
        Accepts both raw keys (name, experience, raw_text) and
        structured keys (candidate_name, experience_text, full_text).
        """
        name = raw_data.get('name') or raw_data.get('candidate_name', '')

        experience = (
            raw_data.get('experience_text') or
            raw_data.get('experience', '')
        )
        education = (
            raw_data.get('education_text') or
            raw_data.get('education', '')
        )
        full_text = (
            raw_data.get('full_text') or
            raw_data.get('raw_text', '')
        )

        structured = {
            'id': raw_data.get('id') or raw_data.get('candidate_id', ''),
            'name': DataCleaner.clean_text(name),
            'email': raw_data.get('email', '').lower().strip(),
            'phone': raw_data.get('phone', ''),
            'skills': DataCleaner.normalize_skills(raw_data.get('skills', [])),
            'experience_text': DataCleaner.clean_text(DataCleaner._coerce_text(experience)),
            'education_text': DataCleaner.clean_text(DataCleaner._coerce_text(education)),
            'summary': DataCleaner.clean_text(raw_data.get('summary', '')),
            'full_text': DataCleaner.clean_text(DataCleaner._coerce_text(full_text)),
        }

        # Preserve prediction if already computed upstream
        predicted = raw_data.get('predicted_category') or raw_data.get('predicted_label')
        if predicted:
            structured['predicted_category'] = predicted

        return structured

    @staticmethod
    def structure_jd_data(raw_jd: Dict[str, str]) -> Dict[str, Any]:
        """
        Structure and clean raw Job Description data.
        Accepts both 'title' and 'job_title'.
        """
        job_title = raw_jd.get('job_title') or raw_jd.get('title', '')

        structured = {
            'job_title': DataCleaner.clean_text(job_title),
            'department': DataCleaner.clean_text(raw_jd.get('department', '')),
            'required_skills': DataCleaner.normalize_skills(raw_jd.get('required_skills', [])),
            'preferred_skills': DataCleaner.normalize_skills(raw_jd.get('preferred_skills', [])),
            'description': DataCleaner.clean_text(raw_jd.get('description', '')),
            'requirements': DataCleaner.clean_text(raw_jd.get('requirements', '')),
            'full_text': DataCleaner.clean_text(raw_jd.get('full_text', '')),
        }

        # Preserve job_category if already classified upstream
        if raw_jd.get('job_category'):
            structured['job_category'] = raw_jd['job_category']

        return structured
