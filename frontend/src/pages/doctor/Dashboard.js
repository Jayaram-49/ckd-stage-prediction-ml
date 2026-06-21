import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [latestByPatient, setLatestByPatient] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientsAndLatest = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get('http://localhost:8080/api/doctor/patients', { headers });
        setPatients(res.data);

        const latestMap = {};
        await Promise.all(
          res.data.map(async (p) => {
            const historyRes = await axios.get(`http://localhost:8080/api/doctor/patient/${p.id}/history`, { headers });
            if (historyRes.data && historyRes.data.length > 0) {
              latestMap[p.id] = historyRes.data[0];
            }
          })
        );
        setLatestByPatient(latestMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientsAndLatest();
  }, []);

  const stats = useMemo(() => {
    const total = patients.length;
    const highRisk = Object.values(latestByPatient).filter((l) => (l.riskScore || 0) >= 60).length;
    const newCases = Object.values(latestByPatient).filter((l) => (l.stage || 0) >= 3).length;
    return { total, highRisk, newCases };
  }, [patients, latestByPatient]);

  const stageDistribution = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    Object.values(latestByPatient).forEach((l) => {
      const stage = l.stage || 0;
      if (counts[stage] !== undefined) counts[stage] += 1;
    });
    return Object.keys(counts).map((s) => ({ stage: `Stage ${s}`, count: counts[s] }));
  }, [latestByPatient]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500">Clinical overview and AI-assisted risk monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Patients" value={stats.total} />
        <Card title="High Risk" value={stats.highRisk} accent="text-danger-600" />
        <Card title="New Cases" value={stats.newCases} accent="text-warning-600" />
      </div>

      <div className="bg-white p-6 rounded-2xl border">
        <h3 className="text-lg font-bold text-gray-900 mb-4">CKD Stage Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageDistribution}>
              <XAxis dataKey="stage" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, accent }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className={`text-3xl font-black ${accent || 'text-gray-900'}`}>{value}</h3>
  </div>
);

export default DoctorDashboard;
