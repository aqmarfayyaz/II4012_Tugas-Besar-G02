import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = () => api.get('/health');

// Upload endpoints
export const uploadCV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

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

// Candidate endpoints
export const getCandidates = () => api.get('/candidates');
export const getCandidate = (id) => api.get(`/candidates/${id}`);
export const createCandidate = (data) => api.post('/candidates', data);
export const deleteCandidate = (id) => api.delete(`/candidates/${id}`);

// Auth endpoints
export const registerUser = (payload) => api.post('/auth/register', payload);
export const loginUser = (payload) => api.post('/auth/login', payload);
export const logoutUser = (token) => api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
export const getProfile = (token) => api.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
export const updateProfile = (token, payload) => api.put('/auth/profile', payload, { headers: { Authorization: `Bearer ${token}` } });

export default api;
