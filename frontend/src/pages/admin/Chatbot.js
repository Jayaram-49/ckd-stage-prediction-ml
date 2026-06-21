import React from 'react';
import Chatbot from '../../components/Chatbot';

const AdminChatbot = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Administration Assistant</h1>
                <p className="text-gray-500 mt-2">Interact with the AI model for system diagnostics and queries.</p>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="bg-primary-600 p-4 text-white">
                    <h3 className="font-bold text-lg">AI Assistant (Admin Mode)</h3>
                    <p className="text-sm text-primary-100 mt-1">
                        Query system logs, user statistics, or model parameters.
                    </p>
                </div>
                <div className="p-4">
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-xs text-gray-600 font-semibold mb-1">💡 System Queries:</p>
                        <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
                            <li>"How many active users today?"</li>
                            <li>"Show me the latest error logs."</li>
                            <li>"What is the current model version?"</li>
                        </ul>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden">
                        <Chatbot embedded={true} modeOverride="ADMIN" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminChatbot;
