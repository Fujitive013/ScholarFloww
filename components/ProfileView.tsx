
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { clearAppPath, nuclearReset, getStorageUsage } from '../services/mockData';
import { 
  Camera, 
  Mail, 
  Shield, 
  User as UserIcon, 
  CheckCircle, 
  Loader2, 
  IdCard,
  Briefcase,
  ExternalLink,
  BookMarked,
  Trash2,
  AlertTriangle,
  Database
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [usage, setUsage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsage(getStorageUsage());
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUpdating(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdate({ avatar: base64String });
        setIsUpdating(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePurge = () => {
    if (window.confirm("Delete ALL ScholarFlow manuscripts? Versions and drafts will be lost.")) {
      clearAppPath();
    }
  };

  const handleNuclear = () => {
    if (window.confirm("WARNING: This will wipe EVERYTHING in localStorage for this domain (localhost). This affects other projects you might have on this same origin. Use this only if uploads are failing even after a standard clear.")) {
      nuclearReset();
    }
  };

  const usagePercent = Math.min(100, (usage / (5 * 1024 * 1024)) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stellaris Identity Profile</h1>
          <p className="text-slate-500 mt-1">Manage your university credentials and portal preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-indigo-900 flex items-center justify-center overflow-hidden">
               <div className="opacity-10 scale-150 rotate-12"><BookMarked size={120} className="text-white" /></div>
            </div>
            
            <div className="relative mt-4">
              <div className="relative inline-block">
                <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover transition-transform group-hover:scale-105 duration-500" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isUpdating} className="absolute bottom-0 right-0 p-2.5 bg-indigo-900 text-white rounded-full border-2 border-white shadow-lg hover:bg-slate-900 transition-all active:scale-90">
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-sm font-medium text-slate-500">{user.email}</p>
            </div>

            <div className="mt-6 w-full pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <span className="flex items-center gap-1"><Database size={10} /> Vault Usage</span>
                <span>{(usage / 1024 / 1024).toFixed(1)} / 5.0 MB</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>

            {showSuccess && (
              <div className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle size={14} /> University ID Photo updated
              </div>
            )}
          </div>

          <div className="bg-indigo-900 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
            <h3 className="font-bold flex items-center gap-2 mb-2"><Shield size={18} /> Stellaris Verified</h3>
            <p className="text-xs text-indigo-100 mb-4 leading-relaxed">Your account is institutionally verified by the Stellaris Office of Graduate Admissions.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20">Export Academic Record</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><IdCard size={20} className="text-indigo-900" /> Stellaris Credentials</h3>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <DetailItem icon={<UserIcon size={18} className="text-slate-400" />} label="Full University Name" value={user.name} />
              <DetailItem icon={<Mail size={18} className="text-slate-400" />} label="Stellaris Email Address" value={user.email} />
              <DetailItem icon={<Briefcase size={18} className="text-slate-400" />} label="Institutional Role" value={`Stellaris ${user.role}`} highlight />
              <DetailItem icon={<ExternalLink size={18} className="text-slate-400" />} label="Admission Cohort" value="Fall 2022" />
            </div>
          </div>

          <div className="bg-rose-50 rounded-3xl border border-rose-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-rose-100 flex items-center justify-between">
              <h3 className="font-bold text-rose-900 flex items-center gap-2"><AlertTriangle size={20} /> Data Management</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-800">Reset Vault</h4>
                  <p className="text-xs text-rose-600/70">Wipe only ScholarFlow manuscripts.</p>
                </div>
                <button onClick={handlePurge} className="w-full sm:w-auto px-6 py-2.5 bg-rose-100 text-rose-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-200 transition-all flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Reset App
                </button>
              </div>

              <div className="pt-4 border-t border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-800">Nuclear System Reset</h4>
                  <p className="text-xs text-rose-600/70 italic">Clears entire localhost origin. Fixed "Storage Full" errors.</p>
                </div>
                <button onClick={handleNuclear} className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                  <AlertTriangle size={14} /> Nuclear Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value, highlight = false }: any) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold ${highlight ? 'text-indigo-900' : 'text-slate-700'}`}>
      {value}
    </div>
  </div>
);

export default ProfileView;
