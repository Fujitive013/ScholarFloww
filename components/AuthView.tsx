
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  LogIn, 
  UserPlus, 
  BookOpen, 
  Mail, 
  Lock, 
  Loader2, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Activity,
  Award,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [regRole, setRegRole] = useState<Extract<UserRole, 'STUDENT' | 'REVIEWER'>>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Define stable mock profiles to ensure data persistence works across sessions
  const MOCK_PROFILES: Record<string, { id: string, name: string, role: UserRole }> = {
    'student@stellaris.edu': { id: 's1', name: 'Alex Rivera', role: 'STUDENT' },
    'reviewer@stellaris.edu': { id: 'r1', name: 'Dr. Sarah Jenkins', role: 'REVIEWER' },
    'admin@stellaris.edu': { id: 'a1', name: 'Dean Henderson', role: 'ADMIN' },
    'guest@stellaris.edu': { id: 'g1', name: 'Visiting Researcher', role: 'GUEST' },
  };

  const loginWithEmail = (targetEmail: string, forcedRole?: UserRole) => {
    setLoading(true);
    const cleanEmail = targetEmail.toLowerCase().trim();

    // Use a stable ID based on the email or the predefined mock profile
    const profile = MOCK_PROFILES[cleanEmail] || {
      id: `u_${cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: cleanEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      role: forcedRole || 'STUDENT'
    };

    setTimeout(() => {
      onLogin({
        ...profile,
        email: cleanEmail,
        avatar: `https://i.pravatar.cc/150?u=${profile.id}`
      });
      setLoading(false);
    }, 800);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'REGISTER') {
      loginWithEmail(email || 'new.scholar@stellaris.edu', regRole);
    } else {
      loginWithEmail(email || 'student@stellaris.edu');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-['Inter']">
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 relative items-center justify-center p-12 overflow-hidden border-r-4 border-indigo-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-900 rounded-2xl shadow-xl">
              <BookOpen size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tighter italic leading-none">Stellaris</h1>
              <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">University Portal</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-100 leading-tight">
              A Legacy of <span className="text-indigo-400">Excellence</span>.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Stellaris University scholarly terminal. Your research journey starts here.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatItem icon={<Activity size={16} />} label="Records" value="3.2K+" />
            <StatItem icon={<ShieldCheck size={16} />} label="Faculty" value="240" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center lg:text-left space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'LOGIN' ? 'Portal Access' : 'Register Account'}
            </h3>
            <p className="text-slate-500 text-xs font-medium">
              Stellaris personnel only. Identity verification required.
            </p>
          </div>

          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
            <button 
              onClick={() => setMode('LOGIN')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-indigo-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setMode('REGISTER')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'REGISTER' ? 'bg-indigo-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'REGISTER' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setRegRole('STUDENT')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${regRole === 'STUDENT' ? 'bg-indigo-50 border-indigo-900 text-indigo-900' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    <GraduationCap size={16} />
                    <span className="text-[10px] font-bold uppercase">Candidate</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRegRole('REVIEWER')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${regRole === 'REVIEWER' ? 'bg-indigo-50 border-indigo-900 text-indigo-900' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    <Award size={16} />
                    <span className="text-[10px] font-bold uppercase">Faculty</span>
                  </button>
                </div>
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                required 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-xs shadow-sm" 
                placeholder="name@stellaris.edu" 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl outline-none text-xs shadow-sm" 
                placeholder="Password" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button 
              disabled={loading}
              className="w-full py-3.5 bg-indigo-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  {mode === 'LOGIN' ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {mode === 'LOGIN' ? 'Sign In' : 'Register'}
                </>
              )}
            </button>
          </form>

          {mode === 'LOGIN' && (
            <div className="space-y-3">
              <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest text-slate-400"><span className="bg-slate-50 px-2">Institutional Profiles</span></div>
              <div className="grid grid-cols-1 gap-2">
                <ProfileQuickLink role="Student (Alex)" email="student@stellaris.edu" onClick={() => loginWithEmail('student@stellaris.edu')} />
                <ProfileQuickLink role="Faculty (Dr. Jenkins)" email="reviewer@stellaris.edu" onClick={() => loginWithEmail('reviewer@stellaris.edu')} />
                <ProfileQuickLink role="Admin (Provost)" email="admin@stellaris.edu" onClick={() => loginWithEmail('admin@stellaris.edu')} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
    <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
    </div>
    <div className="text-xl font-bold text-white">{value}</div>
  </div>
);

const ProfileQuickLink = ({ role, email, onClick }: { role: string, email: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-600 transition-all group"
  >
    <div className="text-left">
      <p className="text-[8px] font-bold uppercase text-slate-400">{role}</p>
      <p className="text-[10px] font-bold text-slate-800">{email}</p>
    </div>
    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5" />
  </button>
);

export default AuthView;
