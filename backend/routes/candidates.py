"""
Candidate management routes
"""

from flask import Blueprint, request, jsonify
from utils.helpers import format_response
import logging

bp = Blueprint('candidates', __name__, url_prefix='/api/candidates')
logger = logging.getLogger(__name__)

# In-memory storage for demo (replace with database)
candidates_db = {}

@bp.route('', methods=['GET'])
def get_candidates():
    """Get all candidates"""
    try:
        candidates_list = list(candidates_db.values())
        return jsonify(format_response(
            data={'candidates': candidates_list},
            message=f'Retrieved {len(candidates_list)} candidates'
        )), 200
    except Exception as e:
        logger.error(f"Error getting candidates: {str(e)}")
        return jsonify(format_response(
            message=f'Error: {str(e)}',
            status='error',
            code=500
        )), 500

@bp.route('/<candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    """Get candidate details"""
    try:
        if candidate_id not in candidates_db:
            return jsonify(format_response(
                message='Candidate not found',
                status='error',
                code=404
            )), 404
        
        candidate = candidates_db[candidate_id]
        return jsonify(format_response(
            data=candidate,
            message='Candidate retrieved'
        )), 200
    except Exception as e:
        logger.error(f"Error getting candidate: {str(e)}")
        return jsonify(format_response(
            message=f'Error: {str(e)}',
            status='error',
            code=500
        )), 500

@bp.route('', methods=['POST'])
def create_candidate():
    """Create new candidate"""
    try:
        data = request.get_json()
        candidate_id = data.get('candidate_id')
        
        if not candidate_id:
            return jsonify(format_response(
                message='candidate_id is required',
                status='error',
                code=400
            )), 400
        
        candidates_db[candidate_id] = data
        
        return jsonify(format_response(
            data={'candidate_id': candidate_id},
            message='Candidate created'
        )), 201
    except Exception as e:
        logger.error(f"Error creating candidate: {str(e)}")
        return jsonify(format_response(
            message=f'Error: {str(e)}',
            status='error',
            code=500
        )), 500

@bp.route('/<candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    """Delete candidate"""
    try:
        if candidate_id not in candidates_db:
            return jsonify(format_response(
                message='Candidate not found',
                status='error',
                code=404
            )), 404
        
        del candidates_db[candidate_id]
        
        return jsonify(format_response(
            message='Candidate deleted'
        )), 200
    except Exception as e:
        logger.error(f"Error deleting candidate: {str(e)}")
        return jsonify(format_response(
            message=f'Error: {str(e)}',
            status='error',
            code=500
        )), 500
