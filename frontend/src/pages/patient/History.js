import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FileText, Eye, Trash2 } from 'lucide-react';

const History = () => {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/patient/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(history.filter(record => record.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete record.');
    }
  };

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
        <p className="text-gray-500">View your previous lab tests and AI-driven staging results.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Staging</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Risk Score</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Creatinine</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {new Date(record.testDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.stage >= 4 ? 'bg-danger-100 text-danger-600' : 'bg-primary-100 text-primary-600'
                    }`}>
                    Stage {record.stage}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary-500 h-full" style={{ width: `${record.riskScore}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{record.riskScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                  {record.serumCreatinine} mg/dL
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/patient/result/${record.id}`}
                      className="flex items-center space-x-1 text-primary-600 font-bold hover:text-primary-800 transition text-sm"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="flex items-center space-x-1 text-danger-600 font-bold hover:text-danger-800 transition text-sm"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <FileText className="mx-auto mb-4 opacity-20" size={48} />
            <p>No medical records found. Submit your first lab test to see results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
