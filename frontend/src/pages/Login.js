import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ExclamationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import ApiService from '../services/ApiService';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);
    try {
      const response = await ApiService.login(formData.username, formData.password);
      console.log('Login successful:', response);

      // Navigate based on role
      const roles = response.roles || response.role;
      let role = '';

      if (Array.isArray(roles)) {
        role = roles[0];
      } else if (typeof roles === 'string') {
        role = roles;
      }

      // Ensure role has ROLE_ prefix for navigation
      if (role && !role.startsWith('ROLE_')) {
        role = 'ROLE_' + role;
      }

      console.log('User role:', role);

      if (role === 'ROLE_PATIENT') navigate('/patient');
      else if (role === 'ROLE_DOCTOR') navigate('/doctor');
      else if (role === 'ROLE_ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-500">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
            <LockClosedIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-primary-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to access your account</p>
        </div>

        {error && (
          <div className="mb-6">
            <div className="bg-danger-100 text-danger-700 p-4 rounded-lg flex items-center space-x-3 border border-danger-200">
              <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
              placeholder="admin"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                if (error) setError('');
              }}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (error) setError('');
              }}
              required
              disabled={loading}
            />
            <div className="flex justify-end mt-2">
              <Link to="/reset-password" name="forgot-password" className="text-xs text-primary-600 font-semibold hover:text-primary-700 transition duration-200">
                Forgot Password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-500">Don't have an account? <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Register here</Link></p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700"><strong>example:</strong> demo / demo123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
