import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Camera, Save, X, RefreshCw, Settings, Mail } from 'lucide-react';

const ProfileSettings = ({ onClose }) => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        fullName: '',
        profilePicture: ''
    });
    const [patientMeta, setPatientMeta] = useState({
        age: 0,
        gender: '',
        bloodGroup: '',
        contactNumber: '',
        address: ''
    });
    const [doctorMeta, setDoctorMeta] = useState({
        contactNumber: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('account');

    const API_BASE_URL = 'http://localhost:8080/api';
    const userRole = localStorage.getItem('role');
    const isPatient = userRole === 'ROLE_PATIENT';
    const isDoctor = userRole === 'ROLE_DOCTOR';

    const fetchProfile = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);

            if (isPatient) {
                const patientRes = await axios.get(`${API_BASE_URL}/patient/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPatientMeta({
                    age: patientRes.data.age || 0,
                    gender: patientRes.data.gender || '',
                    bloodGroup: patientRes.data.bloodGroup || '',
                    contactNumber: patientRes.data.contactNumber || '',
                    address: patientRes.data.address || ''
                });
            } else if (isDoctor) {
                const doctorRes = await axios.get(`${API_BASE_URL}/doctor/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDoctorMeta({
                    contactNumber: doctorRes.data.contactNumber || '',
                    address: doctorRes.data.address || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    }, [isPatient, isDoctor, API_BASE_URL]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleUserChange = (e) => {
        const { name, value } = e.currentTarget;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleMetaChange = (e) => {
        const { name, value } = e.currentTarget;
        setPatientMeta(prev => ({ ...prev, [name]: value }));
    };

    const handleDoctorMetaChange = (e) => {
        const { name, value } = e.currentTarget;
        setDoctorMeta(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setUser(prev => ({ ...prev, profilePicture: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            // Update base user profile
            await axios.put(`${API_BASE_URL}/user/profile`,
                { fullName: user.fullName, email: user.email },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update patient specific profile if applicable
            if (isPatient) {
                await axios.put(`${API_BASE_URL}/patient/profile`,
                    patientMeta,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else if (isDoctor) {
                await axios.put(`${API_BASE_URL}/doctor/profile`,
                    doctorMeta,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // Update profile picture if changed
            if (user.profilePicture && user.profilePicture.startsWith('data:image')) {
                await axios.post(`${API_BASE_URL}/user/profile-picture`,
                    { image: user.profilePicture },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setSuccess('Profile synchronized successfully!');
            setTimeout(() => {
                if (onClose) onClose();
            }, 1500);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/80 backdrop-blur-xl p-24 rounded-[40px] flex flex-col items-center justify-center space-y-6 shadow-2xl border border-white/50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-100 rounded-full animate-pulse"></div>
                    <RefreshCw className="text-primary-600 animate-spin absolute inset-0 m-auto" size={32} />
                </div>
                <p className="text-sm font-black text-primary-900 uppercase tracking-widest animate-pulse">Synchronizing...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl w-full bg-white/90 backdrop-blur-2xl rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-white flex flex-col md:flex-row h-[85vh] animate-in fade-in zoom-in-95 duration-500">
            {/* Sidebar / Tabs */}
            <div className="w-full md:w-72 bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col justify-between">
                <div className="space-y-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                            <Settings className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">Identity</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{userRole ? userRole.replace('ROLE_', '') : 'USER'}</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'account' ? 'bg-white shadow-md text-primary-600 font-bold' : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'}`}
                        >
                            <User size={18} />
                            <span className="text-sm">Account</span>
                        </button>
                        {isPatient && (
                            <button
                                onClick={() => setActiveTab('medical')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'medical' ? 'bg-white shadow-md text-primary-600 font-bold' : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'}`}
                            >
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-current flex items-center justify-center">
                                    <span className="text-[8px] font-black">+</span>
                                </div>
                                <span className="text-sm">Medical Profile</span>
                            </button>
                        )}
                        {isDoctor && (
                            <button
                                onClick={() => setActiveTab('professional')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'professional' ? 'bg-white shadow-md text-primary-600 font-bold' : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'}`}
                            >
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-current flex items-center justify-center">
                                    <span className="text-[8px] font-black">H</span>
                                </div>
                                <span className="text-sm">Professional Profile</span>
                            </button>
                        )}
                    </nav>
                </div>

                <div className="bg-primary-50 rounded-3xl p-6 border border-primary-100">
                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Cloud Synced</p>
                    <p className="text-xs text-primary-900/60 font-medium leading-relaxed">Your data is secured with AES-256 encryption and synced across your devices.</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative">
                <div className="absolute top-8 right-8 z-10">
                    <button onClick={onClose} className="p-3 bg-gray-100/50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all duration-300 group">
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="flex-1 flex flex-col p-12 overflow-y-auto chatbot-scroll">
                    <div className="mb-10 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl bg-gradient-to-br from-primary-50 to-gray-50 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-primary-200" />
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 p-4 bg-primary-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 active:scale-95 group-hover:rotate-12">
                                <Camera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Biometric Identity Photo</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-xl text-xs font-bold animate-in slide-in-from-left-4 duration-300">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-8 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-600 rounded-xl text-xs font-bold animate-in slide-in-from-left-4 duration-300">
                            {success}
                        </div>
                    )}

                    <div className="space-y-8">
                        {activeTab === 'account' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Identifier</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={user.username}
                                            disabled
                                            className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-3xl font-bold text-gray-400 cursor-not-allowed text-sm pl-12"
                                        />
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">@</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={user.fullName || ''}
                                        onChange={handleUserChange}
                                        className="w-full bg-white border border-gray-200 p-5 rounded-3xl font-bold text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 text-sm shadow-sm"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Email Endpoint</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            value={user.email || ''}
                                            onChange={handleUserChange}
                                            className="w-full bg-white border border-gray-200 p-5 rounded-3xl font-bold text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 text-sm shadow-sm pl-12"
                                            placeholder="example@ckd-ai.com"
                                        />
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'medical' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Age (Years)</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={patientMeta.age}
                                        onChange={handleMetaChange}
                                        className="w-full bg-white border border-gray-200 p-5 rounded-3xl font-bold text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender Identity</label>
                                    <select
                                        name="gender"
                                        value={patientMeta.gender}
                                        onChange={handleMetaChange}
                                        className="w-full bg-white border border-gray-200 p-5 rounded-3xl font-bold text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Blood Group</label>
                                    <select
                                        name="bloodGroup"
                                        value={patientMeta.bloodGroup}
                                        onChange={handleMetaChange}
                                        className="w-full bg-white border border-gray-200 p-5 rounded-3xl font-bold text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose Group</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Terminal</label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={patientMeta.contactNumber}
                                        onChange={handleMetaChange}
                                        className="w-full bg-white border border-gray-200 p-5 rounded-3xl font-bold text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 text-sm"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Residency Address</label>
                                    <textarea
                                        name="address"
                                        value={patientMeta.address}
                                        onChange={handleMetaChange}
                                        rows={3}
                                        className="w-full bg-white border border-gray-200 p-5 rounded-3xl font-bold text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 text-sm resize-none"
                                        placeholder="Enter your street address"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Terminal</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={doctorMeta.contactNumber}
                                            onChange={handleDoctorMetaChange}
                                            className="w-full bg-white border border-gray-200 p-5 rounded-3xl font-bold text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 text-sm pl-12"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Clinic Address</label>
                                    <textarea
                                        name="address"
                                        value={doctorMeta.address}
                                        onChange={handleDoctorMetaChange}
                                        rows={4}
                                        className="w-full bg-white border border-gray-200 p-5 rounded-3xl font-bold text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 text-sm resize-none"
                                        placeholder="Enter your clinic or hospital address"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 flex items-center space-x-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-primary-600 text-white py-5 rounded-[32px] font-black uppercase tracking-widest hover:bg-primary-700 hover:shadow-2xl hover:shadow-primary-200 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 active:scale-95 border-b-4 border-primary-800"
                        >
                            {saving ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Sync Identity</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
