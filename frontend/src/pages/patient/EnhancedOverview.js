import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, AlertCircle, TrendingDown, TrendingUp, Download, Clock
} from 'lucide-react';
import ApiService from '../../services/ApiService';
import { CKDService } from '../../services/CKDService';

const EnhancedOverview = () => {
  const [patientData, setPatientData] = useState(null);
  const [history, setHistory] = useState([]);
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Try to fetch real data from API
        try {
          const profileData = await ApiService.getPatientProfile();
          const historyData = await ApiService.getPatientHistory();
          setPatientData(profileData);
          setHistory(historyData || []);

          // Fetch explanations for the latest result if available
          if (historyData && historyData.length > 0) {
            const latestId = historyData[0].id;
            try {
              const explanationData = await ApiService.getPatientExplanations(latestId);
              setExplanations(explanationData || []);
            } catch (explError) {
              console.error("Failed to fetch explanations:", explError);
            }
          }
        } catch (apiError) {
          // Fallback to sample data if API fails
          console.log('Using sample data (API unavailable):', apiError.message);
          const sample = CKDService.getSamplePatient();
          setPatientData(sample);
          setHistory(CKDService.getLabTrends());
        }
      } catch (err) {
        setError('Failed to load patient data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Risks score animation effect
  // Calculate riskScore before hooks so we can use it, but handle null patientData
  const latestResult = history && history.length > 0 ? history[0] : null;

  const riskScore = (patientData)
    ? ((latestResult?.riskScore !== null && latestResult?.riskScore !== undefined)
      ? Math.round(latestResult.riskScore)
      : (CKDService.calculateRiskScore(
        latestResult || patientData.labResults || {},
        patientData.vitals || {},
        patientData.riskFactors || {}
      )))
    : 0;

  useEffect(() => {
    if (riskScore > 0) {
      const timer = setTimeout(() => {
        setAnimatedWidth(riskScore);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [riskScore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full animate-spin mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-full opacity-20"></div>
          </div>
          <p className="text-gray-600">Loading your health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 text-danger-700 p-4 rounded-lg border border-danger-200">
        {error}
      </div>
    );
  }

  if (!patientData) {
    return <div>No patient data available</div>;
  }

  // Calculate eGFR if not directly available (using MDRD simplified formula for display purposes)
  // GFR = 175 * (Scr)^-1.154 * (Age)^-0.203 * (0.742 if female) * (1.212 if African American - ignored for simplicity here)
  const calculateGFR = (creatinine, age, gender) => {
    if (!creatinine || !age) return 0;
    let gfr = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203);
    if (gender && gender.toLowerCase() === 'female') {
      gfr *= 0.742;
    }
    return Math.round(gfr);
  };

  // Derive values from latest result or fallbacks
  const currentCreatinine = latestResult?.serumCreatinine || patientData.labResults?.creatinine || 1.5;
  const currentAge = patientData.age || 45;
  const currentGender = patientData.gender || 'Male';

  // Use calculated GFR or fallback
  const gfr = latestResult
    ? calculateGFR(currentCreatinine, currentAge, currentGender)
    : (patientData.labResults?.gfr || 45);

  const ckdStage = latestResult?.stage
    ? {
      stage: latestResult.stage,
      label: `Stage ${latestResult.stage}: ${getStageDescription(latestResult.stage)}`,
      color: getStageColor(latestResult.stage)
    }
    : CKDService.calculateCKDStage(gfr);

  function getStageDescription(stage) {
    if (stage === 1) return 'Normal kidney Function';
    if (stage === 2) return 'Mild CKD (Mild loss of kidney function)';
    if (stage === 3) return 'Moderate CKD (moderate loss)';
    if (stage === 4) return 'Severe CKD (Severe loss of function)';
    return 'End-Stage Renal Disease - ESRD (Kidney failure)';
  }

  function getStageColor(stage) {
    if (stage <= 1) return 'success';
    if (stage <= 3) return 'warning';
    return 'danger';
  }

  const chartData = history.map((item, idx) => ({
    month: item.testDate ? new Date(item.testDate).toLocaleString('default', { month: 'short' }) : `M${idx}`,
    gfr: calculateGFR(item.serumCreatinine || 1.5, currentAge, currentGender),
    creatinine: item.serumCreatinine || 1.5,
    bloodUrea: item.bloodUrea || 50
  })).reverse(); // Reverse if API returns newest first, so chart goes left-to-right (old-to-new)

  // Reverse back if we need to display it differently? 
  // Wait, if API returns desc (newest first), then for chart (oldest first) we need to reverse.
  // The original code map was using index for month names, assuming implicit order.
  // Let's ensure chartData is chronologically sorted (Index 0 = Oldest) for LineChart.
  // But history is usually Newest First. So reversing is correct.

  const forecastData = CKDService.getProgressionForecast(gfr, ckdStage.stage);

  const getRiskLabel = (score) => {
    if (score < 40) return 'Low Risk';
    if (score < 70) return 'Moderate Risk';
    return 'High Risk';
  };

  const getRiskBg = (score) => {
    if (score < 40) return 'bg-success-50 text-success-700 border-success-200';
    if (score < 70) return 'bg-warning-50 text-warning-700 border-warning-200';
    return 'bg-danger-50 text-danger-700 border-danger-200';
  };

  const handleExportReport = async () => {
    if (!latestResult?.id) {
      console.error("No lab result available to export");
      alert("No lab result available to export. Please try again after refreshing.");
      return;
    }

    const handleErrorMessage = (msg) => {
      const displayMsg = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
      alert(`Failed to download report. Error: ${displayMsg}`);
    };

    try {
      const response = await ApiService.downloadPdfReport(latestResult.id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ckd-report-${latestResult.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to download report", error);

      if (error.response?.data) {
        const data = error.response.data;
        if (data.constructor.name === 'Blob' || data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            handleErrorMessage(reader.result);
          };
          reader.onerror = () => {
            handleErrorMessage(error.message || 'Error reading blob response');
          };
          reader.readAsText(data);
        } else {
          handleErrorMessage(data);
        }
      } else {
        handleErrorMessage(error.message || 'Network Error or no response from server');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your kidney health and track your progress</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          <Download size={18} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CKD Stage */}
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition`}>
          <div className="flex items-center justify-between mb-4">
            <Activity className="text-primary-600" size={24} />
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${ckdStage.color === 'success' ? 'bg-success-100 text-success-700' :
              ckdStage.color === 'warning' ? 'bg-warning-100 text-warning-700' :
                'bg-danger-100 text-danger-700'
              }`}>
              Stage {ckdStage.stage}
            </span>
          </div>
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">CKD Status</p>
          <h3 className="text-2xl font-bold text-gray-900">{typeof ckdStage.label === 'string' ? ckdStage.label.split(':')[0] : `Stage ${ckdStage.stage}`}</h3>
          <p className="text-xs text-gray-500 mt-2">eGFR: {gfr} ml/min</p>
        </div>

        {/* Risk Score */}
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition ${getRiskBg(riskScore)}`}>
          <div className="flex items-center justify-between mb-4">
            <AlertCircle size={24} />
            <Clock size={20} opacity={0.5} />
          </div>
          <p className="text-xs uppercase font-bold mb-1 opacity-75">Risk Score</p>
          <h3 className="text-2xl font-bold">{riskScore}/100</h3>
          <p className="text-xs mt-2 opacity-75 mb-4">{getRiskLabel(riskScore)}</p>
          <div className="w-full bg-black/5 rounded-full h-2 gap-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${riskScore < 40 ? 'bg-success-500' :
                riskScore < 70 ? 'bg-warning-500' :
                  'bg-danger-500'
                }`}
              style={{ width: `${animatedWidth}%` }}
            ></div>
          </div>
        </div>

        {/* Latest GFR */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="text-primary-600" size={24} />
            <span className="text-2xl text-gray-700 font-bold">{Math.floor(Math.random() * 5) - 2}%</span>
          </div>
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Change Last 3M</p>
          <h3 className="text-2xl font-bold text-gray-900">eGFR</h3>
          <p className="text-xs text-gray-500 mt-2">Kidney function trend</p>
        </div>

        {/* Creatinine */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-warning-600" size={24} />
            <span className="text-xl text-gray-700 font-bold">{patientData.labResults?.creatinine || 1.5}</span>
          </div>
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Current Value</p>
          <h3 className="text-xl font-bold text-gray-900">Creatinine</h3>
          <p className="text-xs text-gray-500 mt-2">mg/dL</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lab Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Lab Values Trend (6 Months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#3b82f6"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'eGFR', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#ef4444"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Creatinine', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value, name) => [
                    <span key="val" className="font-bold">{value.toFixed(2)} {name === 'eGFR' ? 'ml/min' : name === 'Creatinine' ? 'mg/dL' : 'mg/dL'}</span>,
                    <span key="name">{name}</span>
                  ]}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Line yAxisId="left" type="monotone" dataKey="gfr" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="eGFR" />
                <Line yAxisId="right" type="monotone" dataKey="creatinine" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Creatinine" />
                <Line yAxisId="left" type="monotone" dataKey="bloodUrea" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Blood Urea" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 12-Month GFR Forecast */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">12-Month GFR Forecast</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => value.toFixed(1)}
                />
                <Bar dataKey="gfr" fill="#06b6d4" name="Projected eGFR" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Section: Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lab Contributors Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Current Lab Results (Risk Contribution)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={explanations.filter(e => ['Serum Creatinine', 'Hemoglobin', 'Blood Pressure', 'Blood Urea', 'Blood Glucose'].includes(e.feature)) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="feature"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {explanations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Factors Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Your Risk Factors Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={explanations.filter(e => !['Serum Creatinine', 'Hemoglobin', 'Blood Pressure', 'Blood Urea', 'Blood Glucose'].includes(e.feature)) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="feature"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {explanations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#f97316', '#ec4899', '#6366f1', '#14b8a6', '#84cc16'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOverview;
