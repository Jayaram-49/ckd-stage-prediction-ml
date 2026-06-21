import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/users', { headers }),
        axios.get('http://localhost:8080/api/admin/patients', { headers })
      ]);
      setUsers(usersRes.data);
      setPatients(patientsRes.data);
    };
    fetchData();
  }, []);

  const handleResetPassword = async (userId) => {
    const newPassword = window.prompt('Enter new password (min 6 chars):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/admin/users/${userId}/reset-password`, {
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password reset successfully.');
    } catch (err) {
      alert('Password reset failed.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== userId));
      setPatients(patients.filter(p => p.patientId !== userId)); // Assuming p.patientId maps to user id if profile exists
      alert('User deleted successfully.');
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users & Patients</h1>
        <p className="text-gray-500">All login accounts and patient profiles.</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-bold">Login Accounts</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Full Name</th>
              <th className="px-6 py-3 text-left">Roles</th>
              <th className="px-6 py-3 text-left">Password</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="px-6 py-3">{u.username}</td>
                <td className="px-6 py-3">{u.email}</td>
                <td className="px-6 py-3">{u.fullName}</td>
                <td className="px-6 py-3">{u.roles.join(', ')}</td>
                <td className="px-6 py-3 text-gray-400">Encrypted (bcrypt)</td>
                <td className="px-6 py-3 flex space-x-4">
                  <button
                    onClick={() => handleResetPassword(u.id)}
                    className="text-primary-600 font-bold"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="text-danger-600 font-bold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-bold">Patient Profiles</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Patient</th>
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Age</th>
              <th className="px-6 py-3 text-left">Gender</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.patientId} className="border-b">
                <td className="px-6 py-3">{p.fullName}</td>
                <td className="px-6 py-3">{p.username}</td>
                <td className="px-6 py-3">{p.email}</td>
                <td className="px-6 py-3">{p.age}</td>
                <td className="px-6 py-3">{p.gender}</td>
                <td className="px-6 py-3">
                  <Link
                    to={`/admin/users/${p.patientId}`}
                    className="text-primary-600 font-bold"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
