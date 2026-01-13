import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ManagerDashboard from './pages/ManagerDashboard';
import TeamDashboard from './pages/TeamDashboard';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerBookings from './pages/ManagerBookings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FacilitiesPage from './pages/FacilitiesPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div> 
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/login" 
              element={
                  <LoginPage />
              } 
            />
            <Route 
              path="/register" 
              element={
                  <RegisterPage />
              } 
            />
            <Route 
              path="/user-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['team_manager', 'team manager', 'admin']}>
                  <TeamDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['facility_manager', 'facility manager', 'field_manager', 'manager', 'admin']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            /> 
            <Route 
              path="/manager/bookings" 
              element={
                <ProtectedRoute allowedRoles={['facility_manager', 'facility manager', 'field_manager', 'manager', 'admin']}>
                  <ManagerBookings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/resetpassword/:resetToken" element={<ResetPassword />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;