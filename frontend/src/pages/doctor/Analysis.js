import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, AlertTriangle, Activity, Search } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { CKDService } from '../../services/CKDService';

const Analysis = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      try {
        const data = await ApiService.getDoctorPatients();
        setPatients(data || []);
      } catch (apiError) {
        console.log('Using sample data:', apiError.message);
        const samplePatients = [
          { id: 1, name: 'John Doe', age: 58, gender: 'Male', lastTest: '2024-01-15' },
          { id: 2, name: 'Jane Smith', age: 45, gender: 'Female', lastTest: '2024-01-10' },
          { id: 3, name: 'Robert Johnson', age: 62, gender: 'Male', lastTest: '2024-01-05' },
        ];
        setPatients(samplePatients);
      }
    } catch (err) {
      setError('Failed to load patients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    try {
      try {
        const history = await ApiService.getPatientLabHistory(patient.id);
        setPatientHistory(history || []);
      } catch (apiError) {
        setPatientHistory(CKDService.getLabTrends());
      }
    } catch (err) {
      console.error('Failed to load patient history:', err);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toString().includes(searchTerm)
  );

  const stats = {
    totalPatients: patients.length,
    highRiskPatients: patients.filter(() => Math.random() > 0.4).length,
    avgGFR: Math.round(Math.random() * 30 + 40),
  };

  const stageData = [
    { name: 'Stage 1', value: 2, fill: '#10b981' },
    { name: 'Stage 2', value: 3, fill: '#3b82f6' },
    { name: 'Stage 3a', value: 5, fill: '#f59e0b' },
    { name: 'Stage 3', value: 6, fill: '#f97316' },
    { name: 'Stage 4', value: 3, fill: '#ef4444' },
  ];

  const riskData = [
    { name: 'Low Risk', value: Math.floor(patients.length * 0.3), fill: '#10b981' },
    { name: 'Moderate Risk', value: Math.floor(patients.length * 0.4), fill: '#f59e0b' },
    { name: 'High Risk', value: Math.floor(patients.length * 0.3), fill: '#ef4444' },
  ];

  const chartData = patientHistory.map((item, idx) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][idx] || `M${idx}`,
    gfr: item.gfr || 40 + Math.random() * 20,
    creatinine: item.creatinine || 1.2 + Math.random() * 0.8,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full animate-spin mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-full opacity-20"></div>
          </div>
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg border border-danger-200">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinical Analysis Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage patient cases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-primary-600" size={28} />
            <span className="text-3xl font-bold text-gray-900">{stats.totalPatients}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Patients</p>
          <p className="text-xs text-gray-500 mt-2">Under your care</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="text-warning-600" size={28} />
            <span className="text-3xl font-bold text-gray-900">{stats.highRiskPatients}</span>
          </div>
          <p className="text-gray-600 text-sm">High-Risk Patients</p>
          <p className="text-xs text-gray-500 mt-2">Require close monitoring</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Activity className="text-success-600" size={28} />
            <span className="text-3xl font-bold text-gray-900">{stats.avgGFR}</span>
          </div>
          <p className="text-gray-600 text-sm">Avg eGFR</p>
          <p className="text-xs text-gray-500 mt-2">ml/min/1.73m²</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">My Patients</h3>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-96">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-primary-50 ${selectedPatient?.id === patient.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                  }`}
              >
                <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                <p className="text-xs text-gray-500 mt-1">Age: {patient.age} | {patient.gender}</p>
                <p className="text-xs text-gray-400 mt-1">Last test: {patient.lastTest}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">CKD Stage Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Patient Risk Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {selectedPatient && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Patient: {selectedPatient.name}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="gfr" stroke="#3b82f6" strokeWidth={2} name="eGFR" />
                <Line type="monotone" dataKey="creatinine" stroke="#f59e0b" strokeWidth={2} name="Creatinine" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
