import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const PatientDetails = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/admin/patient/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.profile);
      setLabs(res.data.labResults || []);
    };
    fetchDetails();
  }, [id]);

  if (!profile) return <div>Loading patient details...</div>;

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="text-primary-600 font-bold">← Back to Users</Link>

      <div className="bg-white p-6 rounded-2xl border">
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="p-4 border rounded-xl">
            <p className="text-gray-400">Full Name</p>
            <p className="font-bold">{profile.fullName}</p>
          </div>
          <div className="p-4 border rounded-xl">
            <p className="text-gray-400">Username</p>
            <p className="font-bold">{profile.username}</p>
          </div>
          <div className="p-4 border rounded-xl">
            <p className="text-gray-400">Email</p>
            <p className="font-bold">{profile.email}</p>
          </div>
          <div className="p-4 border rounded-xl">
            <p className="text-gray-400">Age</p>
            <p className="font-bold">{profile.age}</p>
          </div>
          <div className="p-4 border rounded-xl">
            <p className="text-gray-400">Gender</p>
            <p className="font-bold">{profile.gender}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-bold">Lab Results History</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Stage</th>
              <th className="px-6 py-3 text-left">Risk %</th>
              <th className="px-6 py-3 text-left">Creatinine</th>
              <th className="px-6 py-3 text-left">Hemoglobin</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="px-6 py-3">{l.testDate ? new Date(l.testDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-3">Stage {l.stage}</td>
                <td className="px-6 py-3">{l.riskScore}%</td>
                <td className="px-6 py-3">{l.serumCreatinine}</td>
                <td className="px-6 py-3">{l.hemoglobin}</td>
              </tr>
            ))}
            {labs.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-gray-500" colSpan={5}>No lab results found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientDetails;
