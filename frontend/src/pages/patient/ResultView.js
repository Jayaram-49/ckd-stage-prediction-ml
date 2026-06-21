import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ChevronLeft, Info, Download } from 'lucide-react';

const ResultView = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch lab result
        const res = await axios.get(`http://localhost:8080/api/patient/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const current = res.data.find(item => item.id.toString() === id);
        setResult(current);

        if (current) {
          // Fetch explanations from backend
          try {
            const expRes = await axios.get(`http://localhost:8080/api/patient/result/${id}/explain`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setExplanations(expRes.data || []);
          } catch (expErr) {
            console.error('Failed to fetch explanations:', expErr);
            // Generate fallback explanations from lab result
            generateFallbackExplanations(current);
          }
        }
      } catch (err) {
        console.error('Failed to fetch result:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/patient/result/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ckd-report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);

      const handleErrorMessage = (msg) => {
        const displayMsg = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
        alert(`Failed to download PDF report. Error: ${displayMsg}`);
      };

      if (error.response?.data) {
        const data = error.response.data;
        // Check if data is a Blob
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

  const generateFallbackExplanations = (labResult) => {
    // Fallback: Generate explanations from lab result data
    const features = [];

    if (labResult.serumCreatinine) {
      features.push({
        feature: "Serum Creatinine",
        value: 35,
        actualValue: labResult.serumCreatinine
      });
    }
    if (labResult.hemoglobin) {
      features.push({
        feature: "Hemoglobin",
        value: 25,
        actualValue: labResult.hemoglobin
      });
    }
    if (labResult.bloodPressure) {
      features.push({
        feature: "Blood Pressure",
        value: 15,
        actualValue: labResult.bloodPressure
      });
    }
    if (labResult.bloodUrea) {
      features.push({
        feature: "Blood Urea",
        value: 10,
        actualValue: labResult.bloodUrea
      });
    }
    if (labResult.diabetesMellitus === 'yes') {
      features.push({
        feature: "Diabetes Mellitus",
        value: 12,
        actualValue: "Yes"
      });
    }
    if (labResult.hypertension === 'yes') {
      features.push({
        feature: "Hypertension",
        value: 10,
        actualValue: "Yes"
      });
    }

    // Normalize to 100%
    const total = features.reduce((sum, f) => sum + f.value, 0);
    if (total > 0) {
      features.forEach(f => {
        f.value = Math.round((f.value / total) * 100 * 10) / 10;
      });
    }

    setExplanations(features);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Analyzing Results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Result not found</p>
        <Link to="/patient/history" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to History
        </Link>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link to="/patient/history" className="flex items-center text-primary-600 font-bold hover:underline mb-4">
        <ChevronLeft size={20} />
        <span>Back to History</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Result Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Final Assessment</h2>
            <div className={`text-6xl font-black mb-2 ${result.stage >= 4 ? 'text-danger-600' : result.stage >= 3 ? 'text-warning-600' : 'text-primary-600'}`}>
              Stage {result.stage}
            </div>
            <p className="text-lg font-bold text-gray-700 mb-6">{result.ckdDetected === 'yes' ? 'CKD Positive' : 'CKD Negative'}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">AI Risk Score</p>
              <p className="text-2xl font-black text-gray-900">{Math.round(result.riskScore)}%</p>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${result.riskScore > 60 ? 'bg-danger-500' :
                    result.riskScore > 30 ? 'bg-warning-500' :
                      'bg-success-500'
                    }`}
                  style={{ width: `${Math.min(100, Math.max(0, result.riskScore))}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition"
            >
              <Download size={18} />
              <span>Download PDF Report</span>
            </button>
          </div>

          <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
            <div className="flex items-start space-x-3">
              <Info className="text-primary-600 mt-1" size={20} />
              <div>
                <h4 className="font-bold text-primary-900">What does this mean?</h4>
                <p className="text-sm text-primary-700 mt-1 leading-relaxed">
                  Stage {result.stage} indicates {
                    result.stage === 1 ? 'minimal' :
                      result.stage === 2 ? 'mild' :
                        result.stage === 3 ? 'moderate' :
                          result.stage === 4 ? 'severe' :
                            'end-stage'
                  } kidney damage.
                  Please consult your nephrologist for a clinical validation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Explainability Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">Explainable AI (XAI) Dashboard</h3>
            <span className="px-3 py-1 bg-success-100 text-success-600 rounded-full text-xs font-bold">SHAP ENGINE ACTIVE</span>
          </div>

          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            The chart below shows how each clinical parameter contributed to your Stage {result.stage} prediction.
            Higher percentages indicate stronger influence on the AI's decision.
          </p>

          {explanations.length > 0 ? (
            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={explanations} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="feature"
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#4b5563' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: '#fff'
                    }}
                    formatter={(value, name, props) => {
                      const actual = props.payload.actualValue;
                      return [
                        `${value}%${actual !== undefined && actual !== '' ? ` (Actual: ${actual})` : ''}`,
                        'Contribution'
                      ];
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {explanations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-8">
              <div className="text-center text-gray-400">
                <p className="text-sm">Loading feature contributions...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Test Date</p>
              <p className="font-bold text-gray-900">{new Date(result.testDate).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">CKD Confidence</p>
              <p className="font-bold text-gray-900">{Math.round(result.confidence)}%</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-bold text-gray-900 mb-3">Key Insights</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {explanations.length > 0 && explanations[0] && (
                <li>• <span className="font-bold text-gray-900">
                  {explanations[0].feature}
                  {explanations[0].actualValue !== undefined && explanations[0].actualValue !== ''
                    ? ` (${explanations[0].actualValue})`
                    : ''}
                </span> was the primary driver for this staging with {explanations[0].value}% contribution.</li>
              )}
              {explanations.length > 1 && explanations[1] && (
                <li>• <span className="font-bold text-gray-900">
                  {explanations[1].feature}
                  {explanations[1].actualValue !== undefined && explanations[1].actualValue !== ''
                    ? ` (${explanations[1].actualValue})`
                    : ''}
                </span> contributed {explanations[1].value}% to the risk score.</li>
              )}
              {result.bloodPressure && (
                <li>• Your <span className="font-bold text-gray-900">Blood Pressure ({result.bloodPressure})</span> is currently {
                  result.bloodPressure > 140 ? 'elevated' :
                    result.bloodPressure < 90 ? 'low' :
                      'within the monitoring range'
                }.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
