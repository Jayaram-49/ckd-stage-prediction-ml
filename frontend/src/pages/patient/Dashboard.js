import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import EnhancedOverview from './EnhancedOverview';
import LabEntry from './LabEntry';
import HistoryPage from './History';
import ResultView from './ResultView';
import PatientChatbot from './PatientChatbot';
import axios from 'axios';
import ProfileSettings from '../shared/ProfileSettings';
import {
  LayoutDashboard,
  Beaker,
  History,
  User,
  MessageCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import ApiService from '../../services/ApiService';

const PatientDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState(null);
  const [showProfile, setShowProfile] = React.useState(false);

  const fetchProfile = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile in dashboard:', err);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    ApiService.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/patient', icon: <LayoutDashboard size={20} /> },
    { name: 'Enter Lab Data', path: '/patient/lab-entry', icon: <Beaker size={20} /> },
    { name: 'Medical History', path: '/patient/history', icon: <History size={20} /> },
    { name: 'AI Chatbot', path: '/patient/chatbot', icon: <MessageCircle size={20} /> },
    { name: 'Profile Settings', path: '#', onClick: () => setShowProfile(true), icon: <User size={20} /> },
  ];

  const isActive = (path) => path !== '#' && (location.pathname === path || (path === '/patient' && location.pathname.startsWith('/patient') && !location.pathname.includes('/')));

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">CKD</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-900">CKD Portal</h1>
              <p className="text-xs text-gray-500">Patient Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            item.onClick ? (
              <button
                key={item.name}
                onClick={item.onClick}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition duration-200 group text-gray-600 hover:bg-gray-50 hover:text-primary-600"
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition duration-200 group ${isActive(item.path)
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {isActive(item.path) && <ChevronRight size={16} />}
              </Link>
            )
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <button
            onClick={() => setShowProfile(true)}
            className="w-full flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 hover:border-primary-100 transition duration-200 text-left"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary-50 flex items-center justify-center">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-primary-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{profile?.fullName || profile?.username || 'Patient'}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Active Session</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-danger-600 hover:bg-danger-50 border border-danger-200 rounded-lg transition font-semibold"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 relative">
        <Routes>
          <Route path="/" element={<EnhancedOverview />} />
          <Route path="/lab-entry" element={<LabEntry />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/result/:id" element={<ResultView />} />
          <Route path="/chatbot" element={<PatientChatbot />} />
        </Routes>

        {showProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <ProfileSettings onClose={() => {
              setShowProfile(false);
              fetchProfile();
            }} />
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
