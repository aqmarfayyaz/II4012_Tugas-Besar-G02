import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CandidateDetail from './pages/CandidateDetail';
import Candidates from './pages/Candidates';
import Ranking from './pages/Ranking';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import History from './pages/History';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-on-surface-variant">
        Checking session...
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Route that also requires an active project — waits for projects to finish loading before redirecting
const ProjectRoute = ({ children }) => {
  const { user, authLoading, currentProject, projectsLoading } = useAuth();
  if (authLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-on-surface-variant">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return currentProject ? children : <Navigate to="/projects" replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={<ProjectRoute><Upload /></ProjectRoute>}
      />
      <Route
        path="/candidates"
        element={<ProjectRoute><Candidates /></ProjectRoute>}
      />
      <Route
        path="/candidate/:id"
        element={<ProjectRoute><CandidateDetail /></ProjectRoute>}
      />
      <Route
        path="/ranking"
        element={<ProjectRoute><Ranking /></ProjectRoute>}
      />
      <Route
        path="/analytics"
        element={<ProjectRoute><Analytics /></ProjectRoute>}
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
