
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Library, UploadCloud, ShieldCheck, Settings, LogOut,
  Bell, Menu, X, Search, BookOpen, UserCheck, LayoutDashboard, Search as SearchIcon
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

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Handle automatic sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile navigation
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleRoleJump = (role: UserRole) => {
    const mockProfiles: Record<UserRole, User> = {
      STUDENT: { id: 's1', name: 'Alex Rivera', email: 'alex.rivera@stellaris.edu', role: 'STUDENT', avatar: 'https://i.pravatar.cc/150?u=alex' },
      REVIEWER: { id: 'r1', name: 'Dr. Sarah Jenkins', email: 's.jenkins@stellaris.edu', role: 'REVIEWER', avatar: 'https://i.pravatar.cc/150?u=sarah' },
      ADMIN: { id: 'a1', name: 'Dean Henderson', email: 'provost.office@stellaris.edu', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=dean' },
      GUEST: { id: 'g1', name: 'Visiting Scholar', email: 'guest@stellaris.edu', role: 'GUEST', avatar: 'https://i.pravatar.cc/150?u=guest' }
    };
    setCurrentUser(mockProfiles[role]);
  };

  if (!currentUser) {
    return <AuthView onLogin={(user) => setCurrentUser(user)} />;
  }

  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles: UserRole[] }) => {
    if (!allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-['Inter']">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop fixed, Mobile drawer */}
      <aside className={`
        fixed lg:relative z-50 h-full bg-white border-r border-slate-200 transition-all duration-500 ease-in-out flex flex-col shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 lg:w-20 -translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 h-20 flex items-center gap-3 border-b border-slate-100 shrink-0 overflow-hidden">
          <div className="bg-indigo-900 p-2.5 rounded-2xl shadow-lg shrink-0">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <div className={`flex flex-col transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <span className="font-extrabold text-lg tracking-tight text-slate-800 leading-none">ScholarFlow</span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Stellaris University</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink to="/" icon={<Library size={20} />} label="Research Library" isOpen={isSidebarOpen} />
          
          {currentUser.role === 'STUDENT' && (
            <>
              <div className={`pt-8 pb-3 px-4 ${!isSidebarOpen && 'hidden lg:block lg:text-center'}`}>
                <span className={`text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ${!isSidebarOpen && 'hidden'}`}>Scholarly Workspace</span>
                {!isSidebarOpen && <div className="h-px bg-slate-100 w-full" />}
              </div>
              <NavLink to="/my-thesis" icon={<LayoutDashboard size={20} />} label="My Portfolio" isOpen={isSidebarOpen} />
              <NavLink to="/submit" icon={<UploadCloud size={20} />} label="File Manuscript" isOpen={isSidebarOpen} />
            </>
          )}

          {currentUser.role === 'REVIEWER' && (
            <NavLink to="/review-queue" icon={<ShieldCheck size={20} />} label="Faculty Queue" isOpen={isSidebarOpen} />
          )}

          {currentUser.role === 'ADMIN' && (
            <NavLink to="/admin-approval" icon={<UserCheck size={20} />} label="Dean's Ledger" isOpen={isSidebarOpen} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <NavLink to="/profile" icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen} />
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Content Engine */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30 relative">
        {/* Navigation Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all flex items-center justify-center text-slate-600"
            >
              <Menu size={22} />
            </button>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-slate-100 rounded-2xl border border-transparent focus-within:border-indigo-100 focus-within:bg-white focus-within:ring-8 focus-within:ring-indigo-50/50 transition-all w-64 lg:w-96 group">
              <SearchIcon className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Find research, faculty, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
              <Bell size={22} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-white"></span>
            </button>
            <div className="hidden sm:block w-px h-8 bg-slate-200 mx-1"></div>
            <Link to="/profile" className="flex items-center gap-3 group px-2 py-1 rounded-2xl hover:bg-slate-50 transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{currentUser.name}</p>
                <p className="text-[10px] text-indigo-500 uppercase font-extrabold tracking-widest leading-none">Verified {currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} alt="User Profile" className="w-10 h-10 rounded-2xl border-2 border-white shadow-md group-hover:scale-110 transition-all object-cover" />
            </Link>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto h-full">
            <Routes>
              <Route path="/" element={<LibraryView searchQuery={searchQuery} />} />
              <Route path="/profile" element={<ProfileView user={currentUser} onUpdate={(u) => setCurrentUser(prev => prev ? {...prev, ...u} : null)} />} />
              <Route path="/my-thesis" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyThesisView user={currentUser} searchQuery={searchQuery} /></ProtectedRoute>} />
              <Route path="/submit" element={<ProtectedRoute allowedRoles={['STUDENT']}><SubmitThesis user={currentUser} /></ProtectedRoute>} />
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

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const NavLink = ({ to, icon, label, isOpen }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-4 rounded-2xl transition-all group relative overflow-hidden
        ${isActive 
          ? 'bg-indigo-900 text-white shadow-2xl shadow-indigo-100 font-bold' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
      `}
    >
      <div className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
        {icon}
      </div>
      <span className={`text-[13px] font-bold tracking-wide truncate transition-all duration-500 ${isOpen ? 'opacity-100 ml-0' : 'opacity-0 -ml-10 w-0'}`}>
        {label}
      </span>
      {isActive && !isOpen && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-r-full" />
      )}
    </Link>
  );
};

export default App;
