// API Service - Centralized backend communication
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const ML_API_URL = 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const ApiService = {
  // ===== AUTHENTICATION ENDPOINTS =====
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));

      // Extract and store the first role with ROLE_ prefix
      let role = '';
      if (response.data.roles && Array.isArray(response.data.roles) && response.data.roles.length > 0) {
        role = response.data.roles[0];
      } else if (response.data.role) {
        role = response.data.role;
      }

      // Ensure role has ROLE_ prefix
      if (role && !role.startsWith('ROLE_')) {
        role = 'ROLE_' + role;
      }

      if (role) {
        localStorage.setItem('role', role);
      }
    }
    return response.data;
  },

  register: async (username, password, email, fullName, role) => {
    let formattedRole = role || 'ROLE_PATIENT';
    if (!formattedRole.startsWith('ROLE_')) {
      formattedRole = `ROLE_${formattedRole}`;
    }
    const response = await apiClient.post('/auth/register', {
      username,
      password,
      email,
      fullName,
      role: formattedRole
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  resetPassword: async (email, token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { email, token, newPassword });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyToken: async (email, token) => {
    const response = await apiClient.post('/auth/verify-token', { email, token });
    return response.data;
  },

  // ===== PATIENT ENDPOINTS =====
  submitLabData: async (labResult) => {
    const response = await apiClient.post('/patient/lab-data', labResult);
    return response.data;
  },

  getPatientHistory: async () => {
    const response = await apiClient.get('/patient/history');
    return response.data;
  },

  getPatientProfile: async () => {
    const response = await apiClient.get('/patient/profile');
    return response.data;
  },

  getPatientExplanations: async (resultId) => {
    const response = await apiClient.get(`/patient/result/${resultId}/explain`);
    return response.data;
  },



  downloadPdfReport: async (resultId) => {
    const response = await apiClient.get(`/patient/result/${resultId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ===== DOCTOR ENDPOINTS =====
  getDoctorPatients: async () => {
    const response = await apiClient.get('/doctor/patients');
    return response.data;
  },

  getPatientLabHistory: async (patientId) => {
    const response = await apiClient.get(`/doctor/patient/${patientId}/history`);
    return response.data;
  },

  getDoctorPatientExplanations: async (resultId) => {
    const response = await apiClient.get(`/doctor/result/${resultId}/explain`);
    return response.data;
  },

  downloadDoctorPdfReport: async (resultId) => {
    const response = await apiClient.get(`/doctor/result/${resultId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ===== ML SERVICE ENDPOINTS =====
  predictCKD: async (labResults, vitals, demographics) => {
    try {
      const response = await axios.post(`${ML_API_URL}/predict`, {
        labResults,
        vitals,
        demographics
      }, { timeout: 15000 });
      return response.data;
    } catch (error) {
      console.error('ML prediction error:', error);
      throw error;
    }
  },

  getModelInfo: async () => {
    try {
      const response = await axios.get(`${ML_API_URL}/model-info`);
      return response.data;
    } catch (error) {
      console.error('Model info error:', error);
      return null;
    }
  },

  // ===== CHATBOT ENDPOINTS =====
  sendChatMessage: async (message, context) => {
    const response = await apiClient.post('/chatbot/message', {
      message,
      context
    });
    return response.data;
  },

  getChatHistory: async () => {
    const response = await apiClient.get('/chatbot/history');
    return response.data;
  },

  // ===== UTILITY METHODS =====
  isAuthenticated: () => !!localStorage.getItem('token'),

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getCurrentRole: () => {
    const user = ApiService.getCurrentUser();
    return user?.role || null;
  },

  hasRole: (role) => {
    const userRole = ApiService.getCurrentRole();
    return userRole === role;
  }
};

export default ApiService;
