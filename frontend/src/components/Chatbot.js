import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  MessageCircle,
  Send,
  X,
  Bot
} from 'lucide-react';

const Chatbot = ({ embedded = false, modeOverride }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your CKD Clinical Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const role = localStorage.getItem('role');
  const resolvedMode = modeOverride || (role === 'ROLE_DOCTOR' ? 'DOCTOR' : 'PATIENT');

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    // Also scroll when input changes (after sending)
    if (input === '') {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [input]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8080/api/chatbot/chat', {
        message: userMsg,
        mode: resolvedMode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, { text: res.data.response, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "I'm having trouble connecting to the medical brain. Please try again later.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const ChatWindow = (
    <div className={`bg-[#e5ddd5] ${embedded ? 'w-full h-[550px]' : 'w-[400px] h-[600px]'} rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden relative`}
      style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/91/91/desktop-wallpaper-whatsapp-background-original-dark-whatsapp-patterns.jpg")', backgroundSize: '400px' }}>

      {/* WhatsApp style Header */}
      <div className="bg-[#ededed] p-3 flex justify-between items-center border-b border-gray-300 z-10 shadow-sm text-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-600 rounded-full text-white">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Clinical AI Assistant</h3>
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded">
              {resolvedMode === 'DOCTOR' ? 'Doctor Mode' : 'Patient Mode'}
            </span>
          </div>
        </div>
        {!embedded && (
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Messages (WhatsApp style) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`relative max-w-[85%] px-4 py-2 shadow-md ${msg.isBot
                ? 'bg-white rounded-r-xl rounded-tl-none text-gray-800'
                : 'bg-[#dcf8c6] rounded-l-xl rounded-tr-none text-gray-800'
                }`}
              style={{
                boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)'
              }}
            >
              {/* Triangle Tail */}
              <div className={`absolute top-0 w-3 h-3 ${msg.isBot
                ? 'left-[-7px] bg-white'
                : 'right-[-7px] bg-[#dcf8c6]'
                }`} style={{ clipPath: msg.isBot ? 'polygon(0 0, 100% 100%, 100% 0)' : 'polygon(0 0, 0 100%, 100% 0)' }}></div>

              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <div className="flex items-center justify-end mt-1">
                <span className="text-[9px] text-gray-500 uppercase">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-r-xl rounded-tl-none shadow-sm flex space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Input Bar */}
      <div className="p-2 bg-[#f0f0f0] border-t border-gray-300">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <div className="flex-1 bg-white rounded-full flex items-center px-4 py-1.5 border border-transparent focus-within:border-gray-200">
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            <Send size={18} className={loading ? 'animate-pulse' : ''} />
          </button>
        </form>
        <p className="text-[9px] text-gray-500 mt-1.5 text-center uppercase tracking-tighter opacity-60">
          Educational AI • Not Medical Advice
        </p>
      </div>
    </div>
  );

  if (embedded) {
    return ChatWindow;
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white p-4 rounded-full shadow-2xl hover:bg-primary-700 transition transform hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle size={28} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-success-500 border-2 border-white"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="animate-slide-up">
          {ChatWindow}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
