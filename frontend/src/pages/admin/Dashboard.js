import React, { useState } from 'react';
import axios from 'axios';
import {
  Settings,
  Database,
  BarChart3,
  ShieldAlert,
  RefreshCw,
  Activity,
  Info,
  X,
  ExternalLink,
  Users,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [metrics] = useState({
    accuracy: 0.965,
    precision: 0.958,
    recall: 0.962,
    f1Score: 0.960,
    version: 'v1.2.0',
    lastTrained: new Date().toISOString()
  });
  const [isRetraining, setIsRetraining] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [autoTraining, setAutoTraining] = useState(true);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [roles, setRoles] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/admin/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.slice(0, 5)); // Show only latest 5
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const fetchRolesAndAdmins = async () => {
    setIsLoadingRoles(true);
    setSelectedRoleDetail(null); // Reset detail view
    try {
      const token = localStorage.getItem('token');
      const [rolesRes, adminsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/roles', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:8080/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRoles(rolesRes.data);
      setAdmins(adminsRes.data);
      setIsRolesModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch roles/admins:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      alert(`Failed to load roles and admins: ${errorMsg}`);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const fetchRoleDetail = async (roleName) => {
    setIsDetailLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/admin/role-details/${roleName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedRoleDetail(res.data);
    } catch (err) {
      console.error("Failed to fetch role detail:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const navigateToLogContext = (log) => {
    setIsModalOpen(false);
    if (log.action.includes('DATASET')) {
      navigate('/admin/datasets');
    } else if (log.action.includes('USER') || log.action.includes('AUTHENTICATION')) {
      navigate('/admin/users');
    } else if (log.action.includes('RETRAIN')) {
      navigate('/admin/auto-training');
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/admin/retrain', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Retraining triggered in background!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRetraining(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8080/api/admin/seed', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message || 'Base roles/admin created successfully!');
    } catch (err) {
      console.error(err);
      alert('Seed failed. Please check backend logs.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Control Panel</h1>
          <p className="text-gray-500">Manage AI models, datasets, and continuous learning engine.</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-sm font-bold text-gray-500 ml-2">Auto-Training</span>
          <button
            onClick={() => setAutoTraining(!autoTraining)}
            className={`w-12 h-6 rounded-full transition relative ${autoTraining ? 'bg-success-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoTraining ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard label="Model Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} trend="+1.2%" icon={<Activity className="text-primary-600" />} color="primary" />
        <MetricCard label="Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} trend="+0.5%" icon={<ShieldAlert className="text-success-600" />} color="success" />
        <MetricCard label="F1 Score" value={`${(metrics.f1Score * 100).toFixed(1)}%`} trend="+0.8%" icon={<BarChart3 className="text-warning-600" />} color="warning" />
        <MetricCard label="Model Version" value={metrics.version} trend="Active" icon={<Settings className="text-gray-600" />} color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Continuous Learning Control */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">Continuous Learning Engine</h3>
            <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-bold uppercase">v2 Engine</span>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-gray-900">Pending Training Data</h4>
                  <p className="text-sm text-gray-500">152 new patient records since last update</p>
                </div>
                <Database className="text-gray-300" size={32} />
              </div>
              <button
                onClick={handleRetrain}
                disabled={isRetraining}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center space-x-2 shadow-lg shadow-primary-200 disabled:opacity-50"
              >
                <RefreshCw className={isRetraining ? 'animate-spin' : ''} size={20} />
                <span>{isRetraining ? 'Retraining...' : 'Trigger Manual Retraining'}</span>
              </button>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-gray-900">System Bootstrap</h4>
                  <p className="text-sm text-gray-500">Create base roles and admin user</p>
                </div>
                <Database className="text-gray-300" size={32} />
              </div>
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isSeeding ? 'Seeding...' : 'Seed Roles & Admin'}</span>
              </button>
              <button
                onClick={fetchRolesAndAdmins}
                disabled={isLoadingRoles}
                className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                <Users size={18} />
                <span>{isLoadingRoles ? 'Loading...' : 'See Roles & Admins'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 border rounded-xl">
                <p className="text-gray-400 mb-1">Last Retrained</p>
                <p className="font-bold text-gray-700">{new Date(metrics.lastTrained).toLocaleDateString()}</p>
              </div>
              <div className="p-4 border rounded-xl">
                <p className="text-gray-400 mb-1">Retraining Cycle</p>
                <p className="font-bold text-gray-700">Every 50 Records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">System Audit Logs</h3>
            <button
              onClick={() => navigate('/admin/logs')}
              className="text-xs font-bold text-primary-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log) => (
                <LogItem
                  key={log.id}
                  log={log}
                  onClick={() => handleLogClick(log)}
                />
              ))
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">No recent logs found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <Info className="text-primary-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Audit Log Details</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action Type</label>
                  <p className="text-sm font-black text-primary-700 mt-1">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</label>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Performed By</label>
                  <p className="text-sm font-bold text-gray-900 mt-1">{selectedLog.performedBy}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity ID</label>
                  <p className="text-sm font-medium text-gray-500 mt-1">LOG-{selectedLog.id.toString().padStart(4, '0')}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Summary/Details</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-600 text-sm">
                  "{selectedLog.details}"
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  onClick={() => navigateToLogContext(selectedLog)}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center space-x-2"
                >
                  <ExternalLink size={18} />
                  <span>Navigate to Source</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roles & Admins Modal */}
      {isRolesModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <ShieldAlert className="text-primary-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Project Roles & Administrators</h3>
              </div>
              <button
                onClick={() => setIsRolesModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] relative min-h-[300px]">
              {isDetailLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
                  <RefreshCw className="text-primary-600 animate-spin" size={40} />
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Fetching Details...</p>
                </div>
              )}
              {!selectedRoleDetail ? (
                <>
                  {/* Roles Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Layers className="text-gray-400" size={18} />
                      <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest">System Defined Roles</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roles.map(role => (
                        <button
                          key={role.id}
                          onClick={() => fetchRoleDetail(role.name)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition"
                        >
                          {role.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Admins Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Users className="text-gray-400" size={18} />
                      <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Active Administrators</h4>
                    </div>
                    <div className="space-y-3">
                      {admins.length > 0 ? admins.map(admin => (
                        <div key={admin.id} className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-primary-900">{admin.username}</p>
                            <p className="text-xs text-primary-600">{admin.email}</p>
                          </div>
                          <span className="px-2 py-1 bg-primary-600 text-white text-[10px] font-black rounded-lg">PRIMARY ADMIN</span>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500 italic">No admin accounts found. Try seeding the roles.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <button
                    onClick={() => setSelectedRoleDetail(null)}
                    className="flex items-center space-x-2 text-primary-600 mb-6 hover:underline font-bold text-sm"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Overview</span>
                  </button>

                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-primary-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">
                        {selectedRoleDetail.roleName}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-3">Role Description</h4>
                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
                      {selectedRoleDetail.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Users className="text-gray-400" size={18} />
                      <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest">
                        Assigned Users ({selectedRoleDetail.users.length})
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRoleDetail.users.length > 0 ? selectedRoleDetail.users.map(user => (
                        <div key={user.id} className="p-4 border rounded-2xl hover:bg-gray-50 transition border-gray-100">
                          <p className="font-bold text-gray-900">{user.fullName || user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      )) : (
                        <div className="col-span-2 py-8 text-center bg-gray-50 rounded-2xl border border-dashed text-gray-400 italic">
                          No users currently assigned to this role.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => setIsRolesModalOpen(false)}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, trend, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <span className="text-xs font-bold text-success-600">{trend}</span>
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-gray-900">{value}</h3>
  </div>
);

const LogItem = ({ log, onClick }) => {
  const timeDiff = (timestamp) => {
    const diff = new Date().getTime() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor(diff / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  const getColor = (action) => {
    if (action.includes('FAILED') || action.includes('ERROR')) return 'text-danger-600';
    if (action.includes('WARN') || action.includes('ALERT')) return 'text-warning-600';
    return 'text-primary-600';
  };

  return (
    <div
      onClick={onClick}
      className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:scale-[1.02] cursor-pointer transition group"
    >
      <div>
        <h4 className={`text-sm font-bold ${getColor(log.action)}`}>{log.action}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{log.details}</p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-gray-400 font-bold uppercase">{timeDiff(log.timestamp)}</span>
        <span className="text-[8px] text-primary-400 font-bold mt-1 opacity-0 group-hover:opacity-100 transition">CLICK TO VIEW</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
