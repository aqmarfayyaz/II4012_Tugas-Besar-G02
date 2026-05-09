import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([
    { id: '1', name: 'Senior Engineer - Q2', role: 'Senior Developer', department: 'Engineering', createdAt: '2026-05-01' },
    { id: '2', name: 'Product Lead - Q2', role: 'Product Manager', department: 'Product', createdAt: '2026-04-28' },
  ]);

  const login = (email, password) => {
    // Mock login
    setUser({ email, name: 'John Developer' });
    return true;
  };

  const register = (email, password, name) => {
    // Mock register
    setUser({ email, name });
    return true;
  };

  const logout = () => {
    setUser(null);
    setCurrentProject(null);
  };

  const createProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects([newProject, ...projects]);
    setCurrentProject(newProject);
    return newProject;
  };

  const selectProject = (projectId) => {
    const selected = projects.find((p) => p.id === projectId);
    setCurrentProject(selected);
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter((p) => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentProject,
        projects,
        login,
        register,
        logout,
        createProject,
        selectProject,
        deleteProject,
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
