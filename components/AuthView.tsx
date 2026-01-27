
import React, { useState } from 'react';
import { User, UserRole } from '../types';
// Fixed lucide-react import to include User as UserIcon
import { LogIn, UserPlus, Globe, BookOpen, ShieldCheck, Mail, Lock, Loader2, User as UserIcon } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const loginWithEmail = (targetEmail: string) => {
    setLoading(true);
    setEmail(targetEmail);

    // Determine role based on email input for easy testing
    let role: UserRole = 'STUDENT';
    let name = 'Alex Student';
    let avatar = 'https://i.pravatar.cc/150?u=alex';

    const cleanEmail = targetEmail.toLowerCase().trim();
    if (cleanEmail === 'reviewer@edu.com') {
      role = 'REVIEWER';
      name = 'Dr. Jenkins';
      avatar = 'https://i.pravatar.cc/150?u=sarah';
    } else if (cleanEmail === 'admin@edu.com') {
      role = 'ADMIN';
      name = 'Dean Henderson';
      avatar = 'https://i.pravatar.cc/150?u=dean';
    } else if (cleanEmail === 'guest@edu.com') {
      role = 'GUEST';
      name = 'Guest Explorer';
      avatar = 'https://i.pravatar.cc/150?u=guest';
    }

    setTimeout(() => {
      onLogin({
        id: `u_${role.toLowerCase()}`,
        name: name,
        email: targetEmail,
        role: role,
        avatar: avatar
      });
      setLoading(false);
    }, 800); // Faster login for hints
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithEmail(email || 'student@edu.com');
  };

  const handleGuest = () => {
    loginWithEmail('guest@edu.com');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50 to-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl text-white mb-4 shadow-xl shadow-indigo-200">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ScholarFlow</h1>
          <p className="text-slate-500 mt-2 font-medium">The Official Thesis Repository & Submission Portal</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="flex bg-slate-50 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setMode('LOGIN')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'LOGIN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LogIn size={16} /> Login
            </button>
            <button 
              onClick={() => setMode('REGISTER')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'REGISTER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-slate-300" size={18} />
                  <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-slate-900" placeholder="John Doe" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Academic Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-300" size={18} />
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-slate-900" 
                  placeholder="student@edu.com, reviewer@edu.com, etc." 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-300" size={18} />
                <input required type="password" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-slate-900" placeholder="••••••••" />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : mode === 'LOGIN' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400"><span className="bg-white px-4">Or Discover As</span></div>
          </div>

          <button 
            onClick={handleGuest}
            disabled={loading}
            className="w-full py-3.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <Globe className="group-hover:text-indigo-600 transition-colors" size={18} />
            Browse as Guest
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 space-y-2">
          <p>Instant Access (Click to Login):</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <button 
              onClick={() => loginWithEmail('student@edu.com')}
              className="font-bold text-indigo-500 hover:text-indigo-700 hover:underline transition-colors"
            >
              student@edu.com
            </button>
            <button 
              onClick={() => loginWithEmail('reviewer@edu.com')}
              className="font-bold text-indigo-500 hover:text-indigo-700 hover:underline transition-colors"
            >
              reviewer@edu.com
            </button>
            <button 
              onClick={() => loginWithEmail('admin@edu.com')}
              className="font-bold text-indigo-500 hover:text-indigo-700 hover:underline transition-colors"
            >
              admin@edu.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
