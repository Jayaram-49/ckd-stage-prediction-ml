import React, { useState } from 'react';
import axios from 'axios';

const AutoTraining = () => {
  const [autoTraining, setAutoTraining] = useState(true);
  const [loading, setLoading] = useState(false);

  const triggerRetrain = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/admin/retrain', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Retraining started in background.');
    } catch (err) {
      alert('Retraining failed. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auto-Training Control</h1>
        <p className="text-gray-500">Enable or disable continuous learning.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">Auto-Training</h3>
            <p className="text-sm text-gray-500">Weekly retraining using new records</p>
          </div>
          <button
            onClick={() => setAutoTraining(!autoTraining)}
            className={`w-12 h-6 rounded-full transition relative ${autoTraining ? 'bg-success-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoTraining ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <button
          onClick={triggerRetrain}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? 'Retraining...' : 'Trigger Manual Retrain'}
        </button>
      </div>
    </div>
  );
};

export default AutoTraining;
