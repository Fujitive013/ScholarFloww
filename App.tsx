
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Library, UploadCloud, ShieldCheck, Settings, LogOut,
  Bell, Menu, X, Search, BookOpen, UserCheck, LayoutDashboard, Search as SearchIcon, Sparkles, MessageSquare
} from 'lucide-react';
import { User, UserRole } from './types';
import LibraryView from './components/LibraryView';
import SubmitThesis from './components/SubmitThesis';
import AdminReview from './components/AdminReview';
import AdminDashboard from './components/AdminDashboard';
import AuthView from './components/AuthView';
import ThesisDetails from './components/ThesisDetails';
import ProfileView from './components/ProfileView';
import MyThesisView from './components/MyThesisView';
import AIAssistant from './components/AIAssistant';
import Chat from './components/Chat';
import { getUnreadSendersCount } from './services/mockData';

const AppShell: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadSenders, setUnreadSenders] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname]);

  // Track unread messages from unique senders
  useEffect(() => {
    if (currentUser) {
      const updateUnread = () => {
        setUnreadSenders(getUnreadSendersCount(currentUser.id));
      };
      updateUnread();
      window.addEventListener('messagesUpdated', updateUnread);
      return () => window.removeEventListener('messagesUpdated', updateUnread);
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  if (!currentUser) {
    return <AuthView onLogin={(user) => setCurrentUser(user)} />;
  }

  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles: UserRole[] }) => {
    if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-['Inter']">
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:relative z-50 h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 lg:w-16 -translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 h-16 flex items-center gap-2 border-b border-slate-100 shrink-0 overflow-hidden">
          <div className="bg-indigo-900 p-2 rounded-xl shadow-md shrink-0">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <div className={`flex flex-col transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <span className="font-bold text-base tracking-tight text-slate-800 leading-none">ScholarFlow</span>
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Stellaris Uni</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink to="/" icon={<Library size={18} />} label="Library" isOpen={isSidebarOpen} />
          <NavLink 
            to="/messages" 
            icon={<MessageSquare size={18} />} 
            label="Messages" 
            isOpen={isSidebarOpen} 
            badge={unreadSenders > 0 ? unreadSenders : undefined}
          />
          
          {currentUser.role === 'STUDENT' && (
            <>
              <div className={`pt-6 pb-2 px-3 ${!isSidebarOpen && 'hidden'}`}><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Workspace</span></div>
              <NavLink to="/my-thesis" icon={<LayoutDashboard size={18} />} label="Portfolio" isOpen={isSidebarOpen} />
              <NavLink to="/submit" icon={<UploadCloud size={18} />} label="Submit" isOpen={isSidebarOpen} />
              <NavLink to="/ai-helper" icon={<Sparkles size={18} />} label="ScholarAI" isOpen={isSidebarOpen} />
            </>
          )}

          {currentUser.role === 'REVIEWER' && <NavLink to="/review-queue" icon={<ShieldCheck size={18} />} label="Queue" isOpen={isSidebarOpen} />}
          {currentUser.role === 'ADMIN' && <NavLink to="/admin-approval" icon={<UserCheck size={18} />} label="Admin" isOpen={isSidebarOpen} />}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-2">
          <NavLink to="/profile" icon={<Settings size={18} />} label="Settings" isOpen={isSidebarOpen} />
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all text-sm font-semibold ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={18} className="shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/20 relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 lg:hidden">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 bg-slate-100 rounded-xl border border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all w-64 lg:w-80 group">
              <SearchIcon className="text-slate-400 group-focus-within:text-indigo-600" size={16} />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-xs w-full font-medium" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
            <Link to="/profile" className="flex items-center gap-2.5 group px-1 py-1 rounded-xl hover:bg-slate-50 transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none group-hover:text-indigo-600">{currentUser.name}</p>
                <p className="text-[9px] text-indigo-500 uppercase font-extrabold tracking-widest">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-lg border border-white shadow-sm object-cover" />
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto h-full">
            <Routes>
              <Route path="/" element={<LibraryView searchQuery={searchQuery} />} />
              <Route path="/profile" element={<ProfileView user={currentUser} onUpdate={(u) => setCurrentUser(prev => prev ? {...prev, ...u} : null)} />} />
              <Route path="/messages" element={<Chat currentUser={currentUser} />} />
              <Route path="/my-thesis" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyThesisView user={currentUser} searchQuery={searchQuery} /></ProtectedRoute>} />
              <Route path="/submit" element={<ProtectedRoute allowedRoles={['STUDENT']}><SubmitThesis user={currentUser} /></ProtectedRoute>} />
              <Route path="/ai-helper" element={<ProtectedRoute allowedRoles={['STUDENT']}><AIAssistant /></ProtectedRoute>} />
              <Route path="/thesis/:id" element={<ThesisDetails />} />
              <Route path="/review-queue" element={<ProtectedRoute allowedRoles={['REVIEWER']}><AdminReview searchQuery={searchQuery} /></ProtectedRoute>} />
              <Route path="/admin-approval" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard searchQuery={searchQuery} /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, label, isOpen, badge }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${isActive ? 'bg-indigo-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
      <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>{icon}</div>
      <span className={`text-xs font-bold tracking-wide truncate transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>{label}</span>
      {badge !== undefined && (
        <span className={`absolute ${isOpen ? 'right-2' : 'top-1 right-1'} flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full animate-in zoom-in ring-2 ring-white shadow-sm`}>
          {badge}
        </span>
      )}
    </Link>
  );
};

const App: React.FC = () => <Router><AppShell /></Router>;
export default App;
