import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  getProfile,
  getGoogleAuthUrl,
  getProjects,
  createProject as createProjectApi,
  updateProject as updateProjectApi,
  deleteProject as deleteProjectApi,
} from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [authLoading, setAuthLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const persistToken = (newToken) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_project_id');
    setToken(null);
    setUser(null);
    setCurrentProject(null);
  };

  const bootstrapProfile = async (activeToken) => {
    const response = await getProfile(activeToken);
    const payload = response.data?.data || response.data;
    const profile = payload.profile || payload.data?.profile || payload;
    setUser(profile);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      persistToken(urlToken);
      params.delete('token');
      params.delete('provider');
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
      window.history.replaceState({}, document.title, nextUrl);
    }

    const activeToken = urlToken || localStorage.getItem('auth_token');
    if (!activeToken) {
      setAuthLoading(false);
      return;
    }

    bootstrapProfile(activeToken)
      .catch(() => {
        clearAuth();
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    const payload = response.data?.data || response.data;
    if (!payload?.token) {
      throw new Error(payload?.message || 'Login failed');
    }
    persistToken(payload.token);
    setUser(payload.profile || { email });
    return payload;
  };

  const register = async (email, password, name) => {
    const response = await registerUser({ email, password, name });
    const payload = response.data?.data || response.data;
    if (!payload?.token) {
      throw new Error(payload?.message || 'Register failed');
    }
    persistToken(payload.token);
    setUser(payload.profile || { email, name });
    return payload;
  };

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await getProjects();
      const payload = response.data?.data || response.data;
      const projectList = payload.projects || payload.data?.projects || [];
      setProjects(projectList);

      const storedId = localStorage.getItem('current_project_id');
      if (storedId) {
        const active = projectList.find((project) => project.id === storedId);
        if (active) {
          setCurrentProject(active);
        }
      }
    } finally {
      setProjectsLoading(false);
    }
  };

  const startGoogleAuth = () => {
    window.location.href = getGoogleAuthUrl();
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutUser(token);
      } catch (error) {
        // Ignore API errors on logout
      }
    }
    clearAuth();
  };

  const createProject = async (projectData) => {
    const response = await createProjectApi(projectData);
    const payload = response.data?.data || response.data;
    const created = payload.project || payload.data?.project;
    if (!created) {
      throw new Error(payload?.message || 'Project creation failed');
    }
    setProjects((prev) => [created, ...prev]);
    setCurrentProject(created);
    localStorage.setItem('current_project_id', created.id);
    return created;
  };

  const updateProject = async (projectId, projectData) => {
    const response = await updateProjectApi(projectId, projectData);
    const payload = response.data?.data || response.data;
    const updated = payload.project || payload.data?.project;
    if (!updated) {
      throw new Error(payload?.message || 'Project update failed');
    }
    setProjects((prev) => prev.map((item) => (item.id === projectId ? updated : item)));
    if (currentProject?.id === projectId) {
      setCurrentProject(updated);
    }
    return updated;
  };

  const selectProject = (projectId) => {
    const selected = projects.find((project) => project.id === projectId);
    if (selected) {
      setCurrentProject(selected);
      localStorage.setItem('current_project_id', selected.id);
    }
  };

  const deleteProject = async (projectId) => {
    await deleteProjectApi(projectId);
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
      localStorage.removeItem('current_project_id');
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchProjects().catch(() => {
        setProjects([]);
      });
    }
  }, [user, token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        currentProject,
        projects,
        projectsLoading,
        login,
        register,
        startGoogleAuth,
        logout,
        createProject,
        updateProject,
        selectProject,
        deleteProject,
        fetchProjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
