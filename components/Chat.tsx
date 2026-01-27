
import React, { useState } from 'react';
import { User, Message } from '../types';
import { Send, Search, Phone, Video, Info, Paperclip, Smile } from 'lucide-react';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [input, setInput] = useState('');
  
  const MOCK_MESSAGES: Message[] = [
    { id: '1', senderId: 's1', receiverId: 'u1', text: 'Hi Jane, I have reviewed your literature review. Good work!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '2', senderId: 'u1', receiverId: 's1', text: 'Thank you, Dr. Smith. Should I proceed with the methodology chapter now?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5) },
    { id: '3', senderId: 's1', receiverId: 'u1', text: 'Yes, but pay attention to the sampling criteria we discussed last week.', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  ];

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: 's1',
      text: input,
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Contact List */}
      <div className="w-80 border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 bg-indigo-50 border-r-4 border-indigo-600 flex items-center gap-3 cursor-pointer">
            <img src="https://picsum.photos/seed/robert/200" className="w-12 h-12 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-slate-800 truncate">Dr. Robert Smith</h4>
                <span className="text-[10px] text-slate-400 font-medium">30m ago</span>
              </div>
              <p className="text-xs text-slate-500 truncate">Yes, but pay attention to the sampling...</p>
            </div>
          </div>
          {/* Add more contacts as needed */}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="https://picsum.photos/seed/robert/200" className="w-10 h-10 rounded-full" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Dr. Robert Smith</h4>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"><Phone size={18} /></button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"><Video size={18} /></button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"><Info size={18} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  m.senderId === currentUser.id 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}
              >
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.senderId === currentUser.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
            <button className="p-1.5 text-slate-400 hover:text-indigo-600"><Paperclip size={18} /></button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 py-2 placeholder:text-slate-400"
            />
            <button className="p-1.5 text-slate-400 hover:text-indigo-600"><Smile size={18} /></button>
            <button 
              onClick={handleSend}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
