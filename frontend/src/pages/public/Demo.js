import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowTrendingUpIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import CKDService from '../../services/CKDService';

const Demo = () => {
  const patient = CKDService.getSamplePatient();
  const ckdStage = CKDService.calculateCKDStage(patient.labResults.gfr);
  const riskScore = CKDService.calculateRiskScore(patient.labResults, patient.vitals, patient.riskFactors);
  const progressionData = CKDService.getProgressionForecast(patient.labResults.gfr, 3);
  const labTrends = CKDService.getLabTrends();

  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(riskScore);
    }, 100);
    return () => clearTimeout(timer);
  }, [riskScore]);

  const riskLevelColor = riskScore < 30 ? 'success' : riskScore < 60 ? 'warning' : 'danger';
  const riskLevelText = riskScore < 30 ? 'Low Risk' : riskScore < 60 ? 'Moderate Risk' : 'High Risk';

  // Explicit color mapping for Tailwind JIT
  const scoreColors = {
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    danger: 'bg-danger-600'
  };

  const cardBackgrounds = {
    success: 'bg-success-50 border-success-200',
    warning: 'bg-warning-50 border-warning-200',
    danger: 'bg-danger-50 border-danger-200'
  };

  const textColors = {
    success: 'text-success-900',
    warning: 'text-warning-900',
    danger: 'text-danger-900'
  };

  const statusColors = {
    success: 'text-success-700',
    warning: 'text-warning-700',
    danger: 'text-danger-700'
  };

  const pieData = [
    { name: 'Lab Abnormalities', value: 45 },
    { name: 'Blood Pressure', value: 25 },
    { name: 'Risk Factors', value: 20 },
    { name: 'Other', value: 10 }
  ];
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary-900">CKD Risk Analysis Demo</h1>
              <p className="text-gray-600 mt-2">Interactive visualization of patient risk assessment and CKD staging</p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-6">Patient Profile</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Patient Name</p>
              <p className="text-xl font-bold text-primary-900">{patient.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Age</p>
              <p className="text-xl font-bold text-primary-900">{patient.age} years</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Gender</p>
              <p className="text-xl font-bold text-primary-900">{patient.gender}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-xl font-bold text-primary-900">Active Monitoring</p>
            </div>
          </div>
        </div>

        {/* Risk Score Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Risk Score Card */}
          <div className={`${cardBackgrounds[riskLevelColor]} border-2 rounded-2xl p-8`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${textColors[riskLevelColor]}`}>Overall Risk Score</h3>
              {riskScore >= 60 && <ExclamationTriangleIcon className="w-6 h-6 text-danger-600" />}
            </div>
            <div className="mb-4">
              <div className="text-5xl font-bold text-primary-900">{riskScore}</div>
              <p className={`text-sm ${statusColors[riskLevelColor]} font-semibold mt-2`}>{riskLevelText}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`${scoreColors[riskLevelColor]} h-2 rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${animatedWidth}%` }}
              ></div>
            </div>
          </div>

          {/* CKD Stage Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-primary-900 mb-4">Current CKD Stage</h3>
            <div className="text-4xl font-bold text-primary-600 mb-3">{ckdStage.stage}</div>
            <p className="text-gray-600 text-sm mb-4">{ckdStage.label}</p>
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full bg-${ckdStage.color}-500`}></span>
              <span className="text-sm font-semibold text-gray-700">{ckdStage.risk} Risk</span>
            </div>
          </div>

          {/* Key Lab Values */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-primary-900 mb-4">Key Lab Values</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">eGFR</span>
                <span className="font-bold text-primary-900">{patient.labResults.gfr} mL/min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Creatinine</span>
                <span className="font-bold text-primary-900">{patient.labResults.creatinine} mg/dL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Blood Urea</span>
                <span className="font-bold text-primary-900">{patient.labResults.bloodUrea} mg/dL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Lab Trends Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-primary-900 mb-6">6-Month Lab Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={labTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="gfr" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="eGFR" />
                <Line type="monotone" dataKey="creatinine" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Creatinine" />
                <Line type="monotone" dataKey="bloodUrea" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Blood Urea" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Contribution Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-primary-900 mb-6">Risk Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {colors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GFR Progression Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <ArrowTrendingUpIcon className="w-6 h-6 text-danger-600" />
            <h3 className="text-xl font-bold text-primary-900">Projected GFR Progression (12-Month Forecast)</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis label={{ value: 'eGFR (mL/min/1.73m²)', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="gfr" fill="#3b82f6" name="Projected eGFR" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            Based on current lab trends, the patient's GFR is projected to decline gradually. Regular monitoring and intervention are recommended to slow progression.
          </p>
        </div>

        {/* Risk Factors Summary */}
        <div className="bg-gradient-to-r from-danger-50 to-warning-50 rounded-2xl p-8 border border-danger-200">
          <h3 className="text-xl font-bold text-primary-900 mb-6">Active Risk Factors</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(patient.riskFactors).map(([key, value]) => (
              value && (
                <div key={key} className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-danger-600"></div>
                  <span className="text-gray-700 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-info-50 border-l-4 border-info-600 rounded-lg p-6">
          <h4 className="text-lg font-bold text-info-900 mb-3">Clinical Recommendations</h4>
          <ul className="space-y-2 text-info-800">
            <li>✓ Regular nephrology consultation every 3 months</li>
            <li>✓ Strict blood pressure control (&lt;130/80 mmHg)</li>
            <li>✓ Optimize antidiabetic and antihypertensive therapy</li>
            <li>✓ Dietary modifications (reduce sodium and protein)</li>
            <li>✓ Monitor renal function quarterly with lab work</li>
            <li>✓ Lifestyle modifications and smoking cessation if applicable</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Demo;
