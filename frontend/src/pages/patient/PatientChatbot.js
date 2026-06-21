import React from 'react';
import Chatbot from '../../components/Chatbot';
import CrossPortalMessaging from '../../components/CrossPortalMessaging';

const PatientChatbot = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Health Assistant</h1>
        <p className="text-gray-500 mt-2">Chat with AI or message your doctor.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Assistant Section */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-primary-600 p-4 text-white">
            <h3 className="font-bold text-lg">AI Assistant (Patient Mode)</h3>
            <p className="text-sm text-primary-100 mt-1">
              Safe, non-prescriptive guidance about CKD stages, diet, and lifestyle.
            </p>
          </div>
          <div className="p-4">
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <p className="text-xs text-gray-600 font-semibold mb-1">💡 Example Questions:</p>
              <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
                <li>"What is CKD?"</li>
                <li>"What does Stage 3 mean?"</li>
                <li>"How can I improve my kidney health?"</li>
              </ul>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden">
              <Chatbot embedded={true} modeOverride="PATIENT" />
            </div>
          </div>
        </div>

        {/* Message Doctor Section */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-success-600 p-4 text-white">
            <h3 className="font-bold text-lg">Message Doctor</h3>
            <p className="text-sm text-success-100 mt-1">
              Direct messaging with your doctor for questions about your reports.
            </p>
          </div>
          <div className="p-4">
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <p className="text-xs text-blue-700 font-semibold">
                📋 Select your doctor from the list to start messaging
              </p>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden">
              <CrossPortalMessaging embedded={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChatbot;
