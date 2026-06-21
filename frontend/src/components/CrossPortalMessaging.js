import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Users, Send, MessageCircle } from 'lucide-react';

const CrossPortalMessaging = ({ embedded = false }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const role = localStorage.getItem('role');
  const currentUserId = parseInt(localStorage.getItem('userId') || '0');

  const fetchContacts = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/chatbot/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data || []);
      if (res.data && res.data.length > 0 && !selectedContact) {
        setSelectedContact(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  }, [selectedContact]);

  const fetchConversation = React.useCallback(async (recipientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/chatbot/conversation/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversation(res.data || []);
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (selectedContact) {
      const fetchConv = () => fetchConversation(selectedContact.id);
      fetchConv();
      const interval = setInterval(fetchConv, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedContact, fetchConversation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [conversation, selectedContact]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedContact || loading) return;

    const messageText = message;
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/chatbot/chat', {
        message: messageText,
        mode: role === 'ROLE_DOCTOR' ? 'DOCTOR' : 'PATIENT',
        recipientId: selectedContact.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(() => fetchConversation(selectedContact.id), 300);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessage(messageText);
    } finally {
      setLoading(false);
    }
  };

  const ChatWindow = (
    <div className={`bg-[#e5ddd5] ${embedded ? 'w-full h-[550px]' : 'w-[900px] h-[750px]'} rounded-xl shadow-2xl border border-gray-300 flex overflow-hidden`}>
      {/* Sidebar (WhatsApp style) */}
      <div className="w-1/3 border-r border-gray-300 bg-white flex flex-col">
        <div className="p-4 bg-[#ededed] flex items-center justify-between border-b border-gray-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
              {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="font-bold text-gray-700">Chats</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contacts.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No contacts yet</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-4 flex items-center space-x-4 border-b border-gray-100 hover:bg-[#f5f5f5] transition ${selectedContact?.id === contact.id ? 'bg-[#ebebeb]' : ''
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {contact.fullName?.charAt(0) || contact.username?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-800 text-sm truncate">{contact.fullName || contact.username}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/91/91/desktop-wallpaper-whatsapp-background-original-dark-whatsapp-patterns.jpg")', backgroundSize: '400px' }}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-3 bg-[#ededed] flex items-center justify-between border-b border-gray-300 z-10 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedContact.fullName?.charAt(0) || selectedContact.username?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">
                    {selectedContact.fullName || selectedContact.username}
                  </h3>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded">
                    {role === 'ROLE_DOCTOR' ? 'Patient' : 'Doctor'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {conversation.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 shadow-sm text-center">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-20 text-gray-600" />
                    <p className="text-sm font-medium text-gray-800">No messages yet</p>
                    <p className="text-[11px] text-gray-500">Start the conversation with {selectedContact.fullName || selectedContact.username}</p>
                  </div>
                </div>
              ) : (
                conversation.map((msg) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`relative max-w-[70%] px-4 py-2 shadow-md ${isMine
                          ? 'bg-[#dcf8c6] rounded-l-xl rounded-tr-none text-gray-800'
                          : 'bg-white rounded-r-xl rounded-tl-none text-gray-800'
                          }`}
                        style={{
                          boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)'
                        }}
                      >
                        {/* Triangle Corner 'Tail' */}
                        <div className={`absolute top-0 w-3 h-3 ${isMine
                          ? 'right-[-7px] bg-[#dcf8c6]'
                          : 'left-[-7px] bg-white'
                          }`} style={{ clipPath: isMine ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(0 0, 100% 100%, 100% 0)' }}></div>

                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          <span className="text-[9px] text-gray-500 uppercase">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && <span className="text-blue-500 text-[10px]">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#f0f0f0] border-t border-gray-300 flex items-center space-x-3">
              <div className="flex-1 bg-white rounded-full flex items-center px-4 py-1.5 border border-transparent focus-within:border-gray-200">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend(e)}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!message.trim() || loading}
                className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send size={20} className={loading ? 'animate-pulse' : ''} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center opacity-30">
              <MessageCircle size={64} className="text-gray-600" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-600 mb-1">Select a Chat</h2>
              <p className="text-sm text-gray-400">Choose a contact on the left to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return ChatWindow;
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {ChatWindow}
    </div>
  );
};

export default CrossPortalMessaging;
