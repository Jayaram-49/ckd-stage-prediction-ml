import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, ExclamationCircleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import ApiService from '../services/ApiService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'ROLE_PATIENT'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    // Trim whitespace
    const username = formData.username.trim();
    const email = formData.email.trim();
    const fullName = formData.fullName.trim();
    const password = formData.password;

    if (!fullName || fullName.length < 3) {
      setError('Full Name must be at least 3 characters');
      return false;
    }
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (/\s/.test(username)) {
      setError('Username cannot contain spaces');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await ApiService.register(
        formData.username.trim(),
        formData.password,
        formData.email.trim(),
        formData.fullName.trim(),
        formData.role
      );
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-500 hover:shadow-3xl">
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

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
            <UserPlusIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-primary-900">Create Account</h2>
          <p className="text-gray-500 text-sm mt-2">Join the CKD AI Platform</p>
        </div>

        {success && (
          <div className="bg-success-100 text-success-700 p-4 rounded-lg mb-6 flex items-center space-x-3 animate-slideDown">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-danger-100 text-danger-700 p-4 rounded-lg mb-6 flex items-center space-x-3 animate-slideDown border border-danger-200">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="transform transition-all duration-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                if (error) setError('');
              }}
              required
              disabled={loading}
            />
          </div>

          <div className="transform transition-all duration-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                if (error) setError('');
              }}
              required
              disabled={loading}
            />
          </div>

          <div className="transform transition-all duration-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (error) setError('');
              }}
              required
              disabled={loading}
            />
          </div>

          <div className="transform transition-all duration-300">
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
          </div>

          <div className="transform transition-all duration-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={loading}
            >
              <option value="ROLE_PATIENT">Patient</option>
              <option value="ROLE_DOCTOR">Doctor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
