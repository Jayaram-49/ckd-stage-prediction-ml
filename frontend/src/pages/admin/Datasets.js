import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Datasets = () => {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [file, setFile] = useState(null);
  const [addedRows, setAddedRows] = useState(null);
  const [retrainTriggered, setRetrainTriggered] = useState(null);
  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchLabResults = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/admin/lab-results', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/admin/datasets/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatistics(res.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabResults();
    fetchStatistics();
  }, [fetchLabResults, fetchStatistics]);

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dataset record?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/lab-results/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabResults(labResults.filter(r => r.id !== id));
      fetchStatistics(); // Update stats after delete
      alert('Record deleted successfully.');
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a CSV file.');
      return;
    }
    setUploading(true);
    setStatus('Uploading and validating dataset...');
    setAddedRows(null);
    setRetrainTriggered(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('http://localhost:8080/api/admin/datasets/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setStatus(res.data.message || 'Dataset uploaded.');
      setAddedRows(res.data.addedRows ?? null);
      setRetrainTriggered(res.data.retrainTriggered ?? null);
      fetchLabResults(); // Refresh list after upload
      fetchStatistics(); // Refresh statistics after upload
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Upload failed. Check CSV format and try again.';
      setStatus(`Upload failed: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dataset Management</h1>
        <p className="text-gray-500">Upload new datasets, validate, and track dataset versions.</p>
      </div>

      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Dataset Manager</h3>
            <p className="text-sm text-gray-500">CKD Master Dataset (v3.1)</p>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload New Dataset'}
          </button>
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
        {status && <div className="text-sm text-success-600">{status}</div>}
        {addedRows !== null && (
          <div className="text-sm text-gray-600">New rows added: {addedRows}</div>
        )}
        {retrainTriggered !== null && (
          <div className={`text-sm ${retrainTriggered ? 'text-success-600' : 'text-warning-600'}`}>
            Auto-retrain: {retrainTriggered ? 'Triggered in background' : 'Failed to trigger'}
          </div>
        )}
      </div>

      {/* Dataset Insights Section */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Comprehensive Dataset Insights (All Features)</h3>
          {!statsLoading && statistics?.totalRecords && (
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              ANALYZING {statistics.totalRecords} RECORDS
            </span>
          )}
        </div>

        {statsLoading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-medium">Generating comprehensive feature distributions...</p>
          </div>
        ) : statistics ? (
          <div className="space-y-12">
            {/* Numerical Features First - Often more critical */}
            <div>
              <div className="flex items-center space-x-2 mb-6 border-b pb-2">
                <div className="w-2 h-6 bg-secondary-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-gray-800">Clinical Distributions (Numerical Indicators)</h4>
                <span className="text-[10px] font-black text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded ml-2">11 FEATURES</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statistics.numericalFeatures && Object.entries(statistics.numericalFeatures).map(([featureName, data]) => (
                  <FeatureChart key={featureName} feature={featureName} data={data} type="area" />
                ))}
              </div>
            </div>

            {/* Categorical Features */}
            <div>
              <div className="flex items-center space-x-2 mb-6 border-b pb-2">
                <div className="w-2 h-6 bg-primary-600 rounded-full"></div>
                <h4 className="text-lg font-bold text-gray-800">Diagnostic Indicators (Categorical)</h4>
                <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded ml-2">13 FEATURES</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statistics.categoricalFeatures && Object.entries(statistics.categoricalFeatures).map(([featureName, data]) => (
                  <FeatureChart key={featureName} feature={featureName} data={data} type="bar" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-400 text-sm">No statistical data available for this dataset.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold">Dataset Records (All Lab Results)</h3>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{labResults.length} Total Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Stage</th>
                <th className="px-6 py-3 text-left">Risk</th>
                <th className="px-6 py-3 text-left">Creatinine</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading dataset...</td>
                </tr>
              ) : labResults.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">No records found.</td>
                </tr>
              ) : (
                labResults.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-900">{r.id}</td>
                    <td className="px-6 py-3 font-bold text-primary-700">
                      {r.patient?.user?.fullName || r.patient?.user?.username || 'System Seed'}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{new Date(r.testDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.stage >= 4 ? 'bg-danger-100 text-danger-600' : 'bg-primary-100 text-primary-600'
                        }`}>
                        Stage {r.stage}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-700">{r.riskScore}%</td>
                    <td className="px-6 py-3 font-medium">{r.serumCreatinine}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        className="text-danger-600 font-bold hover:text-danger-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FeatureChart = ({ feature, data, type = 'bar' }) => {
  // Format data for Recharts
  const chartData = Object.entries(data).map(([name, count]) => ({
    name: name,
    count
  }));

  // Sort numerical bins if it's an area chart (roughly)
  if (type === 'area') {
    chartData.sort((a, b) => {
      const aVal = parseInt(a.name.split('-')[0]) || 0;
      const bVal = parseInt(b.name.split('-')[0]) || 0;
      return aVal - bVal;
    });
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Humanize feature names
  const featureLabel = feature
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());

  return (
    <div className={`bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${type === 'area' ? 'border-l-4 border-l-secondary-400' : 'border-l-4 border-l-primary-500'}`}>
      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-between">
        {featureLabel}
        <span className={`text-[8px] px-1.5 py-0.5 rounded ${type === 'area' ? 'bg-secondary-100 text-secondary-700' : 'bg-primary-100 text-primary-700'}`}>
          {type.toUpperCase()}
        </span>
      </h4>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${feature}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8B5CF6"
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#gradient-${feature})`}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Datasets;
