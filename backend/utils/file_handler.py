"""
File handling utilities
"""

import os
import logging
from werkzeug.utils import secure_filename
from typing import Tuple

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, upload_folder: str) -> Tuple[bool, str]:
    """
    Save uploaded file safely
    
    Args:
        file: File object from request
        upload_folder: Folder to save file
        
    Returns:
        (success: bool, file_path: str)
    """
    try:
        if not file or file.filename == '':
            return False, 'No file selected'
        
        if not allowed_file(file.filename):
            return False, f'File type not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
        
        filename = secure_filename(file.filename)
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        logger.info(f"File saved: {file_path}")
        return True, file_path
    
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        return False, str(e)

def delete_file(file_path: str) -> bool:
    """Delete uploaded file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File deleted: {file_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        return False
