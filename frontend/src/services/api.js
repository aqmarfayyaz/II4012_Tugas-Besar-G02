import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_project_id');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getHealth = () => api.get('/health');

// Upload endpoints
export const uploadCV = (file, projectId = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (projectId) formData.append('project_id', projectId);
  return api.post('/upload/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getMyCandidates = (projectId = '') =>
  api.get('/upload/candidates', { params: projectId ? { project_id: projectId } : {} });

export const uploadJD = (file, metadata = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  Object.keys(metadata).forEach(key => {
    formData.append(key, metadata[key]);
  });
  return api.post('/upload/jd', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadJDText = (jdData) => {
  return api.post('/upload/jd', jdData);
};

// Screening endpoints
export const matchCVJD = (cvData, jdData) => {
  return api.post('/screening/match', { cv_data: cvData, jd_data: jdData });
};

export const rankCandidates = (candidates, jdData) => {
  return api.post('/screening/rank', { candidates, jd_data: jdData });
};

export const saveScreeningResults = (data) =>
  api.post('/screening/save-results', data);

export const getScreeningResults = (projectId = '') =>
  api.get('/screening/results', { params: projectId ? { project_id: projectId } : {} });

// Candidate endpoints
export const getCandidates = (params = {}) => api.get('/candidates', { params });
export const getProjectCandidates = (projectId, params = {}) =>
  api.get(`/projects/${projectId}/candidates`, { params });
export const getCandidate = (id) => api.get(`/candidates/${id}`);
export const updateCandidateStatus = (id, status) => api.patch(`/candidates/${id}/status`, { status });
export const createCandidate = (data) => api.post('/candidates', data);
export const deleteCandidate = (id) => api.delete(`/candidates/${id}`);

// Auth endpoints
export const registerUser = (payload) => api.post('/auth/register', payload);
export const loginUser = (payload) => api.post('/auth/login', payload);
export const logoutUser = (token) => api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
export const getProfile = (token) => api.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
export const updateProfile = (token, payload) => api.put('/auth/profile', payload, { headers: { Authorization: `Bearer ${token}` } });
export const getGoogleAuthUrl = () => `${API_URL}/auth/google`;

// Project endpoints
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (payload) => api.post('/projects', payload);
export const updateProject = (id, payload) => api.put(`/projects/${id}`, payload);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export default api;
