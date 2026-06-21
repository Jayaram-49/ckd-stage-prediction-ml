import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Activity, AlertCircle, ShieldCheck } from 'lucide-react';

const Overview = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/patient/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div>Loading...</div>;

  const latest = history[0] || {};
  const chartData = history.slice().reverse().map(item => ({
    date: new Date(item.testDate).toLocaleDateString(),
    gfr: (175 * Math.pow(item.serumCreatinine, -1.154) * Math.pow(65, -0.203)).toFixed(1), // Mocking age for calc
    risk: item.riskScore
  }));

  const getRiskColor = (score) => {
    if (score < 30) return 'text-success-600 bg-success-50';
    if (score < 60) return 'text-warning-600 bg-warning-50';
    return 'text-danger-600 bg-danger-50';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Overview</h1>
          <p className="text-gray-500">Welcome back! Here's your latest kidney health summary.</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700">
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600"><Activity /></div>
            <span className="text-xs font-bold text-gray-400">CURRENT STATUS</span>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">Stage {latest.stage || 'N/A'}</h3>
          <p className="text-sm text-gray-500 mt-1">{latest.ckdDetected === 'yes' ? 'CKD Detected' : 'No CKD Detected'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-warning-50 rounded-lg text-warning-600"><AlertCircle /></div>
            <span className="text-xs font-bold text-gray-400">RISK SCORE</span>
          </div>
          <div className="flex items-end space-x-2">
            <h3 className="text-3xl font-extrabold text-gray-900">{latest.riskScore || '0'}%</h3>
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getRiskColor(latest.riskScore || 0)}`}>
              {latest.riskScore > 60 ? 'High' : latest.riskScore > 30 ? 'Moderate' : 'Low'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Progression probability</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success-50 rounded-lg text-success-600"><ShieldCheck /></div>
            <span className="text-xs font-bold text-gray-400">CONFIDENCE</span>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">{latest.confidence || '0'}%</h3>
          <p className="text-sm text-gray-500 mt-1">AI Prediction Reliability</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">GFR Trend (Kidney Function)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGfr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="gfr" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorGfr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Risk Progression</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={3} dot={{ r: 6, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
