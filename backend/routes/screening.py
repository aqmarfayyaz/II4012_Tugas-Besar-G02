"""
Screening routes for CV-JD matching and ranking (lightweight, non-AI fallback)

This implementation uses simple text and skill overlap heuristics so the
backend works without external AI integrations. Replace with AI-powered
implementations later when needed.
"""

from flask import Blueprint, request, jsonify
from services.data_cleaner import DataCleaner
from utils.helpers import format_response
import logging
import re

bp = Blueprint('screening', __name__, url_prefix='/api/screening')
logger = logging.getLogger(__name__)

def _tokenize(text: str):
    if not text:
        return set()
    return set(re.findall(r"\w+", text.lower()))

def _jaccard(a: str, b: str) -> float:
    sa = _tokenize(a)
    sb = _tokenize(b)
    if not sa and not sb:
        return 0.0
    inter = sa.intersection(sb)
    union = sa.union(sb)
    return float(len(inter)) / float(len(union)) if union else 0.0

def _score_skill_match(cv_skills, required_skills, preferred_skills):
    # Normalize skills
    cv_set = set(DataCleaner.normalize_skills(cv_skills))
    req_set = set(DataCleaner.normalize_skills(required_skills))
    pref_set = set(DataCleaner.normalize_skills(preferred_skills))

    req_match = 0.0
    pref_match = 0.0
    req_details = []

    if req_set:
        matched = cv_set.intersection(req_set)
        req_match = len(matched) / len(req_set)
        req_details = list(matched)

    if pref_set:
        pref_match = len(cv_set.intersection(pref_set)) / len(pref_set)

    # Weighted skill score
    skill_score = (req_match * 0.8) + (pref_match * 0.2)
    return skill_score, {
        'required_matched': req_details,
        'required_total': len(req_set),
        'preferred_matched_count': int(pref_match * len(pref_set)) if pref_set else 0
    }

@bp.route('/match', methods=['POST'])
def match_cv_jd():
    """
    Match single CV against JD and get score
    
    Request JSON:
        - cv_data: Parsed CV data
        - jd_data: Parsed JD data
    
    Response:
        - overall_score
        - similarity_score
        - skill_score
        - insight
    """
    try:
        data = request.get_json()
        
        if not data or 'cv_data' not in data or 'jd_data' not in data:
            return jsonify(format_response(
                message='Missing cv_data or jd_data',
                status='error',
                code=400
            )), 400
        
        cv_data = data['cv_data']
        jd_data = data['jd_data']
        
        # Clean data
        cleaned_cv = DataCleaner.structure_cv_data(cv_data)
        cleaned_jd = DataCleaner.structure_jd_data(jd_data)
        
        # Lightweight matching (no AI): text overlap + skill overlap
        text_sim = _jaccard(cleaned_cv.get('full_text', ''), cleaned_jd.get('full_text', ''))
        skill_score, skill_details = _score_skill_match(
            cleaned_cv.get('skills', []),
            cleaned_jd.get('required_skills', []),
            cleaned_jd.get('preferred_skills', [])
        )

        overall_score = (text_sim * 0.6) + (skill_score * 0.4)

        # Simple human-readable insight
        insight = {
            'summary': f"Text similarity: {round(text_sim,2)}, Skill score: {round(skill_score,2)}",
            'recommendation': 'Proceed to interview' if overall_score >= 0.7 else 'Further review needed'
        }
        
        response_data = {
            'overall_score': round(overall_score, 2),
            'similarity_score': round(text_sim, 2),
            'skill_score': round(skill_score, 2),
            'skill_details': skill_details,
            'insight': insight
        }
        
        return jsonify(format_response(
            data=response_data,
            message='Matching completed'
        )), 200
    
    except Exception as e:
        logger.error(f"Error matching CV-JD: {str(e)}")
        return jsonify(format_response(
            message=f'Error: {str(e)}',
            status='error',
            code=500
        )), 500

@bp.route('/rank', methods=['POST'])
def rank_candidates():
    """
    Rank multiple candidates against a JD
    
    Request JSON:
        - candidates: List of candidate objects
        - jd_data: Job description data
    
    Response:
        - ranked_candidates (sorted by score)
    """
    try:
        data = request.get_json()
        
        if not data or 'candidates' not in data or 'jd_data' not in data:
            return jsonify(format_response(
                message='Missing candidates or jd_data',
                status='error',
                code=400
            )), 400
        
        candidates = data['candidates']
        jd_data = data['jd_data']
        
        # Clean JD data
        cleaned_jd = DataCleaner.structure_jd_data(jd_data)
        
        # Rank candidates using lightweight heuristics
        scored = []
        for c in candidates:
            try:
                cleaned_c = DataCleaner.structure_cv_data(c)
            except Exception:
                cleaned_c = {
                    'name': c.get('name', ''),
                    'email': c.get('email', ''),
                    'skills': c.get('skills', []),
                    'full_text': c.get('summary', '')
                }

            text_sim = _jaccard(cleaned_c.get('full_text', ''), cleaned_jd.get('full_text', ''))
            skill_score, _ = _score_skill_match(cleaned_c.get('skills', []), cleaned_jd.get('required_skills', []), cleaned_jd.get('preferred_skills', []))
            overall = (text_sim * 0.6) + (skill_score * 0.4)
            scored.append({**cleaned_c, 'overall_score': round(overall, 2), 'text_similarity': round(text_sim, 2), 'skill_score': round(skill_score, 2)})

        ranked = sorted(scored, key=lambda x: x['overall_score'], reverse=True)
        
        response_data = {
            'total_candidates': len(ranked),
            'ranked_candidates': ranked
        }
        
        return jsonify(format_response(
            data=response_data,
            message=f'Ranked {len(ranked)} candidates'
        )), 200
    
    except Exception as e:
        logger.error(f"Error ranking candidates: {str(e)}")
        return jsonify(format_response(
            message=f'Error: {str(e)}',
            status='error',
            code=500
        )), 500
