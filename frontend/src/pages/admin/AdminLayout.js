import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  RefreshCw,
  Users,
  FileText,
  MessageCircle,
  User,
  Settings,
  X,
  Stethoscope
} from 'lucide-react';
import ProfileSettings from '../shared/ProfileSettings';

const AdminLayout = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile in layout:', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Datasets', path: '/admin/datasets', icon: <Database size={18} /> },
    { name: 'Models', path: '/admin/models', icon: <BarChart3 size={18} /> },
    { name: 'Auto-Training', path: '/admin/auto-training', icon: <RefreshCw size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Logs', path: '/admin/logs', icon: <FileText size={18} /> },
    { name: 'AI Chatbot', path: '/admin/chatbot', icon: <MessageCircle size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r fixed h-full">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-9 h-9 bg-primary-700 rounded-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary-900">Admin Portal</span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center border-2 border-primary-50">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="text-primary-600" size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{profile?.fullName || profile?.username || 'Admin'}</p>
              <button
                onClick={() => setShowProfile(true)}
                className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition flex items-center space-x-1"
              >
                <Settings size={10} />
                <span>Settings</span>
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-danger-600 hover:bg-danger-50 rounded-lg font-bold text-sm text-left flex items-center space-x-3 transition"
          >
            <X size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 relative">
        <Outlet />

        {showProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <ProfileSettings onClose={() => {
              setShowProfile(false);
              fetchProfile(); // Refresh profile after possible updates
            }} />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLayout;
