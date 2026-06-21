import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import TestingService from '../../services/TestingService';

const TestingPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleRunTests = async () => {
    setLoading(true);
    const testResults = await TestingService.runAllTests();
    setResults(testResults);
    setLoading(false);
  };

  const renderTestResult = (test) => {
    if (!test) return null;
    const isPassed = typeof test === 'string' && test.includes('Pass');
    return (
      <div className="flex items-center space-x-2">
        {isPassed ? (
          <>
            <CheckCircle className="text-success-600" size={20} />
            <span className="text-success-700 font-semibold">{test}</span>
          </>
        ) : (
          <>
            <AlertCircle className="text-danger-600" size={20} />
            <span className="text-danger-700 font-semibold">{test}</span>
          </>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'auth', label: 'Authentication', icon: '🔐' },
    { id: 'patient', label: 'Patient APIs', icon: '👨‍⚕️' },
    { id: 'doctor', label: 'Doctor APIs', icon: '👨‍⚕️' },
    { id: 'ml', label: 'ML Service', icon: '🤖' },
    { id: 'ckd', label: 'CKD Service', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Testing & Debugging Dashboard</h1>
          <p className="text-gray-600 mb-6">Run comprehensive tests to validate all services and APIs</p>
          <button
            onClick={handleRunTests}
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Running Tests...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Run All Tests</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-semibold whitespace-nowrap transition ${
                      activeTab === tab.id
                        ? 'border-b-2 border-primary-600 text-primary-600'
                        : 'text-gray-600 hover:text-primary-600'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8 space-y-4">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-lg border border-primary-200">
                        <p className="text-sm text-primary-700 mb-2">Test Timestamp</p>
                        <p className="text-lg font-bold text-primary-900">{new Date(results.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-success-50 to-success-100 p-6 rounded-lg border border-success-200">
                        <p className="text-sm text-success-700 mb-2">Status</p>
                        <p className="text-lg font-bold text-success-900">✓ Ready for Testing</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Test Categories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-700">✓ Authentication</p>
                          <p className="text-sm text-gray-600">Login, token management, logout</p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-700">✓ Patient APIs</p>
                          <p className="text-sm text-gray-600">Profile, history, lab data submission</p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-700">✓ Doctor APIs</p>
                          <p className="text-sm text-gray-600">Patient lists, patient history</p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-700">✓ ML & CKD Services</p>
                          <p className="text-sm text-gray-600">Predictions, calculations, forecasting</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'auth' && (
                  <div className="space-y-4">
                    {results.authentication && Object.entries(results.authentication).map(([key, value]) => (
                      key !== 'errors' && (
                        <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500 uppercase font-bold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          {renderTestResult(value)}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {activeTab === 'patient' && (
                  <div className="space-y-4">
                    {results.patientEndpoints && Object.entries(results.patientEndpoints).map(([key, value]) => (
                      key !== 'errors' && (
                        <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500 uppercase font-bold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          {renderTestResult(value)}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {activeTab === 'doctor' && (
                  <div className="space-y-4">
                    {results.doctorEndpoints && Object.entries(results.doctorEndpoints).map(([key, value]) => (
                      key !== 'errors' && (
                        <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500 uppercase font-bold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          {renderTestResult(value)}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {activeTab === 'ml' && (
                  <div className="space-y-4">
                    {results.mlService && Object.entries(results.mlService).map(([key, value]) => (
                      key !== 'errors' && (
                        <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500 uppercase font-bold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          {typeof value === 'object' ? (
                            <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-auto">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            renderTestResult(value)
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {activeTab === 'ckd' && (
                  <div className="space-y-4">
                    {results.ckdService && Object.entries(results.ckdService).map(([key, value]) => (
                      key !== 'errors' && (
                        <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500 uppercase font-bold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          {renderTestResult(value)}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Errors Summary */}
            {(results.authentication?.errors?.length > 0 ||
              results.patientEndpoints?.errors?.length > 0 ||
              results.doctorEndpoints?.errors?.length > 0 ||
              results.mlService?.errors?.length > 0 ||
              results.ckdService?.errors?.length > 0) && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-8">
                <h3 className="text-lg font-bold text-danger-900 mb-4">⚠️ Issues Found</h3>
                <div className="space-y-2">
                  {[...Object.values(results)].flatMap(cat => cat?.errors || []).map((err, idx) => (
                    <p key={idx} className="text-sm text-danger-700">• {err}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!results && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <span className="text-3xl">🧪</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Test</h3>
            <p className="text-gray-600 mb-8">Click "Run All Tests" to validate all services and API endpoints</p>
            <div className="inline-flex items-center space-x-4 text-sm text-gray-600">
              <span>✓ Authentication</span>
              <span>✓ Patient APIs</span>
              <span>✓ Doctor APIs</span>
              <span>✓ ML Service</span>
              <span>✓ CKD Calculations</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestingPage;
