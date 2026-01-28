
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { getMessages, saveMessage, markMessagesAsRead, getUnreadFromContact } from '../services/mockData';
import { Send, Search, Phone, Video, Info, Paperclip, Smile, MoreVertical } from 'lucide-react';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [input, setInput] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadStatus, setUnreadStatus] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Predefined Mock Contacts based on existing profiles in AuthView
  const MOCK_CONTACTS = [
    { id: 's1', name: 'Alex Rivera', role: 'STUDENT', avatar: 'https://i.pravatar.cc/150?u=s1', email: 'student@stellaris.edu' },
    { id: 'r1', name: 'Dr. Sarah Jenkins', role: 'REVIEWER', avatar: 'https://i.pravatar.cc/150?u=r1', email: 'reviewer@stellaris.edu' },
    { id: 'a1', name: 'Dean Henderson', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=a1', email: 'admin@stellaris.edu' },
  ].filter(c => c.id !== currentUser.id);

  useEffect(() => {
    if (!selectedContact) {
      setSelectedContact(MOCK_CONTACTS[0]);
    }
  }, [currentUser]);

  // Handle message loading and unread indicators
  useEffect(() => {
    const load = () => {
      // 1. Update unread indicators for all contacts
      const newStatus: Record<string, boolean> = {};
      MOCK_CONTACTS.forEach(contact => {
        newStatus[contact.id] = getUnreadFromContact(currentUser.id, contact.id);
      });
      setUnreadStatus(newStatus);

      // 2. If a contact is selected, load messages and mark as read
      if (selectedContact) {
        const msgs = getMessages(currentUser.id, selectedContact.id);
        setMessages(msgs);
        
        // Mark as read if there are unread messages from this contact
        if (getUnreadFromContact(currentUser.id, selectedContact.id)) {
          markMessagesAsRead(currentUser.id, selectedContact.id);
        }
      }
    };
    
    load();
    window.addEventListener('messagesUpdated', load);
    return () => window.removeEventListener('messagesUpdated', load);
  }, [selectedContact, currentUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedContact) return;
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      text: input,
      timestamp: new Date()
    };
    saveMessage(newMessage);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-in fade-in duration-500">
      {/* Contact List */}
      <div className="w-full sm:w-80 border-r border-slate-100 flex flex-col bg-white">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_CONTACTS.map((contact) => {
            const hasUnread = unreadStatus[contact.id];
            return (
              <div 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                  selectedContact?.id === contact.id 
                    ? 'bg-indigo-50/50 border-indigo-600' 
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={contact.avatar} className="w-11 h-11 rounded-xl object-cover shadow-sm" alt={contact.name} />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-xs truncate ${hasUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                      {contact.name}
                    </h4>
                    {hasUnread && (
                      <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shadow-sm shadow-indigo-200"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{contact.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-slate-50/30">
          {/* Header */}
          <div className="h-16 px-6 bg-white border-b border-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img src={selectedContact.avatar} className="w-9 h-9 rounded-xl shadow-sm object-cover" alt={selectedContact.name} />
              <div>
                <h4 className="text-sm font-bold text-slate-800 leading-none">{selectedContact.name}</h4>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1 italic">Active Secure Session</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"><Phone size={18} /></button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"><Video size={18} /></button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"><MoreVertical size={18} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length > 0 ? messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.senderId === currentUser.id ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs shadow-sm ${
                    m.senderId === currentUser.id 
                      ? 'bg-indigo-900 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed font-medium">{m.text}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {m.senderId === currentUser.id && (
                     <span className={`text-[8px] font-black uppercase tracking-widest ${m.read ? 'text-indigo-400' : 'text-slate-300'}`}>
                        {m.read ? 'Read' : 'Sent'}
                     </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Paperclip size={40} className="mb-2 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Start a new conversation</p>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-50">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-1.5 focus-within:bg-white focus-within:shadow-lg focus-within:border-indigo-100 transition-all">
              <button className="p-1.5 text-slate-400 hover:text-indigo-600"><Smile size={20} /></button>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Message ${selectedContact.name}...`}
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-900 py-3 font-medium"
              />
              <button className="p-1.5 text-slate-400 hover:text-indigo-600"><Paperclip size={20} /></button>
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 bg-indigo-900 text-white rounded-xl hover:bg-slate-900 transition-all shadow-md active:scale-90 disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
           <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4">
              <MoreVertical size={32} />
           </div>
           <h3 className="font-bold text-slate-900">Select a Contact</h3>
           <p className="text-xs mt-1 max-w-xs">Pick a scholar or faculty member from the list to initiate a secure encrypted discussion.</p>
        </div>
      )}
    </div>
  );
};

export default Chat;
