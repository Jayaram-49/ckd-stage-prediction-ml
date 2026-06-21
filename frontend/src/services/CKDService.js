// CKD Service - Provides CKD data and calculations
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const ML_API_URL = 'http://localhost:8000';

export const CKDService = {
  // Get sample patient data for demo
  getSamplePatient: () => ({
    id: 1,
    name: 'John Doe',
    age: 58,
    gender: 'Male',
    labResults: {
      creatinine: 1.5,
      bloodUrea: 45,
      gfr: 45,
      urine: 'Abnormal',
      potassium: 5.2,
      phosphorus: 4.0,
      hemoglobin: 10.5
    },
    vitals: {
      systolic: 145,
      diastolic: 95,
      glucose: 180
    },
    riskFactors: {
      diabetes: true,
      hypertension: true,
      familyHistory: true,
      smoking: false,
      obesity: true
    }
  }),

  // Calculate CKD stage based on GFR
  calculateCKDStage: (gfr) => {
    if (gfr >= 90) return { stage: 1, label: 'Stage 1 Normal kidney Function: (eGFR >=90+)', color: 'success', risk: 'Low' };
    if (gfr >= 60) return { stage: 2, label: 'Stage 2 (Mild CKD): Mild loss of kidney function (eGFR 60-89)', color: 'warning', risk: 'Low-Moderate' };
    if (gfr >= 30) return { stage: 3, label: 'Stage 3 (Moderate CKD): moderate loss (eGFR 30-59)', color: 'warning', risk: 'Moderate' };
    if (gfr >= 15) return { stage: 4, label: 'Stage 4 (Severe CKD): Severe loss of function (eGFR 15-29)', color: 'danger', risk: 'High' };
    return { stage: 5, label: 'Stage 5 (End-Stage Renal Disease - ESRD): Kidney failure (eGFR < 15), requiring dialysis or transplant', color: 'danger', risk: 'Critical' };
  },

  // Calculate risk score (0-100)
  calculateRiskScore: (labResults, vitals, riskFactors) => {
    let score = 0;

    // Handle undefined or null inputs
    labResults = labResults || {};
    vitals = vitals || {};
    riskFactors = riskFactors || {};

    // GFR contribution (0-30 points)
    if (labResults.gfr && labResults.gfr < 15) score += 30;
    else if (labResults.gfr && labResults.gfr < 30) score += 25;
    else if (labResults.gfr && labResults.gfr < 45) score += 20;
    else if (labResults.gfr && labResults.gfr < 60) score += 15;
    else if (labResults.gfr && labResults.gfr < 90) score += 10;

    // Creatinine contribution (0-20 points)
    if (labResults.creatinine && labResults.creatinine > 4) score += 20;
    else if (labResults.creatinine && labResults.creatinine > 2) score += 15;
    else if (labResults.creatinine && labResults.creatinine > 1.5) score += 10;
    else if (labResults.creatinine && labResults.creatinine > 1.2) score += 5;

    // Blood urea contribution (0-15 points)
    if (labResults.bloodUrea && labResults.bloodUrea > 100) score += 15;
    else if (labResults.bloodUrea && labResults.bloodUrea > 50) score += 10;
    else if (labResults.bloodUrea && labResults.bloodUrea > 30) score += 5;

    // Blood pressure contribution (0-15 points)
    if ((vitals.systolic && vitals.systolic > 160) || (vitals.diastolic && vitals.diastolic > 100)) score += 15;
    else if ((vitals.systolic && vitals.systolic > 140) || (vitals.diastolic && vitals.diastolic > 90)) score += 10;
    else if ((vitals.systolic && vitals.systolic > 130) || (vitals.diastolic && vitals.diastolic > 80)) score += 5;

    // Diabetes contribution (0-10 points)
    if (riskFactors.diabetes) score += 10;

    // Hypertension contribution (0-10 points)
    if (riskFactors.hypertension) score += 5;

    // Smoking contribution (0-5 points)
    if (riskFactors.smoking) score += 5;

    return Math.min(score, 100);
  },

  // Get progression forecast data
  getProgressionForecast: (currentGFR, currentStage) => {
    const months = ['Month 0', 'Month 3', 'Month 6', 'Month 9', 'Month 12'];
    const data = [];
    let gfr = currentGFR;

    months.forEach((month, index) => {
      data.push({
        month,
        gfr: Math.max(gfr - index * 2, 5),
        stage: `Stage ${index <= 1 ? currentStage : currentStage + 1}`
      });
    });

    return data;
  },

  // Get lab results trend data
  getLabTrends: () => [
    { month: 'Jan', creatinine: 1.2, gfr: 60, bloodUrea: 35 },
    { month: 'Feb', creatinine: 1.3, gfr: 58, bloodUrea: 38 },
    { month: 'Mar', creatinine: 1.4, gfr: 52, bloodUrea: 42 },
    { month: 'Apr', creatinine: 1.5, gfr: 45, bloodUrea: 45 },
    { month: 'May', creatinine: 1.55, gfr: 43, bloodUrea: 48 },
    { month: 'Jun', creatinine: 1.6, gfr: 40, bloodUrea: 52 }
  ],

  // Fetch doctor analysis from backend
  getDoctorAnalysis: async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/doctor/patient/${patientId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analysis:', error);
      return null;
    }
  },

  // Fetch ML predictions
  getPrediction: async (labResults) => {
    try {
      const response = await axios.post(`${ML_API_URL}/predict`, labResults);
      return response.data;
    } catch (error) {
      console.error('Error fetching prediction:', error);
      return null;
    }
  }
};

export default CKDService;
