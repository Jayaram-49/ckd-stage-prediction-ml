import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Logs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/admin/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-500">Audit trails and system actions.</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Action</th>
              <th className="px-6 py-3 text-left">Performed By</th>
              <th className="px-6 py-3 text-left">Details</th>
              <th className="px-6 py-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="px-6 py-3">{log.action}</td>
                <td className="px-6 py-3">{log.performedBy}</td>
                <td className="px-6 py-3">{log.details}</td>
                <td className="px-6 py-3">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-gray-500" colSpan={4}>No logs available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;
