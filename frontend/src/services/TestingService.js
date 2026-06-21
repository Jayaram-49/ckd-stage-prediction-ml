/**
 * Testing & Debugging Utilities
 * Validates all API endpoints and authentication flows
 */

import ApiService from './ApiService';
import { CKDService } from './CKDService';

export const TestingService = {
  // Test authentication flow
  testAuthentication: async () => {
    console.log('🔐 Testing Authentication Flow...');
    const results = {
      login: null,
      tokenStorage: null,
      logout: null,
      errors: []
    };

    try {
      // Test 1: Login
      console.log('  → Testing login endpoint...');
      try {
        const response = await ApiService.login('admin', 'admin123');
        results.login = response.token ? '✓ Pass' : '✗ No token returned';
        console.log('    ' + results.login);
      } catch (err) {
        results.login = '✗ Failed: ' + err.message;
        results.errors.push('Login: ' + err.message);
        console.error('    ' + results.login);
      }

      // Test 2: Token storage
      console.log('  → Testing token storage...');
      const token = localStorage.getItem('token');
      results.tokenStorage = token ? '✓ Pass' : '✗ Token not stored';
      console.log('    ' + results.tokenStorage);

      // Test 3: Logout
      console.log('  → Testing logout...');
      ApiService.logout();
      const afterLogout = localStorage.getItem('token');
      results.logout = !afterLogout ? '✓ Pass' : '✗ Token still present';
      console.log('    ' + results.logout);
    } catch (err) {
      console.error('Authentication test error:', err);
      results.errors.push('Overall: ' + err.message);
    }

    return results;
  },

  // Test patient API endpoints
  testPatientEndpoints: async () => {
    console.log('👨‍⚕️ Testing Patient Endpoints...');
    const results = {
      profile: null,
      history: null,
      labSubmission: null,
      errors: []
    };

    try {
      // Login first
      await ApiService.login('admin', 'admin123');

      // Test 1: Get profile
      console.log('  → Testing GET /patient/profile...');
      try {
        const profile = await ApiService.getPatientProfile();
        results.profile = profile ? '✓ Pass' : '✗ No data returned';
        console.log('    ' + results.profile);
      } catch (err) {
        results.profile = '✗ Failed: ' + err.message;
        results.errors.push('Profile: ' + err.message);
        console.error('    ' + results.profile);
      }

      // Test 2: Get history
      console.log('  → Testing GET /patient/history...');
      try {
        const history = await ApiService.getPatientHistory();
        results.history = Array.isArray(history) ? '✓ Pass' : '✗ Invalid response';
        console.log('    ' + results.history);
      } catch (err) {
        results.history = '✗ Failed: ' + err.message;
        results.errors.push('History: ' + err.message);
        console.error('    ' + results.history);
      }

      // Test 3: Lab submission
      console.log('  → Testing POST /patient/lab-data...');
      try {
        const labData = {
          creatinine: 1.5,
          bloodUrea: 45,
          gfr: 45,
          testDate: new Date().toISOString()
        };
        const response = await ApiService.submitLabData(labData);
        results.labSubmission = response ? '✓ Pass' : '✗ No response';
        console.log('    ' + results.labSubmission);
      } catch (err) {
        results.labSubmission = '✗ Failed: ' + err.message;
        results.errors.push('Lab submission: ' + err.message);
        console.error('    ' + results.labSubmission);
      }

      ApiService.logout();
    } catch (err) {
      console.error('Patient endpoints test error:', err);
      results.errors.push('Overall: ' + err.message);
    }

    return results;
  },

  // Test doctor API endpoints
  testDoctorEndpoints: async () => {
    console.log('👨‍⚕️ Testing Doctor Endpoints...');
    const results = {
      patients: null,
      patientHistory: null,
      errors: []
    };

    try {
      // Login as doctor
      await ApiService.login('admin', 'admin123');

      // Test 1: Get patients
      console.log('  → Testing GET /doctor/patients...');
      try {
        const patients = await ApiService.getDoctorPatients();
        results.patients = Array.isArray(patients) ? '✓ Pass' : '✗ Invalid response';
        console.log('    ' + results.patients);
      } catch (err) {
        results.patients = '✗ Failed: ' + err.message;
        results.errors.push('Patients list: ' + err.message);
        console.error('    ' + results.patients);
      }

      // Test 2: Get patient history
      console.log('  → Testing GET /doctor/patient/{id}/history...');
      try {
        const history = await ApiService.getPatientLabHistory(1);
        results.patientHistory = history ? '✓ Pass' : '✗ No data';
        console.log('    ' + results.patientHistory);
      } catch (err) {
        results.patientHistory = '✗ Failed: ' + err.message;
        results.errors.push('Patient history: ' + err.message);
        console.error('    ' + results.patientHistory);
      }

      ApiService.logout();
    } catch (err) {
      console.error('Doctor endpoints test error:', err);
      results.errors.push('Overall: ' + err.message);
    }

    return results;
  },

  // Test ML service connectivity
  testMLService: async () => {
    console.log('🤖 Testing ML Service...');
    const results = {
      connectivity: null,
      prediction: null,
      modelInfo: null,
      errors: []
    };

    try {
      // Test 1: Check connectivity
      console.log('  → Testing ML service connectivity...');
      try {
        const info = await ApiService.getModelInfo();
        results.connectivity = info ? '✓ Connected' : '✗ No response';
        results.modelInfo = info;
        console.log('    ' + results.connectivity);
      } catch (err) {
        results.connectivity = '✗ Failed: ' + err.message;
        results.errors.push('Connectivity: ' + err.message);
        console.error('    ' + results.connectivity);
      }

      // Test 2: Test prediction
      console.log('  → Testing ML prediction endpoint...');
      try {
        const patient = CKDService.getSamplePatient();
        const prediction = await ApiService.predictCKD(
          patient.labResults,
          patient.vitals,
          { age: 58, gender: 'Male' }
        );
        results.prediction = prediction ? '✓ Pass' : '✗ No response';
        console.log('    ' + results.prediction);
      } catch (err) {
        results.prediction = '✗ Failed: ' + err.message;
        results.errors.push('Prediction: ' + err.message);
        console.error('    ' + results.prediction);
      }
    } catch (err) {
      console.error('ML service test error:', err);
      results.errors.push('Overall: ' + err.message);
    }

    return results;
  },

  // Test CKD service calculations
  testCKDService: () => {
    console.log('📊 Testing CKD Service...');
    const results = {
      stageCalculation: null,
      riskScoring: null,
      forecasting: null,
      errors: []
    };

    try {
      // Test 1: Stage calculation
      console.log('  → Testing CKD stage calculation...');
      try {
        const stage1 = CKDService.calculateCKDStage(90);
        const stage5 = CKDService.calculateCKDStage(10);
        results.stageCalculation = (stage1.stage === 1 && stage5.stage === 5) ? '✓ Pass' : '✗ Incorrect calculation';
        console.log('    ' + results.stageCalculation);
      } catch (err) {
        results.stageCalculation = '✗ Failed: ' + err.message;
        results.errors.push('Stage calc: ' + err.message);
        console.error('    ' + results.stageCalculation);
      }

      // Test 2: Risk scoring
      console.log('  → Testing risk score calculation...');
      try {
        const patient = CKDService.getSamplePatient();
        const risk = CKDService.calculateRiskScore(
          patient.labResults,
          patient.vitals,
          patient.riskFactors
        );
        results.riskScoring = (risk >= 0 && risk <= 100) ? '✓ Pass' : '✗ Invalid score';
        console.log('    ' + results.riskScoring + ' (Score: ' + risk + ')');
      } catch (err) {
        results.riskScoring = '✗ Failed: ' + err.message;
        results.errors.push('Risk scoring: ' + err.message);
        console.error('    ' + results.riskScoring);
      }

      // Test 3: Forecasting
      console.log('  → Testing GFR progression forecast...');
      try {
        const forecast = CKDService.getProgressionForecast(45, '3');
        results.forecasting = (Array.isArray(forecast) && forecast.length > 0) ? '✓ Pass' : '✗ Invalid forecast';
        console.log('    ' + results.forecasting);
      } catch (err) {
        results.forecasting = '✗ Failed: ' + err.message;
        results.errors.push('Forecasting: ' + err.message);
        console.error('    ' + results.forecasting);
      }
    } catch (err) {
      console.error('CKD service test error:', err);
      results.errors.push('Overall: ' + err.message);
    }

    return results;
  },

  // Run all tests
  runAllTests: async () => {
    console.log('═'.repeat(60));
    console.log('🧪 RUNNING COMPREHENSIVE TEST SUITE');
    console.log('═'.repeat(60));

    const allResults = {
      timestamp: new Date().toISOString(),
      authentication: await TestingService.testAuthentication(),
      patientEndpoints: await TestingService.testPatientEndpoints(),
      doctorEndpoints: await TestingService.testDoctorEndpoints(),
      mlService: await TestingService.testMLService(),
      ckdService: TestingService.testCKDService()
    };

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));

    let totalTests = 0;
    let passedTests = 0;

    Object.values(allResults).forEach((category, idx) => {
      if (typeof category === 'object' && !Array.isArray(category) && category.timestamp === undefined) {
        Object.values(category).forEach((test) => {
          if (test && typeof test === 'string' && test.includes('Pass')) {
            passedTests++;
          }
          if (test && typeof test === 'string' && (test.includes('Pass') || test.includes('Failed'))) {
            totalTests++;
          }
        });
      }
    });

    const passPercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    console.log(`\n✓ Passed: ${passedTests}/${totalTests} (${passPercentage}%)`);
    console.log(`✗ Failed: ${totalTests - passedTests}/${totalTests}`);

    if (allResults.authentication.errors.length > 0) {
      console.log('\n⚠️ Authentication Issues:');
      allResults.authentication.errors.forEach(err => console.log('  - ' + err));
    }

    console.log('═'.repeat(60));

    return allResults;
  }
};

export default TestingService;
