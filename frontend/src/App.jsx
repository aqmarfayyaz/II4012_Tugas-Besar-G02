import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Projects from './pages/Projects';
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
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/landing" replace />;
};

function AppRoutes() {
  const { user, currentProject } = useAuth();

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
        path="/upload"
        element={
          <ProtectedRoute>
            {currentProject ? <Upload /> : <Navigate to="/projects" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            {currentProject ? <Candidates /> : <Navigate to="/projects" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/:id"
        element={
          <ProtectedRoute>
            {currentProject ? <CandidateDetail /> : <Navigate to="/projects" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/ranking"
        element={
          <ProtectedRoute>
            {currentProject ? <Ranking /> : <Navigate to="/projects" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            {currentProject ? <Analytics /> : <Navigate to="/projects" replace />}
          </ProtectedRoute>
        }
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
