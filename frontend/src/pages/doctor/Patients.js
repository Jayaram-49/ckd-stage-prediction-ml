import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [latestByPatient, setLatestByPatient] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
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
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p =>
    p.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient List</h1>
        <p className="text-gray-500">View all patients and latest AI assessment.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search patients by name or username..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Age</th>
              <th className="px-6 py-3 text-left">Stage</th>
              <th className="px-6 py-3 text-left">Risk</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => {
              const latest = latestByPatient[p.id];
              return (
                <tr
                  key={p.id}
                  className="border-b hover:bg-primary-50/30 cursor-pointer transition group"
                  onClick={() => {
                    if (latest) navigate(`/doctor/analysis/report/${latest.id}`);
                  }}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{p.user.fullName}</td>
                  <td className="px-6 py-3">{p.age}</td>
                  <td className="px-6 py-3">Stage {latest?.stage ?? '-'}</td>
                  <td className="px-6 py-3">{latest?.riskScore ?? '-'}%</td>
                  <td className="px-6 py-3">
                    {latest ? (
                      <Link
                        to={`/doctor/analysis/report/${latest.id}`}
                        className="text-primary-600 font-bold hover:underline"
                      >
                        View Report
                      </Link>
                    ) : (
                      <Link
                        to={`/doctor/analysis-dashboard?patientId=${p.id}`}
                        className="text-gray-400 font-bold pointer-events-none"
                      >
                        No Report
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {patients.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-gray-500" colSpan={5}>No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Patients;
