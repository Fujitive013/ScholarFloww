
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Library, UploadCloud, Clock, ShieldCheck, Settings, LogOut,
  Bell, Menu, X, Search, BookOpen, UserCheck, User as UserIcon,
  LogIn, UserPlus, Globe, UserCircle, LayoutDashboard, FileText
} from 'lucide-react';
import { User, UserRole, Thesis, ThesisStatus } from './types';
import LibraryView from './components/LibraryView';
import SubmitThesis from './components/SubmitThesis';
import MySubmissions from './components/MySubmissions';
import AdminReview from './components/AdminReview';
import AdminDashboard from './components/AdminDashboard';
import AuthView from './components/AuthView';
import ThesisDetails from './components/ThesisDetails';
import ProfileView from './components/ProfileView';
import MyThesisView from './components/MyThesisView';

// Helper component to reset navigation on user change
const NavigationGuard = ({ user }: { user: User | null }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [user?.id, user?.role]);

  return null;
};

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const savedAvatar = localStorage.getItem(`avatar_${currentUser.id}`);
      if (savedAvatar && savedAvatar !== currentUser.avatar) {
        setCurrentUser(prev => prev ? { ...prev, avatar: savedAvatar } : null);
      }
    }
  }, [currentUser?.id]);

  const updateUserProfile = (updatedUser: Partial<User>) => {
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      setCurrentUser(newUser);
      if (updatedUser.avatar) {
        localStorage.setItem(`avatar_${currentUser.id}`, updatedUser.avatar);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleRoleJump = (role: UserRole) => {
    const mockProfiles: Record<UserRole, User> = {
      STUDENT: { id: 's1', name: 'Alex Rivera', email: 'student@edu.com', role: 'STUDENT', avatar: 'https://i.pravatar.cc/150?u=alex' },
      REVIEWER: { id: 'r1', name: 'Dr. Jenkins', email: 'reviewer@edu.com', role: 'REVIEWER', avatar: 'https://i.pravatar.cc/150?u=sarah' },
      ADMIN: { id: 'a1', name: 'Dean Henderson', email: 'admin@edu.com', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=dean' },
      GUEST: { id: 'g1', name: 'Guest Explorer', email: 'guest@edu.com', role: 'GUEST', avatar: 'https://i.pravatar.cc/150?u=guest' }
    };
    setCurrentUser(mockProfiles[role]);
  };

  if (!currentUser) {
    return <AuthView onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <NavigationGuard user={currentUser} />
      
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50`}>
        <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <Link to="/" className="bg-indigo-600 p-2 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white w-6 h-6" />
          </Link>
          {isSidebarOpen && <span className="font-bold text-xl text-slate-800 tracking-tight">ScholarFlow</span>}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/" icon={<Library size={20} />} label="Public Library" isOpen={isSidebarOpen} />
          
          {currentUser.role === 'STUDENT' && (
            <>
              <div className="pt-4 pb-2 px-3">
                {isSidebarOpen && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Workspace</span>}
              </div>
              <NavLink to="/my-thesis" icon={<LayoutDashboard size={20} />} label="My Research" isOpen={isSidebarOpen} />
              <NavLink to="/submit" icon={<UploadCloud size={20} />} label="Submit New Work" isOpen={isSidebarOpen} />
            </>
          )}

          {currentUser.role === 'REVIEWER' && (
            <NavLink to="/review-queue" icon={<ShieldCheck size={20} />} label="Review Queue" isOpen={isSidebarOpen} />
          )}

          {currentUser.role === 'ADMIN' && (
            <NavLink to="/admin-approval" icon={<UserCheck size={20} />} label="Final Approvals" isOpen={isSidebarOpen} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          {currentUser.role !== 'GUEST' && (
            <div className="grid grid-cols-3 gap-1 mb-2">
              <button onClick={() => handleRoleJump('STUDENT')} className="text-[8px] p-1 bg-slate-100 rounded">STU</button>
              <button onClick={() => handleRoleJump('REVIEWER')} className="text-[8px] p-1 bg-slate-100 rounded">REV</button>
              <button onClick={() => handleRoleJump('ADMIN')} className="text-[8px] p-1 bg-slate-100 rounded">ADM</button>
            </div>
          )}
          <NavLink to="/profile" icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen} />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:flex items-center relative group">
            <Search className="absolute left-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <Link to="/profile" className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-slate-200 shadow-sm group-hover:border-indigo-400 transition-all" />
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<LibraryView searchQuery={searchQuery} />} />
            <Route path="/profile" element={<ProfileView user={currentUser} onUpdate={updateUserProfile} />} />
            <Route path="/my-thesis" element={<MyThesisView user={currentUser} />} />
            <Route path="/thesis/:id" element={<ThesisDetails />} />
            <Route path="/submit" element={<SubmitThesis user={currentUser} />} />
            <Route path="/review-queue" element={<AdminReview searchQuery={searchQuery} />} />
            <Route path="/admin-approval" element={<AdminDashboard searchQuery={searchQuery} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
        isActive 
          ? 'bg-indigo-50 text-indigo-600 font-bold' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

export default App;
