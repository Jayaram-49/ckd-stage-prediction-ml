import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  LineChart,
  MessageCircle,
  Search,
  Stethoscope
} from 'lucide-react';
import ProfileSettings from '../shared/ProfileSettings';

const DoctorLayout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/doctor', icon: <LayoutDashboard size={18} /> },
    { name: 'Patients', path: '/doctor/patients', icon: <Users size={18} /> },
    { name: 'Analysis', path: '/doctor/analysis', icon: <LineChart size={18} /> },
    { name: 'Chatbot', path: '/doctor/chatbot', icon: <MessageCircle size={18} /> },
  ];
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [showResults, setShowResults] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [profile, setProfile] = React.useState(null);
  const navigate = useNavigate();

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

  React.useEffect(() => {
    fetchProfile();
  }, []);

  React.useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/doctor/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const matches = res.data.filter(p =>
          p.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const resultsWithReport = await Promise.all(matches.slice(0, 5).map(async (p) => {
          const historyRes = await axios.get(`http://localhost:8080/api/doctor/patient/${p.id}/history`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return { ...p, latestReportId: historyRes.data[0]?.id };
        }));

        setSearchResults(resultsWithReport);
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPatient = (reportId) => {
    if (reportId) {
      navigate(`/doctor/analysis/report/${reportId}`);
    }
    setSearchQuery('');
    setShowResults(false);
  };

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
            <span className="text-lg font-bold text-primary-900">Doctor Portal</span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
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
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-danger-600 hover:bg-danger-50 rounded-lg font-bold"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
        <header className="h-16 bg-white border-b sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="relative w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Global Patient Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition outline-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
            </div>

            {showResults && searchResults.length > 0 && (
              <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p.latestReportId)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col transition"
                  >
                    <span className="font-bold text-gray-900">{p.user.fullName}</span>
                    <span className="text-xs text-gray-500">
                      {p.latestReportId ? 'Click to view latest report' : 'No clinical reports available'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-3 text-right group"
            >
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition">{profile?.fullName || 'Clinical Specialist'}</p>
                <p className="text-xs text-gray-500 uppercase tracking-tighter">CKD AI Expert</p>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center border-2 border-primary-50">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {profile?.fullName?.charAt(0) || 'D'}
                  </div>
                )}
              </div>
            </button>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>

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

export default DoctorLayout;
