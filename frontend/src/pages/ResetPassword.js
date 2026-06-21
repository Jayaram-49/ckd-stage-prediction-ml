import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ExclamationCircleIcon, CheckCircleIcon, KeyIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import ApiService from '../services/ApiService';

const ResetPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Token, 3: New Password
    const [formData, setFormData] = useState({ email: '', token: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugToken, setDebugToken] = useState('');
    const navigate = useNavigate();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await ApiService.forgotPassword(formData.email.trim());
            setDebugToken(response.debugToken || '');
            setSuccess('Reset token sent! Please check your email.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Email not found or error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleTokenVerify = async (e) => {
        e.preventDefault();
        if (!formData.token || formData.token.length !== 6) {
            setError('Please enter the 6-digit token.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await ApiService.verifyToken(formData.email.trim(), formData.token.trim());
            setStep(3);
            setSuccess('Token verified! Now set your new password.');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }
        if (!/\d/.test(formData.newPassword)) {
            setError('Password must contain at least one number.');
            return false;
        }

        setError('');
        setLoading(true);
        try {
            await ApiService.resetPassword(formData.email.trim(), formData.token.trim(), formData.newPassword);
            setSuccess('Password reset successfully! Redirecting to login...');
            setDebugToken('');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                <div className="mb-6">
                    <Link to="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition duration-200">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Login
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
                        {step === 1 && <EnvelopeIcon className="w-6 h-6 text-primary-600" />}
                        {step === 2 && <ShieldCheckIcon className="w-6 h-6 text-primary-600" />}
                        {step === 3 && <KeyIcon className="w-6 h-6 text-primary-600" />}
                    </div>
                    <h2 className="text-2xl font-bold text-primary-900">
                        {step === 1 && "Forgot Password?"}
                        {step === 2 && "Verify Token"}
                        {step === 3 && "Set New Password"}
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        {step === 1 && "Enter your email to receive a reset token."}
                        {step === 2 && `Enter the 6-digit token sent to ${formData.email}`}
                        {step === 3 && "Your token is verified. Please set a strong new password."}
                    </p>
                </div>

                {error && (
                    <div className="bg-danger-100 text-danger-700 p-3 rounded-lg mb-6 flex items-center space-x-2 border border-danger-200 text-sm animate-pulse">
                        <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-success-100 text-success-700 p-3 rounded-lg mb-6 flex items-center space-x-2 border border-success-200 text-sm">
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span>{success}</span>
                            {debugToken && step === 2 && (
                                <span className="mt-1 font-mono font-bold text-primary-700">
                                    Debug Token: {debugToken}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button disabled={loading} type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center">
                            {loading ? 'Sending...' : 'Send Reset Token'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleTokenVerify} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit Token</label>
                            <input
                                type="text"
                                maxLength="6"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition text-center text-2xl tracking-widest font-bold"
                                placeholder="000000"
                                value={formData.token}
                                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                                required
                            />
                        </div>
                        <button disabled={loading} type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center">
                            {loading ? 'Verifying...' : 'Verify Token'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-primary-600">
                            Change Email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <KeyIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                                    placeholder="••••••••"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <ShieldCheckIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button disabled={loading} type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50">
                            {loading ? 'Resetting...' : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
