
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Library, UploadCloud, ShieldCheck, Settings, LogOut,
  Bell, Menu, X, Search, BookOpen, UserCheck, LayoutDashboard,
  CheckCircle, AlertCircle, Info, XCircle
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

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  useEffect(() => {
    const handleToastEvent = (e: any) => {
      if (e.detail) {
        addToast(e.detail.message, e.detail.type);
      }
    };
    window.addEventListener('scholarflow-toast', handleToastEvent);
    return () => window.removeEventListener('scholarflow-toast', handleToastEvent);
  }, [addToast]);

  const handleLogout = () => {
    setCurrentUser(null);
    addToast("Logged out successfully", "info");
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
    addToast(`Switched to ${role} view`, "info");
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
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-['Inter'] relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-900 p-2.5 rounded-2xl shadow-lg flex items-center justify-center shrink-0">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-800 leading-none">ScholarFlow</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Stellaris Uni</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 lg:hidden text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <NavLink to="/" icon={<Library size={20} />} label="University Repository" />
            
            {currentUser.role === 'STUDENT' && (
              <>
                <div className="pt-6 pb-2 px-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Academic Workspace</span>
                </div>
                <NavLink to="/my-thesis" icon={<LayoutDashboard size={20} />} label="My Scholarly Portfolio" />
                <NavLink to="/submit" icon={<UploadCloud size={20} />} label="File Thesis Manuscript" />
              </>
            )}

            {currentUser.role === 'REVIEWER' && (
              <NavLink to="/review-queue" icon={<ShieldCheck size={20} />} label="Faculty Review Queue" />
            )}

            {currentUser.role === 'ADMIN' && (
              <NavLink to="/admin-approval" icon={<UserCheck size={20} />} label="Dean's Sanction Ledger" />
            )}
          </nav>

          <div className="p-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl">
              {['STUDENT', 'REVIEWER', 'ADMIN'].map((role) => (
                <button 
                  key={role}
                  onClick={() => handleRoleJump(role as UserRole)} 
                  className={`flex-1 text-[8px] py-1.5 rounded-lg font-bold transition-all ${currentUser.role === role ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {role.slice(0, 3)}
                </button>
              ))}
            </div>
            <NavLink to="/profile" icon={<Settings size={20} />} label="Stellaris Profile" />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-semibold"
            >
              <LogOut size={20} />
              <span>Exit Portal</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors lg:hidden">
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
               <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Institutional Terminal</h2>
            </div>
          </div>

          <div className="flex-1 max-w-lg mx-4 sm:mx-12 flex items-center relative group">
            <Search className="absolute left-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search research records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-100 border-transparent border-2 rounded-2xl text-xs sm:text-sm focus:bg-white focus:border-indigo-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <button className="hidden sm:flex relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="hidden sm:block w-px h-8 bg-slate-100 mx-2"></div>
            <Link to="/profile" className="flex items-center gap-3 group shrink-0">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 leading-none mb-1">{currentUser.name}</p>
                <p className="text-[9px] text-indigo-500 uppercase font-extrabold tracking-widest">Stellaris {currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-white shadow-sm group-hover:scale-105 transition-all" />
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-slate-50/50">
          <Routes>
            <Route path="/" element={<LibraryView searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
            <Route path="/profile" element={<ProfileView user={currentUser} onUpdate={(u) => setCurrentUser(prev => prev ? {...prev, ...u} : null)} />} />
            <Route path="/my-thesis" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyThesisView user={currentUser} searchQuery={searchQuery} /></ProtectedRoute>} />
            <Route path="/submit" element={<ProtectedRoute allowedRoles={['STUDENT']}><SubmitThesis user={currentUser} /></ProtectedRoute>} />
            <Route path="/thesis/:id" element={<ThesisDetails />} />
            <Route path="/review-queue" element={<ProtectedRoute allowedRoles={['REVIEWER']}><AdminReview searchQuery={searchQuery} /></ProtectedRoute>} />
            <Route path="/admin-approval" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard searchQuery={searchQuery} /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-[calc(100%-2rem)] sm:w-auto">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border w-full sm:min-w-[320px] max-w-md animate-in slide-in-from-right-10 duration-300 ${
              toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-900' :
              toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-900' :
              toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' :
              'bg-white border-indigo-100 text-indigo-900'
            }`}
          >
            {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <XCircle size={20} className="text-rose-500 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle size={20} className="text-amber-500 shrink-0" />}
            {toast.type === 'info' && <Info size={20} className="text-indigo-500 shrink-0" />}
            <span className="text-sm font-bold flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
              <X size={16} className="text-slate-400" />
            </button>
          </div>
        ))}
      </div>
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

const NavLink = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
        isActive 
          ? 'bg-indigo-900 text-white shadow-md font-bold' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      <div className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>{icon}</div>
      <span className="text-sm font-semibold tracking-wide">{label}</span>
    </Link>
  );
};

export default App;
