import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Save, RotateCcw } from 'lucide-react';

const LabEntry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bloodPressure: 80,
    specificGravity: 1.020,
    albumin: 0,
    sugar: 0,
    redBloodCells: 'normal',
    pusCell: 'normal',
    pusCellClumps: 'notpresent',
    bacteria: 'notpresent',
    bloodGlucoseRandom: 120,
    bloodUrea: 36,
    serumCreatinine: 1.2,
    sodium: 138,
    potassium: 4.4,
    hemoglobin: 15.4,
    packedCellVolume: 44,
    whiteBloodCellCount: 7800,
    redBloodCellCount: 5.2,
    hypertension: 'no',
    diabetesMellitus: 'no',
    coronaryArteryDisease: 'no',
    appetite: 'good',
    pedaEdema: 'no',
    aanemia: 'no'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    const validations = [
      { field: 'bloodPressure', label: 'Blood Pressure', min: 50, max: 200 },
      { field: 'specificGravity', label: 'Specific Gravity', min: 1.001, max: 1.030 },
      { field: 'albumin', label: 'Albumin', min: 0, max: 5 },
      { field: 'sugar', label: 'Sugar', min: 0, max: 5 },
      { field: 'bloodGlucoseRandom', label: 'Random Glucose', min: 50, max: 500 },
      { field: 'bloodUrea', label: 'Blood Urea', min: 1, max: 200 },
      { field: 'serumCreatinine', label: 'Serum Creatinine', min: 0.1, max: 20 },
      { field: 'hemoglobin', label: 'Hemoglobin', min: 1, max: 25 },
    ];

    for (const v of validations) {
      const val = parseFloat(formData[v.field]);
      if (isNaN(val) || val < v.min || val > v.max) {
        setError(`${v.label} must be between ${v.min} and ${v.max}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8080/api/patient/lab-data', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/patient/result/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Enter Lab Results</h1>
        <p className="text-gray-500">Provide your clinical data for AI analysis and CKD staging.</p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center space-x-3 animate-shake">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-700 text-sm font-medium">{error}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Numerical Fields */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider">Vital Signs & Lab Values</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Blood Pressure" name="bloodPressure" value={formData.bloodPressure} onChange={setFormData} />
              <InputField label="Specific Gravity" name="specificGravity" value={formData.specificGravity} onChange={setFormData} step="0.005" />
              <InputField label="Albumin (0-5)" name="albumin" value={formData.albumin} onChange={setFormData} />
              <InputField label="Sugar (0-5)" name="sugar" value={formData.sugar} onChange={setFormData} />
              <InputField label="Random Glucose" name="bloodGlucoseRandom" value={formData.bloodGlucoseRandom} onChange={setFormData} />
              <InputField label="Blood Urea" name="bloodUrea" value={formData.bloodUrea} onChange={setFormData} />
              <InputField label="Serum Creatinine" name="serumCreatinine" value={formData.serumCreatinine} onChange={setFormData} step="0.1" />
              <InputField label="Hemoglobin" name="hemoglobin" value={formData.hemoglobin} onChange={setFormData} step="0.1" />
            </div>
          </div>

          {/* Categorical Fields */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider">Clinical Observations</h3>
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Red Blood Cells" name="redBloodCells" options={['normal', 'abnormal']} value={formData.redBloodCells} onChange={setFormData} />
              <SelectField label="Pus Cell" name="pusCell" options={['normal', 'abnormal']} value={formData.pusCell} onChange={setFormData} />
              <SelectField label="Hypertension" name="hypertension" options={['yes', 'no']} value={formData.hypertension} onChange={setFormData} />
              <SelectField label="Diabetes" name="diabetesMellitus" options={['yes', 'no']} value={formData.diabetesMellitus} onChange={setFormData} />
              <SelectField label="Appetite" name="appetite" options={['good', 'poor']} value={formData.appetite} onChange={setFormData} />
              <SelectField label="Anemia" name="aanemia" options={['yes', 'no']} value={formData.aanemia} onChange={setFormData} />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-end space-x-4">
          <button
            type="button"
            className="flex items-center space-x-2 px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-8 py-2 bg-primary-600 text-white font-bold hover:bg-primary-700 rounded-xl transition shadow-lg shadow-primary-200 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Processing...' : 'Submit & Analyze'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, step = "1" }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
    <input
      type="number"
      step={step}
      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm font-medium"
      value={value}
      onChange={(e) => onChange(prev => ({ ...prev, [name]: e.target.value }))}
    />
  </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
    <select
      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm font-medium capitalize"
      value={value}
      onChange={(e) => onChange(prev => ({ ...prev, [name]: e.target.value }))}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default LabEntry;
