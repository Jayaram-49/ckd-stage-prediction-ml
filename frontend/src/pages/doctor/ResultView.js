import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ChevronLeft, Info, Download } from 'lucide-react';
import ApiService from '../../services/ApiService';

const DoctorResultView = () => {
    const { id } = useParams(); // lab result id
    const [result, setResult] = useState(null);
    const [explanations, setExplanations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch specific lab result for doctor
                // Since we don't have a direct "getLabResultById" for doctors, we'll get it from the explanations call
                // or just fetch all patients and then navigate.
                // Actually, we can just fetch the history of the patient associated with this result.
                // But the result object itself is returned by many endpoints.
                // Let's assume we can get it from a new fetch if needed, but for now we'll rely on the explanations call to get data.

                const explanationsData = await ApiService.getDoctorPatientExplanations(id);
                setExplanations(explanationsData || []);

                // We also need the result details (stage, risk score, etc.)
                // We'll add a way to get the specific result.
                // For now, let's fetch all patients and find the one whose history contains this result.
                // Optimization: In a real app we'd have a specific endpoint for this.
                const patients = await ApiService.getDoctorPatients();
                let foundResult = null;

                for (const p of patients) {
                    const history = await ApiService.getPatientLabHistory(p.id);
                    const current = history.find(item => item.id.toString() === id);
                    if (current) {
                        foundResult = current;
                        break;
                    }
                }
                setResult(foundResult);

            } catch (err) {
                console.error('Failed to fetch result details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDownloadPdf = async () => {
        try {
            const data = await ApiService.downloadDoctorPdfReport(id);
            const blob = new Blob([data], { type: 'application/pdf' });
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
            alert('Failed to download PDF report.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading Clinical Report...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Clinical result not found</p>
                <Link to="/doctor/patients" className="text-primary-600 hover:underline mt-4 inline-block">
                    Back to Patients
                </Link>
            </div>
        );
    }

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <Link to="/doctor/patients" className="flex items-center text-primary-600 font-bold hover:underline mb-4">
                <ChevronLeft size={20} />
                <span>Back to Patient List</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Result Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <h2 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Clinical Assessment</h2>
                        <div className={`text-6xl font-black mb-2 ${result.stage >= 4 ? 'text-danger-600' : result.stage >= 3 ? 'text-warning-600' : 'text-primary-600'}`}>
                            Stage {result.stage}
                        </div>
                        <p className="text-lg font-bold text-gray-700 mb-2">{result.patient.user.fullName}</p>
                        <p className="text-sm text-gray-500 mb-6">{result.ckdDetected === 'yes' ? 'CKD Positive' : 'CKD Negative'}</p>

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
                            <span>Download Signed PDF</span>
                        </button>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <div className="flex items-start space-x-3">
                            <Info className="text-blue-600 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-blue-900">Clinical Context</h4>
                                <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                                    This report is generated by the CKD AI Diagnostic System.
                                    Stage {result.stage} indicates a {result.ckdDetected === 'yes' ? 'significant' : 'low'} probability of chronic kidney disease.
                                    Reference the SHAP analysis for feature contribution.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Explainability Card */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900">Explainable AI (XAI) Report</h3>
                        <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-bold">DOCTOR VIEW</span>
                    </div>

                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        The heatmap below visualizes the clinical parameters that influenced the AI's staging decision.
                        Creatinine and Hemoglobin levels are typically the strongest predictors in this model.
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
                                                `${value}%${actual !== undefined && actual !== '' ? ` (Value: ${actual})` : ''}`,
                                                'Impact'
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
                                <p className="text-sm">SHAP values not available for this record.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Test Date</p>
                            <p className="font-bold text-gray-900">{new Date(result.testDate).toLocaleDateString()}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">CKD Confidence</p>
                            <p className="font-bold text-gray-900">{Math.round(result.confidence)}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorResultView;
