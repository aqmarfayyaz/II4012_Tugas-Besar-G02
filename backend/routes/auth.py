from flask import Blueprint, request, jsonify
import os
import json
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

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

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400

    users = _load_users()
    if username in users:
        return jsonify({'error': 'user exists'}), 400

    hashed = generate_password_hash(password)
    token = str(uuid.uuid4())
    users[username] = {'password': hashed, 'token': token, 'profile': {'username': username}}
    _save_users(users)
    return jsonify({'message': 'user created', 'token': token, 'profile': users[username]['profile']}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400

    users = _load_users()
    user = users.get(username)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'invalid credentials'}), 401

    token = str(uuid.uuid4())
    user['token'] = token
    users[username] = user
    _save_users(users)
    return jsonify({'message': 'login successful', 'token': token, 'profile': user.get('profile', {})}), 200

def _get_user_by_token(token):
    users = _load_users()
    for username, data in users.items():
        if data.get('token') == token:
            return username, data
    return None, None

@bp.route('/logout', methods=['POST'])
def logout():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '').strip()
    if not token:
        return jsonify({'error': 'no token provided'}), 400
    username, user = _get_user_by_token(token)
    if not user:
        return jsonify({'error': 'invalid token'}), 401
    user['token'] = None
    users = _load_users()
    users[username] = user
    _save_users(users)
    return jsonify({'message': 'logout successful'}), 200

@bp.route('/profile', methods=['GET', 'PUT'])
def profile():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '').strip()
    if not token:
        return jsonify({'error': 'no token provided'}), 400
    username, user = _get_user_by_token(token)
    if not user:
        return jsonify({'error': 'invalid token'}), 401

    if request.method == 'GET':
        return jsonify({'profile': user.get('profile', {})}), 200

    # PUT - update profile
    data = request.get_json() or {}
    profile = user.get('profile', {})
    profile.update(data)
    user['profile'] = profile
    users = _load_users()
    users[username] = user
    _save_users(users)
    return jsonify({'profile': profile}), 200
