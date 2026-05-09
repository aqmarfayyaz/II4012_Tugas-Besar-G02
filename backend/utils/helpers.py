"""
Helper functions
"""

import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def generate_candidate_id(name: str, email: str) -> str:
    """Generate unique candidate ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    name_part = name.replace(' ', '')[:5].upper()
    email_part = email.split('@')[0][:5].upper()
    return f"{name_part}_{email_part}_{timestamp}"

def format_response(data=None, message='Success', status='success', code=200):
    """Format API response"""
    return {
        'status': status,
        'message': message,
        'data': data,
        'code': code
    }

def validate_email(email: str) -> bool:
    """Simple email validation"""
    return '@' in email and '.' in email

def validate_phone(phone: str) -> bool:
    """Simple phone validation"""
    return len(phone.replace('-', '').replace(' ', '').replace('+', '')) >= 7
