import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, BeakerIcon, ChartBarIcon, ChatBubbleLeftRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Stethoscope } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CKDService from '../../services/CKDService';

// CKD Stage progression data with stage information
// Updated with distinct colors for each stage
const heroChartData = [
  { name: 'Stage 1 Normal kidney Function', value: '≥ 90+', eGFR: 95, stage: 1 },
  { name: 'Stage 2 (Mild CKD)', value: '60-89', eGFR: 75, stage: 2 },
  { name: 'Stage 3 (Moderate CKD)', value: '30-59', eGFR: 45, stage: 3 },
  { name: 'Stage 4 (Severe CKD)', value: '15-29', eGFR: 22, stage: 4 },
  { name: 'Stage 5 (End-Stage Renal Disease - ESRD)', value: '< 15', eGFR: 12, stage: 5 },
];

// Function to get color based on CKD stage
const getStageColor = (stage) => {
  switch (stage) {
    case 1:
      return '#059669'; // emerald green - Stage 1 (Normal/High)
    case 2:
      return '#84cc16'; // lime - Stage 2 (Mild)
    case 3:
      return '#fbbf24'; // amber - Stage 3 (Moderate)
    case 4:
      return '#fb923c'; // deep orange - Stage 4 (Severe)
    case 5:
      return '#ef4444'; // red - Stage 5 (Kidney Failure)
    default:
      return '#6b7280'; // gray - unknown
  }
};

const riskFactorData = [
  { name: 'Diabetes', value: 35, color: '#3b82f6' },
  { name: 'Hypertension', value: 30, color: '#ef4444' },
  { name: 'Family History', value: 15, color: '#10b981' },
  { name: 'Age', value: 10, color: '#f59e0b' },
  { name: 'Obesity', value: 10, color: '#8b5cf6' },
];

const Home = () => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(72);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-xl">
            <Stethoscope className="w-6 h-6 text-primary-600" />
          </div>
          <span className="text-xl font-bold text-primary-900">CKD AI</span>
        </div>
        <div className="space-x-8 text-sm font-medium text-gray-600">
          <button onClick={() => scrollToSection('home')} className="hover:text-primary-600 transition cursor-pointer">Home</button>
          <button onClick={() => scrollToSection('features')} className="hover:text-primary-600 transition cursor-pointer">Features</button>
          <button onClick={() => scrollToSection('about')} className="hover:text-primary-600 transition cursor-pointer">About CKD</button>
          <Link to="/login" className="bg-primary-600 text-white px-5 py-2 rounded-full hover:bg-primary-700 transition">Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-primary-50 to-white py-20 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-5xl font-extrabold text-primary-900 leading-tight mb-6">
              AI-Driven Explainable <br />
              <span className="text-primary-600">CKD Staging & Risk</span> Platform
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-lg">
              Next-generation healthcare platform powered by Artificial Neural Networks for early detection,
              precise staging, and risk monitoring of Chronic Kidney Disease.
            </p>
            <div className="flex space-x-4">
              <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-200">
                Get Started
              </Link>
              <Link to="/demo" className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition">
                View Demo
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-success-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-warning-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-bold text-gray-400">CKD STAGE GRAPH</span>
                  <span className="px-3 py-1 bg-danger-100 text-danger-600 rounded-full text-xs font-bold">HIGH RISK</span>
                </div>
                <div className="h-40 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={heroChartData}>
                      <XAxis dataKey="name" hide />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          backgroundColor: '#fff',
                          padding: '12px'
                        }}
                        cursor={{ fill: 'transparent' }}
                        labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                        formatter={(value, name, props) => [
                          <span key="val" className="font-bold text-primary-600">{props.payload.value} ml/min</span>,
                          <span key="name" className="text-gray-500">eGFR</span>
                        ]}
                        labelFormatter={(label) => label}
                      />
                      <Bar
                        dataKey="eGFR"
                        radius={[6, 6, 0, 0]}
                        barSize={30}
                      >
                        {heroChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStageColor(entry.stage)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Scroll Down Arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => scrollToSection('features')}>
          <ChevronDownIcon className="w-8 h-8 text-primary-600 hover:text-primary-700 transition" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">Platform Features</h2>
            <div className="w-20 h-1.5 bg-primary-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BeakerIcon className="w-8 h-8 text-primary-600" />}
              title="Precise Staging"
              desc="Accurate classification from Stage 1 to Stage 5 using advanced ANN models."
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="w-8 h-8 text-success-600" />}
              title="Explainable AI"
              desc="Understand the 'Why' behind every prediction with feature contribution graphs."
            />
            <FeatureCard
              icon={<ChartBarIcon className="w-8 h-8 text-warning-600" />}
              title="Risk Monitoring"
              desc="Predict future progression probability and track GFR trends over time."
            />
            <FeatureCard
              icon={<ChatBubbleLeftRightIcon className="w-8 h-8 text-danger-600" />}
              title="Clinical Chatbot"
              desc="AI-powered medical assistant for patients and decision support for doctors."
            />
          </div>
        </div>
        {/* Scroll Down Arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => scrollToSection('about')}>
          <ChevronDownIcon className="w-8 h-8 text-primary-600 hover:text-primary-700 transition" />
        </div>
      </section>

      {/* About CKD Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">Understanding Chronic Kidney Disease (CKD)</h2>
            <div className="w-20 h-1.5 bg-primary-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-primary-900 mb-6">What is CKD?</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Chronic Kidney Disease (CKD) is a progressive condition where the kidneys gradually lose their ability to filter waste and excess fluid from the blood. This leads to a buildup of these substances in the body, potentially causing serious health problems.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                CKD is classified into five stages based on eGFR (estimated Glomerular Filtration Rate), with Stage 1 indicating minimal kidney damage and Stage 5 representing kidney failure requiring dialysis or transplant.
              </p>
              <h4 className="text-xl font-bold text-primary-900 mt-8 mb-4">Risk Factors:</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskFactorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskFactorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-primary-50 p-8 rounded-2xl border-2 border-primary-100">
              <h4 className="text-xl font-bold text-primary-900 mb-6">CKD Stages Overview</h4>
              <div className="space-y-4">
                <StageCard stage="Stage 1 Normal kidney Function" eGFR="≥ 90+" desc="" color="success" />
                <StageCard stage="Stage 2 (Mild CKD)" eGFR="60-89" desc="Mild loss of kidney function" color="warning" />
                <StageCard stage="Stage 3 (Moderate CKD)" eGFR="30-59" desc="moderate loss" color="warning" />
                <StageCard stage="Stage 4 (Severe CKD)" eGFR="15-29" desc="Severe loss of function" color="danger" />
                <StageCard stage="Stage 5 (End-Stage Renal Disease - ESRD)" eGFR="< 15" desc="Kidney failure, requiring dialysis or transplant" color="danger" />
              </div>
              <p className="text-xs text-gray-500 mt-6 text-center">eGFR: estimated Glomerular Filtration Rate</p>
            </div>
          </div>
          <div className="mt-12 bg-info-50 border-l-4 border-info-600 p-6 rounded">
            <h4 className="text-lg font-bold text-info-900 mb-2">Early Detection is Key</h4>
            <p className="text-info-700">
              Our AI-powered platform enables the early detection of CKD, facilitating timely intervention and management to slow disease progression and improve the quality of life.
            </p>
          </div>
        </div>
      </section>

      {/* Patient Risk Visualization Demo */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">Patient Risk Assessment Example</h2>
            <div className="w-20 h-1.5 bg-primary-600 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-4">See how our AI analyzes patient data to provide risk scores and predictions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Risk Score Card */}
            <div className="bg-gradient-to-br from-danger-50 to-warning-50 border-2 border-danger-200 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Overall Risk Score</h3>
              <div className="text-5xl font-bold text-danger-600 mb-4">72</div>
              <p className="text-sm text-danger-700 font-semibold mb-4">High Risk</p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-danger-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${animatedWidth}%` }}></div>
              </div>
              <Link
                to="/demo"
                className="inline-block mt-6 text-primary-600 font-semibold hover:text-primary-700 transition"
              >
                View Full Analysis →
              </Link>
            </div>

            {/* CKD Stage */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Current CKD Stage</h3>
              <div className="text-5xl font-bold text-primary-600 mb-4">3</div>
              <p className="text-gray-600 text-sm mb-4">Moderately decreased kidney function</p>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-danger-500"></span>
                <span className="text-sm font-semibold text-gray-700">Moderate-High Risk</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Lab Values</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600 text-sm">eGFR</span>
                  <span className="font-bold text-primary-900">45 mL/min</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600 text-sm">Creatinine</span>
                  <span className="font-bold text-primary-900">1.5 mg/dL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Blood Urea</span>
                  <span className="font-bold text-primary-900">45 mg/dL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lab Trends Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-bold text-primary-900 mb-6">6-Month Lab Trends</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={CKDService.getLabTrends()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#3b82f6"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'eGFR', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#ef4444"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Creatinine', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                  formatter={(value, name) => [
                    <span key="val" className="font-bold">{value} {name === 'eGFR' ? 'ml/min' : 'mg/dL'}</span>,
                    <span key="name">{name}</span>
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="gfr"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{ fill: '#3b82f6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  name="eGFR"
                  animationDuration={1500}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="creatinine"
                  stroke="#ef4444"
                  strokeWidth={4}
                  dot={{ fill: '#ef4444', r: 6, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  name="Creatinine"
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4">
              The chart shows a declining trend in eGFR and increasing creatinine levels, indicating progressive kidney function decline.
            </p>
          </div>

          {/* Demo CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Explore Interactive Patient Risk Analysis</h3>
            <p className="mb-8 text-primary-100">View comprehensive risk assessment with multiple visualizations, predictions, and clinical recommendations.</p>
            <Link
              to="/demo"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
            >
              View Full Demo with Graphs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CKD AI</span>
            </div>
            <p className="text-primary-300 text-sm max-w-xs">
              Advanced healthcare diagnostic platform for Chronic Kidney Disease.
            </p>
          </div>
          <div className="text-sm text-primary-400">
            © 2026 CKD AI Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition duration-300 border border-transparent hover:border-primary-100 group">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-primary-600 transition">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const StageCard = ({ stage, eGFR, desc, color }) => {
  const colorClasses = {
    success: 'bg-success-50 border-success-200 text-success-900',
    warning: 'bg-warning-50 border-warning-200 text-warning-900',
    danger: 'bg-danger-50 border-danger-200 text-danger-900'
  };

  return (
    <div className={`p-4 border rounded-lg ${colorClasses[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold">{stage}</p>
          <p className="text-sm">{desc}</p>
        </div>
        <span className="text-sm font-bold whitespace-nowrap ml-4">eGFR: {eGFR}</span>
      </div>
    </div>
  );
};

export default Home;
