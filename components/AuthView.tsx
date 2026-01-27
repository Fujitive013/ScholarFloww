
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  LogIn, 
  UserPlus, 
  Globe, 
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
  GraduationCap,
  Fingerprint,
  Building2,
  Link as LinkIcon
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

  const dispatchToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    window.dispatchEvent(new CustomEvent('scholarflow-toast', { detail: { message, type } }));
  };

  const loginWithEmail = (targetEmail: string, forcedRole?: UserRole) => {
    setLoading(true);
    setEmail(targetEmail);

    let role: UserRole = forcedRole || 'STUDENT';
    let name = 'Alex Rivera';
    let avatar = `https://i.pravatar.cc/150?u=${targetEmail}`;

    const cleanEmail = targetEmail.toLowerCase().trim();
    if (!forcedRole) {
      if (cleanEmail === 'reviewer@stellaris.edu') {
        role = 'REVIEWER';
        name = 'Dr. Sarah Jenkins';
      } else if (cleanEmail === 'admin@stellaris.edu') {
        role = 'ADMIN';
        name = 'Dean Henderson';
      } else if (cleanEmail === 'guest@stellaris.edu') {
        role = 'GUEST';
        name = 'Visiting Researcher';
      }
    }

    setTimeout(() => {
      onLogin({
        id: `u_${role.toLowerCase()}_${Date.now()}`,
        name: name,
        email: targetEmail,
        role: role,
        avatar: avatar
      });
      setLoading(false);
      dispatchToast(`Welcome, ${name}. Authenticated as ${role}.`, "success");
    }, 1200);
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
      {/* Left Panel: Immersive Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-20 overflow-hidden border-r-8 border-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600 rounded-full blur-[120px] animate-pulse duration-75"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-xl space-y-12">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-900 rounded-3xl shadow-2xl shadow-indigo-500/20">
              <BookOpen size={48} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-white tracking-tighter italic">Stellaris</h1>
              <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-xs mt-1">Official University Thesis Portal</p>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-slate-100 leading-tight">
              A Legacy of <span className="text-indigo-400">Institutional Excellence</span> and Rigorous Research.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              The central hub for all Stellaris University graduate candidates, faculty evaluators, and the Office of the Provost.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <StatItem icon={<Activity size={20} />} label="University Records" value="3,205" />
            <StatItem icon={<ShieldCheck size={20} />} label="Stellaris Faculty" value="240" />
            <StatItem icon={<Award size={20} />} label="Graduation Rate" value="99.4%" />
            <StatItem icon={<Globe size={20} />} label="Global Impact" value="Tier 1" />
          </div>

          <div className="pt-10 flex items-center gap-4 text-slate-500 text-sm border-t border-slate-800">
             <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-white font-bold">SU</div>
             <p className="italic font-medium">"Providing the digital backbone for our university's scholarly achievements." — Stellaris IT Services</p>
          </div>
        </div>
      </div>

      {/* Right Panel: Authentication Terminal */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-10">
          <div className="lg:hidden text-center space-y-4 mb-12">
             <div className="inline-flex p-3 bg-indigo-900 rounded-2xl text-white shadow-xl">
               <BookOpen size={32} />
             </div>
             <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stellaris ScholarFlow</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'LOGIN' ? 'University Sign In' : 'Candidate Registration'}
            </h3>
            <p className="text-slate-500 font-medium">
              {mode === 'LOGIN' 
                ? 'Authorized access for Stellaris personnel only.' 
                : 'Initiate your official research record at Stellaris University.'}
            </p>
          </div>

          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex">
            <button 
              onClick={() => setMode('LOGIN')}
              className={`flex-1 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setMode('REGISTER')}
              className={`flex-1 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${mode === 'REGISTER' ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'REGISTER' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Stellaris Identity Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setRegRole('STUDENT')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${regRole === 'STUDENT' ? 'bg-indigo-50 border-indigo-900 text-indigo-900' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <GraduationCap size={20} />
                      <span className="text-xs font-bold">Candidate</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRegRole('REVIEWER')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${regRole === 'REVIEWER' ? 'bg-indigo-50 border-indigo-900 text-indigo-900' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <Award size={20} />
                      <span className="text-xs font-bold">Faculty</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Full Scholarly Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input required className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-sm text-slate-900 shadow-sm" placeholder="e.g. Alex Rivera" />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">
                    {regRole === 'STUDENT' ? 'Stellaris Student UID' : 'Faculty Research ORCID'}
                  </label>
                  <div className="relative">
                    {regRole === 'STUDENT' ? <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} /> : <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />}
                    <input 
                      required 
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-sm text-slate-900 shadow-sm" 
                      placeholder={regRole === 'STUDENT' ? "e.g. SU-2024-001" : "https://orcid.org/..."} 
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">University Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input required className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-sm text-slate-900 shadow-sm" placeholder="e.g. Department of Astrophysics" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 group">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Stellaris Email (@stellaris.edu)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-sm text-slate-900 shadow-sm" 
                  placeholder="name@stellaris.edu" 
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Portal Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-sm text-slate-900 shadow-sm" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-extrabold text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {mode === 'LOGIN' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {mode === 'LOGIN' ? 'Authorize Portal Access' : 'Register with University'}
                </>
              )}
            </button>
          </form>

          {mode === 'LOGIN' && (
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400"><span className="bg-slate-50 px-4">Institutional Profiles</span></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <ProfileQuickLink 
                  role="Candidate Scholar" 
                  email="student@stellaris.edu" 
                  color="indigo"
                  onClick={() => loginWithEmail('student@stellaris.edu')} 
                />
                <ProfileQuickLink 
                  role="University Faculty" 
                  email="reviewer@stellaris.edu" 
                  color="amber"
                  onClick={() => loginWithEmail('reviewer@stellaris.edu')} 
                />
                <ProfileQuickLink 
                  role="Provost's Office" 
                  email="admin@stellaris.edu" 
                  color="emerald"
                  onClick={() => loginWithEmail('admin@stellaris.edu')} 
                />
              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 font-medium pt-5">
            Internal use only. Adhere to <span className="underline cursor-pointer">Stellaris Privacy Regulations</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
    <div className="flex items-center gap-2 text-indigo-400 mb-2">
      {icon}
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const ProfileQuickLink = ({ role, email, onClick, color }: { role: string, email: string, onClick: () => void, color: string }) => {
  const colorMap: Record<string, string> = {
    indigo: 'hover:border-indigo-600 hover:bg-indigo-50 text-indigo-600',
    amber: 'hover:border-amber-600 hover:bg-amber-50 text-amber-600',
    emerald: 'hover:border-emerald-600 hover:bg-emerald-50 text-emerald-600'
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group transition-all duration-300 ${colorMap[color]}`}
    >
      <div className="text-left">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-inherit transition-colors">{role}</p>
        <p className="text-xs font-bold text-slate-800">{email}</p>
      </div>
      <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
    </button>
  );
};

export default AuthView;
