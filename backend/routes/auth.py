from flask import Blueprint, request, jsonify, current_app, redirect, g
import logging
import os
import json
from datetime import datetime, timedelta
from functools import wraps
from typing import Optional
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

import jwt
from authlib.integrations.flask_client import OAuth
from werkzeug.security import generate_password_hash, check_password_hash

from utils.helpers import format_response, validate_email

bp = Blueprint('auth', __name__, url_prefix='/api/auth')
oauth = OAuth()

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')


def init_oauth(app):
    """Initialize OAuth clients"""
    oauth.init_app(app)
    client_id = app.config.get('GOOGLE_CLIENT_ID')
    client_secret = app.config.get('GOOGLE_CLIENT_SECRET')
    if client_id and client_secret:
        oauth.register(
            name='google',
            client_id=client_id,
            client_secret=client_secret,
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={
                'scope': 'openid email profile'
            }
        )
        logger.info("Google OAuth registered (client_id=%s...)", client_id[:8])
    else:
        missing = []
        if not client_id:
            missing.append('GOOGLE_CLIENT_ID')
        if not client_secret:
            missing.append('GOOGLE_CLIENT_SECRET')
        logger.warning(
            "Google OAuth NOT configured — missing environment variables: %s. "
            "Set them in your .env file to enable Google login.",
            ', '.join(missing)
        )


def _ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump({}, f)


def _load_users():
    _ensure_data_dir()
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def _save_users(users):
    _ensure_data_dir()
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _build_profile(email: str, name: Optional[str] = None, provider: str = 'password') -> dict:
    return {
        'username': email,
        'email': email,
        'name': name or '',
        'provider': provider
    }


def _issue_token(subject: str) -> str:
    now = datetime.utcnow()
    exp = now + timedelta(minutes=current_app.config['JWT_EXP_MINUTES'])
    payload = {
        'sub': subject,
        'iat': int(now.timestamp()),
        'exp': int(exp.timestamp())
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET'], algorithm=current_app.config['JWT_ALGORITHM'])


def _decode_token(token: str) -> dict:
    return jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=[current_app.config['JWT_ALGORITHM']])


def _get_token_from_header() -> Optional[str]:
    auth_header = request.headers.get('Authorization', '')
    if auth_header.lower().startswith('bearer '):
        return auth_header.split(' ', 1)[1].strip()
    return None


def _get_user_by_token(token: str):
    try:
        payload = _decode_token(token)
    except jwt.ExpiredSignatureError:
        return None, None, 'expired'
    except jwt.InvalidTokenError:
        return None, None, 'invalid'

    username = payload.get('sub')
    users = _load_users()
    user = users.get(username)
    if not user or user.get('token') != token:
        return None, None, 'invalid'
    return username, user, None


def require_auth(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = _get_token_from_header()
        if not token:
            return jsonify(format_response(message='no token provided', status='error', code=400)), 400

        username, user, error = _get_user_by_token(token)
        if error == 'expired':
            return jsonify(format_response(message='token expired', status='error', code=401)), 401
        if not user:
            return jsonify(format_response(message='invalid token', status='error', code=401)), 401

        g.current_user = user
        g.current_username = username
        return func(*args, **kwargs)

    return wrapper


@bp.route('/register', methods=['POST'])
def register():
    """
    Register user
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            name:
              type: string
              example: "Alex Recruiter"
            email:
              type: string
              example: "alex@company.com"
            password:
              type: string
              example: "P@ssw0rd123"
    responses:
      201:
        description: User created
      400:
        description: Validation error
    """
    data = request.get_json() or {}
    email = data.get('email') or data.get('username')
    password = data.get('password')
    name = data.get('name') or data.get('full_name')

    if not email or not password:
        return jsonify(format_response(message='email and password required', status='error', code=400)), 400

    email = _normalize_email(email)
    if not validate_email(email):
        return jsonify(format_response(message='invalid email format', status='error', code=400)), 400
    if len(password) < 8:
        return jsonify(format_response(message='password must be at least 8 characters', status='error', code=400)), 400

    users = _load_users()
    if email in users:
        return jsonify(format_response(message='user exists', status='error', code=400)), 400

    hashed = generate_password_hash(password)
    profile = _build_profile(email, name=name, provider='password')
    token = _issue_token(email)
    users[email] = {'password': hashed, 'token': token, 'profile': profile}
    _save_users(users)
    return jsonify(format_response(data={'token': token, 'profile': profile}, message='user created', code=201)), 201


@bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: "alex@company.com"
            password:
              type: string
              example: "P@ssw0rd123"
    responses:
      200:
        description: Login successful
      401:
        description: Invalid credentials
    """
    data = request.get_json() or {}
    email = data.get('email') or data.get('username')
    password = data.get('password')

    if not email or not password:
        return jsonify(format_response(message='email and password required', status='error', code=400)), 400

    email = _normalize_email(email)
    users = _load_users()
    user = users.get(email)
    if not user or not user.get('password') or not check_password_hash(user['password'], password):
        return jsonify(format_response(message='invalid credentials', status='error', code=401)), 401

    profile = user.get('profile') or _build_profile(email)
    profile['email'] = email
    user['profile'] = profile

    token = _issue_token(email)
    user['token'] = token
    users[email] = user
    _save_users(users)
    return jsonify(format_response(data={'token': token, 'profile': profile}, message='login successful', code=200)), 200


@bp.route('/google', methods=['GET'])
def google_auth():
    """
    Start Google OAuth
    ---
    tags:
      - Auth
    responses:
      302:
        description: Redirect to Google OAuth
      500:
        description: Google OAuth not configured
    """
    if not current_app.config.get('GOOGLE_CLIENT_ID') or not current_app.config.get('GOOGLE_CLIENT_SECRET'):
        return jsonify(format_response(message='Google OAuth not configured', status='error', code=500)), 500

    client = oauth.create_client('google')
    redirect_uri = current_app.config.get('GOOGLE_REDIRECT_URI')
    return client.authorize_redirect(redirect_uri)


@bp.route('/google/callback', methods=['GET'])
def google_callback():
    """
    Google OAuth callback
    ---
    tags:
      - Auth
    responses:
      302:
        description: Redirect to frontend with token
      400:
        description: Missing email
    """
    try:
        client = oauth.create_client('google')
        client.authorize_access_token()
        userinfo = client.get('https://openidconnect.googleapis.com/v1/userinfo').json()
    except Exception as exc:
        logger.error("Google OAuth callback error: %s", exc)
        return jsonify(format_response(message='Google OAuth callback failed', status='error', code=500)), 500

    email = userinfo.get('email')
    name = userinfo.get('name') or userinfo.get('given_name')
    if not email:
        return jsonify(format_response(message='Google account has no email', status='error', code=400)), 400

    email = _normalize_email(email)
    users = _load_users()

    if email not in users:
        profile = _build_profile(email, name=name, provider='google')
        users[email] = {'password': None, 'token': None, 'profile': profile}
    else:
        profile = users[email].get('profile') or _build_profile(email, provider='google')
        if name:
            profile['name'] = name
        profile['email'] = email
        profile['provider'] = 'google'
        users[email]['profile'] = profile

    issued_token = _issue_token(email)
    users[email]['token'] = issued_token
    _save_users(users)

    frontend_url = current_app.config.get('FRONTEND_URL')
    query = urlencode({'token': issued_token, 'provider': 'google'})
    separator = '&' if '?' in frontend_url else '?'
    return redirect(f"{frontend_url}{separator}{query}")


@bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    """
    Logout user
    ---
    tags:
      - Auth
    security:
      - BearerAuth: []
    responses:
      200:
        description: Logout successful
      401:
        description: Invalid token
    """
    users = _load_users()
    user = users.get(g.current_username)
    if not user:
        return jsonify(format_response(message='invalid token', status='error', code=401)), 401
    user['token'] = None
    users[g.current_username] = user
    _save_users(users)
    return jsonify(format_response(message='logout successful', code=200)), 200


@bp.route('/profile', methods=['GET', 'PUT'])
@require_auth
def profile():
    """
    Get or update profile
    ---
    tags:
      - Auth
    security:
      - BearerAuth: []
    parameters:
      - in: body
        name: body
        required: false
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Alex Recruiter"
            department:
              type: string
              example: "Talent Acquisition"
    responses:
      200:
        description: Profile returned or updated
      401:
        description: Invalid token
    """
    user = g.current_user
    if request.method == 'GET':
        return jsonify(format_response(data={'profile': user.get('profile', {})}, code=200)), 200

    data = request.get_json() or {}
    profile_data = user.get('profile', {})
    profile_data.update(data)
    user['profile'] = profile_data
    users = _load_users()
    users[g.current_username] = user
    _save_users(users)
    return jsonify(format_response(data={'profile': profile_data}, message='profile updated', code=200)), 200
