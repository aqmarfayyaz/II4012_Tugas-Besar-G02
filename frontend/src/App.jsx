import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/candidate/:id" element={<CandidateDetail />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
