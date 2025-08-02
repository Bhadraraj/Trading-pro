import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import DashboardOverview from './pages/DashboardOverview';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="trading" element={<Dashboard />} />
              <Route path="portfolio" element={<div className="text-white">Portfolio Page - Coming Soon</div>} />
              <Route path="orders" element={<div className="text-white">Orders Page - Coming Soon</div>} />
              <Route path="market" element={<div className="text-white">Market Data Page - Coming Soon</div>} />
              <Route path="positions" element={<div className="text-white">Positions Page - Coming Soon</div>} />
              <Route path="statistics" element={<div className="text-white">Statistics Page - Coming Soon</div>} />
              <Route path="risk" element={<div className="text-white">Risk Management Page - Coming Soon</div>} />
              <Route path="education" element={<div className="text-white">Education Page - Coming Soon</div>} />
              <Route path="notifications" element={<div className="text-white">Notifications Page - Coming Soon</div>} />
              <Route path="settings" element={<div className="text-white">Settings Page - Coming Soon</div>} />
              <Route path="help" element={<div className="text-white">Help Page - Coming Soon</div>} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;