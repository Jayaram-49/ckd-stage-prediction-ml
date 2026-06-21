import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Models = () => {
  const data = [
    { name: 'v1.0', acc: 0.93 },
    { name: 'v1.1', acc: 0.95 },
    { name: 'v1.2', acc: 0.965 },
    { name: 'v1.3', acc: 0.97 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Model Performance</h1>
        <p className="text-gray-500">Track accuracy, precision, recall, and F1-score trends.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Metric label="Accuracy" value="96.5%" />
        <Metric label="Precision" value="95.8%" />
        <Metric label="Recall" value="96.2%" />
        <Metric label="F1 Score" value="96.0%" />
      </div>

      <div className="bg-white p-6 rounded-2xl border">
        <h3 className="font-bold text-gray-900 mb-4">Performance Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis domain={[0.9, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="acc" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div className="bg-white p-4 rounded-xl border">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

export default Models;
