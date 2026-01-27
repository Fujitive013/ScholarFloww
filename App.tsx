
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Library, UploadCloud, ShieldCheck, Settings, LogOut,
  Bell, Menu, X, Search, BookOpen, UserCheck, LayoutDashboard
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
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  // Helper component for role-based route protection
  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles: UserRole[] }) => {
    if (!allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-['Inter']">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50 shadow-sm`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-indigo-900 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center shrink-0">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-800 leading-none">ScholarFlow</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Stellaris University</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <NavLink to="/" icon={<Library size={20} />} label="University Repository" isOpen={isSidebarOpen} />
          
          {currentUser.role === 'STUDENT' && (
            <>
              <div className="pt-6 pb-2 px-3">
                {isSidebarOpen && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Academic Workspace</span>}
              </div>
              <NavLink to="/my-thesis" icon={<LayoutDashboard size={20} />} label="My Scholarly Portfolio" isOpen={isSidebarOpen} />
              <NavLink to="/submit" icon={<UploadCloud size={20} />} label="File Thesis Manuscript" isOpen={isSidebarOpen} />
            </>
          )}

          {currentUser.role === 'REVIEWER' && (
            <NavLink to="/review-queue" icon={<ShieldCheck size={20} />} label="Faculty Review Queue" isOpen={isSidebarOpen} />
          )}

          {currentUser.role === 'ADMIN' && (
            <NavLink to="/admin-approval" icon={<UserCheck size={20} />} label="Dean's Sanction Ledger" isOpen={isSidebarOpen} />
          )}
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl">
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
          <NavLink to="/profile" icon={<Settings size={20} />} label="Stellaris Profile" isOpen={isSidebarOpen} />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-semibold"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Exit Portal</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="hidden md:block text-sm font-bold text-slate-400 uppercase tracking-widest ml-4 italic">Official University Thesis Terminal</h2>
          </div>

          <div className="flex-1 max-w-lg mx-12 hidden md:flex items-center relative group">
            <Search className="absolute left-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search Stellaris research records, faculty, or departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-100 border-transparent border-2 rounded-2xl text-sm focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="w-px h-8 bg-slate-100 mx-2"></div>
            <Link to="/profile" className="flex items-center gap-4 group">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-none mb-1">{currentUser.name}</p>
                <p className="text-[10px] text-indigo-500 uppercase font-extrabold tracking-widest">{currentUser.role === 'ADMIN' ? 'Dean of Studies' : `Stellaris ${currentUser.role}`}</p>
              </div>
              <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-2xl border-2 border-white shadow-md group-hover:scale-105 transition-all" />
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
          <Routes>
            <Route path="/" element={<LibraryView searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
            <Route path="/profile" element={<ProfileView user={currentUser} onUpdate={(u) => setCurrentUser(prev => prev ? {...prev, ...u} : null)} />} />
            
            {/* Student Protected Routes */}
            <Route path="/my-thesis" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyThesisView user={currentUser} searchQuery={searchQuery} />
              </ProtectedRoute>
            } />
            <Route path="/submit" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <SubmitThesis user={currentUser} />
              </ProtectedRoute>
            } />

            <Route path="/thesis/:id" element={<ThesisDetails />} />
            
            {/* Reviewer Protected Routes */}
            <Route path="/review-queue" element={
              <ProtectedRoute allowedRoles={['REVIEWER']}>
                <AdminReview searchQuery={searchQuery} />
              </ProtectedRoute>
            } />

            {/* Admin Protected Routes */}
            <Route path="/admin-approval" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard searchQuery={searchQuery} />
              </ProtectedRoute>
            } />

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
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
        isActive 
          ? 'bg-indigo-900 text-white shadow-xl shadow-indigo-100 font-bold' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      <div className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>{icon}</div>
      {isOpen && <span className="text-[13px] font-semibold tracking-wide">{label}</span>}
    </Link>
  );
};

export default App;
