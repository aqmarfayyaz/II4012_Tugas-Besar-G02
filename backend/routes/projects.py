"""
Project management routes
"""

from flask import Blueprint, request, jsonify
import os
import json
import uuid
from datetime import datetime

from utils.helpers import format_response
from routes.auth import require_auth

bp = Blueprint('projects', __name__, url_prefix='/api/projects')

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
PROJECTS_FILE = os.path.join(DATA_DIR, 'projects.json')

REQUIRED_FIELDS = [
    'name',
    'job_title',
    'department',
    'job_description',
    'required_skills',
    'employment_type',
    'start_date',
    'end_date'
]

ALLOWED_EMPLOYMENT_TYPES = {'full-time', 'internship', 'contract'}
ALLOWED_STATUS = {'draft', 'active', 'closed'}


def _ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(PROJECTS_FILE):
        with open(PROJECTS_FILE, 'w', encoding='utf-8') as f:
            json.dump({}, f)


def _load_projects():
    _ensure_data_dir()
    with open(PROJECTS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def _save_projects(projects):
    _ensure_data_dir()
    with open(PROJECTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(projects, f, indent=2)


def _normalize_skills(value):
    if isinstance(value, list):
        return [item.strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [item.strip() for item in value.split(',') if item.strip()]
    return []


def _validate_payload(data, partial=False):
    missing = []
    if not partial:
        for field in REQUIRED_FIELDS:
            if not data.get(field):
                missing.append(field)

    if missing:
        return False, f"Missing fields: {', '.join(missing)}"

    employment_type = data.get('employment_type')
    if employment_type and employment_type not in ALLOWED_EMPLOYMENT_TYPES:
        return False, 'Invalid employment_type'

    status = data.get('status')
    if status and status not in ALLOWED_STATUS:
        return False, 'Invalid status'

    return True, None


@bp.route('', methods=['GET'])
@require_auth
def list_projects():
    """
    List projects
    ---
    tags:
      - Projects
    responses:
      200:
        description: Projects retrieved
      401:
        description: Unauthorized
    """
    projects = _load_projects()
    project_list = list(projects.values())
    return jsonify(format_response(
        data={'projects': project_list},
        message=f'Retrieved {len(project_list)} projects'
    )), 200


@bp.route('', methods=['POST'])
@require_auth
def create_project():
    """
    Create project
    ---
    tags:
      - Projects
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - job_title
            - department
            - job_description
            - required_skills
            - employment_type
            - start_date
            - end_date
          properties:
            name:
              type: string
            job_title:
              type: string
            department:
              type: string
            job_description:
              type: string
            required_skills:
              type: array
              items:
                type: string
            employment_type:
              type: string
              enum: [full-time, internship, contract]
            start_date:
              type: string
            end_date:
              type: string
            hiring_quota:
              type: integer
            hiring_manager:
              type: string
            priority:
              type: string
            notes:
              type: string
            status:
              type: string
              enum: [draft, active, closed]
    responses:
      201:
        description: Project created
      400:
        description: Validation error
    """
    data = request.get_json() or {}

    valid, error = _validate_payload(data)
    if not valid:
        return jsonify(format_response(message=error, status='error', code=400)), 400

    project_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    project = {
        'id': project_id,
        'name': data.get('name'),
        'job_title': data.get('job_title'),
        'department': data.get('department'),
        'job_description': data.get('job_description'),
        'required_skills': _normalize_skills(data.get('required_skills')),
        'employment_type': data.get('employment_type'),
        'start_date': data.get('start_date'),
        'end_date': data.get('end_date'),
        'hiring_quota': data.get('hiring_quota'),
        'hiring_manager': data.get('hiring_manager'),
        'priority': data.get('priority'),
        'notes': data.get('notes'),
        'status': data.get('status', 'draft'),
        'created_at': now,
        'updated_at': now
    }

    projects = _load_projects()
    projects[project_id] = project
    _save_projects(projects)

    return jsonify(format_response(
        data={'project': project},
        message='Project created',
        code=201
    )), 201


@bp.route('/<project_id>', methods=['GET'])
@require_auth
def get_project(project_id):
    """
    Get project detail
    ---
    tags:
      - Projects
    parameters:
      - in: path
        name: project_id
        required: true
        type: string
    responses:
      200:
        description: Project retrieved
      404:
        description: Project not found
    """
    projects = _load_projects()
    project = projects.get(project_id)
    if not project:
        return jsonify(format_response(message='Project not found', status='error', code=404)), 404

    return jsonify(format_response(
        data={'project': project},
        message='Project retrieved'
    )), 200


@bp.route('/<project_id>', methods=['PUT'])
@require_auth
def update_project(project_id):
    """
    Update project
    ---
    tags:
      - Projects
    parameters:
      - in: path
        name: project_id
        required: true
        type: string
      - in: body
        name: body
        required: true
        schema:
          type: object
    responses:
      200:
        description: Project updated
      404:
        description: Project not found
    """
    data = request.get_json() or {}
    valid, error = _validate_payload(data, partial=True)
    if not valid:
        return jsonify(format_response(message=error, status='error', code=400)), 400

    projects = _load_projects()
    project = projects.get(project_id)
    if not project:
        return jsonify(format_response(message='Project not found', status='error', code=404)), 404

    if 'required_skills' in data:
        data['required_skills'] = _normalize_skills(data.get('required_skills'))

    project.update(data)
    project['updated_at'] = datetime.utcnow().isoformat()

    projects[project_id] = project
    _save_projects(projects)

    return jsonify(format_response(
        data={'project': project},
        message='Project updated'
    )), 200


@bp.route('/<project_id>', methods=['DELETE'])
@require_auth
def delete_project(project_id):
    """
    Delete project
    ---
    tags:
      - Projects
    parameters:
      - in: path
        name: project_id
        required: true
        type: string
    responses:
      200:
        description: Project deleted
      404:
        description: Project not found
    """
    projects = _load_projects()
    project = projects.get(project_id)
    if not project:
        return jsonify(format_response(message='Project not found', status='error', code=404)), 404

    del projects[project_id]
    _save_projects(projects)

    return jsonify(format_response(message='Project deleted')), 200
