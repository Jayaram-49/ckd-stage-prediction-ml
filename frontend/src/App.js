import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import PublicHome from './pages/public/Home';
import Demo from './pages/public/Demo';
import Testing from './pages/public/Testing';
import PatientDashboard from './pages/patient/Dashboard';
import DoctorLayout from './pages/doctor/DoctorLayout';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorAnalysis from './pages/doctor/Analysis';
import DoctorResultView from './pages/doctor/ResultView';
import DoctorChatbot from './pages/doctor/Chatbot';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDatasets from './pages/admin/Datasets';
import AdminModels from './pages/admin/Models';
import AdminAutoTraining from './pages/admin/AutoTraining';
import AdminUsers from './pages/admin/Users';
import AdminPatientDetails from './pages/admin/PatientDetails';
import AdminLogs from './pages/admin/Logs';
import AdminChatbot from './pages/admin/Chatbot';
import Chatbot from './components/Chatbot';
import ScrollToTopButton from './components/ScrollToTopButton';

// Mock Auth Check
const isAuthenticated = () => !!localStorage.getItem('token');
const getUserRole = () => localStorage.getItem('role');

const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (!allowedRoles.includes(getUserRole())) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Patient Routes */}
          <Route path="/patient/*" element={
            <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor/*" element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <DoctorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DoctorDashboard />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="analysis" element={<DoctorPatients />} />
            <Route path="analysis/report/:id" element={<DoctorResultView />} />
            <Route path="analysis-dashboard" element={<DoctorAnalysis />} />
            <Route path="chatbot" element={<DoctorChatbot />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="datasets" element={<AdminDatasets />} />
            <Route path="models" element={<AdminModels />} />
            <Route path="auto-training" element={<AdminAutoTraining />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminPatientDetails />} />
            <Route path="users/:id" element={<AdminPatientDetails />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="chatbot" element={<AdminChatbot />} />
          </Route>
        </Routes>

        {/* Global Chatbot for logged in users */}
        {isAuthenticated() && <Chatbot />}

        {/* Scroll to Top Button (appears on all pages) */}
        <ScrollToTopButton />
      </div>
    </Router>
  );
}

export default App;
