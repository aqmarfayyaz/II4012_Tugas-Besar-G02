"""
Upload routes for CV and JD files
"""

from flask import Blueprint, request, jsonify, current_app
from utils.file_handler import save_uploaded_file, delete_file
from utils.helpers import format_response, generate_candidate_id
from services.data_cleaner import DataCleaner
import logging

bp = Blueprint('upload', __name__, url_prefix='/api/upload')
logger = logging.getLogger(__name__)

@bp.route('/cv', methods=['POST'])
def upload_cv():
    """
    Upload and parse CV file
    
    Request:
        - file: CV file (PDF/DOCX)
    
    Response:
        - candidate_id
        - parsed_data
    """
    try:
        if 'file' not in request.files:
            return jsonify(format_response(
                message='No file provided',
                status='error',
                code=400
            )), 400
        
        file = request.files['file']
        upload_folder = current_app.config['UPLOAD_FOLDER']
        
        # Save file
        success, result = save_uploaded_file(file, upload_folder)
        if not success:
            return jsonify(format_response(
                message=result,
                status='error',
                code=400
            )), 400
        
        # Minimal parsing (no AI integration): read text if plain text file
        raw_text = ''
        try:
            if result.lower().endswith('.txt'):
                with open(result, 'r', encoding='utf-8', errors='ignore') as f:
                    raw_text = f.read()
        except Exception:
            raw_text = ''

        raw_data = {
            'name': file.filename.rsplit('.', 1)[0],
            'email': '',
            'phone': '',
            'skills': [],
            'experience': '',
            'education': '',
            'summary': '',
            'raw_text': raw_text
        }

        # Clean data
        cleaned_data = DataCleaner.structure_cv_data(raw_data)
        
        # Generate candidate ID
        candidate_id = generate_candidate_id(
            cleaned_data['name'],
            cleaned_data['email']
        )
        
        # Provide a simple non-AI summary fallback if none produced
        summary = cleaned_data.get('summary') or ''
        if not summary and raw_text:
            snippet = raw_text.strip().replace('\n', ' ')
            summary = (snippet[:300] + '...') if len(snippet) > 300 else snippet

        response_data = {
            'candidate_id': candidate_id,
            'candidate_name': cleaned_data['name'],
            'email': cleaned_data['email'],
            'skills': cleaned_data['skills'],
            'summary': summary
        }

        # Standardized success message as requested
        return jsonify(format_response(
            data=response_data,
            message='cv uploaded succesfully'
        )), 200
    
    except Exception as e:
        logger.error(f"Error uploading CV: {str(e)}")
        return jsonify(format_response(
            message=f'Error: {str(e)}',
            status='error',
            code=500
        )), 500

@bp.route('/jd', methods=['POST'])
def upload_jd():
    """
    Upload Job Description (can be file or text)
    
    Request:
        - file: JD file (PDF/DOCX) OR
        - text: JD text
    
    Response:
        - jd_id
        - parsed_data
    """
    try:
        jd_text = None
        
        # Get JD from file or text
        if 'file' in request.files:
            file = request.files['file']
            upload_folder = current_app.config['UPLOAD_FOLDER']
            
            success, result = save_uploaded_file(file, upload_folder)
            if not success:
                return jsonify(format_response(
                    message=result,
                    status='error',
                    code=400
                )), 400
            
            jd_text = ''
            try:
                if result.lower().endswith('.txt'):
                    with open(result, 'r', encoding='utf-8', errors='ignore') as f:
                        jd_text = f.read()
            except Exception:
                jd_text = ''
        
        elif 'text' in request.json:
            jd_text = request.json['text']
        
        else:
            return jsonify(format_response(
                message='No JD file or text provided',
                status='error',
                code=400
            )), 400
        
        # Parse and structure JD
        jd_data = {
            'title': request.json.get('title', 'Job Position') if request.is_json else 'Job Position',
            'department': request.json.get('department', '') if request.is_json else '',
            'description': jd_text,
            'requirements': request.json.get('requirements', '') if request.is_json else '',
            'required_skills': request.json.get('required_skills', []) if request.is_json else [],
            'preferred_skills': request.json.get('preferred_skills', []) if request.is_json else [],
            'full_text': jd_text
        }
        
        cleaned_jd = DataCleaner.structure_jd_data(jd_data)
        
        response_data = {
            'jd_id': 'JD_' + str(hash(jd_text))[-8:].upper(),
            'job_title': cleaned_jd['job_title'],
            'required_skills': cleaned_jd['required_skills'],
            'preferred_skills': cleaned_jd['preferred_skills']
        }
        
        # Use the standardized success message for uploads
        return jsonify(format_response(
            data=response_data,
            message='cv uploaded succesfully'
        )), 200
    
    except Exception as e:
        logger.error(f"Error uploading JD: {str(e)}")
        return jsonify(format_response(
            message=f'Error: {str(e)}',
            status='error',
            code=500
        )), 500
