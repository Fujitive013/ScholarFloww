
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
  Database,
  X,
  ShieldAlert
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [usage, setUsage] = useState(0);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [showNuclearModal, setShowNuclearModal] = useState(false);
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

  const executePurge = () => {
    clearAppPath();
  };

  const executeNuclear = () => {
    nuclearReset();
  };

  const usagePercent = Math.min(100, (usage / (5 * 1024 * 1024)) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stellaris Identity Profile</h1>
          <p className="text-slate-500 mt-1">Manage your university credentials and portal preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
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
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
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

          <div className="bg-indigo-900 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-100">
            <h3 className="font-bold flex items-center gap-2 mb-2"><Shield size={18} /> Stellaris Verified</h3>
            <p className="text-xs text-indigo-100 mb-4 leading-relaxed">Your account is institutionally verified by the Stellaris Office of Graduate Admissions.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20 uppercase tracking-widest">Export Academic Record</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
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

          <div className="bg-rose-50 rounded-[2.5rem] border border-rose-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-rose-100 flex items-center justify-between">
              <h3 className="font-bold text-rose-900 flex items-center gap-2"><AlertTriangle size={20} /> Data Management</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-800">Reset Vault</h4>
                  <p className="text-xs text-rose-600/70 font-medium">Wipe only ScholarFlow manuscripts and drafts.</p>
                </div>
                <button onClick={() => setShowPurgeModal(true)} className="w-full sm:w-auto px-6 py-3 bg-rose-100 text-rose-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-200 transition-all flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Reset App
                </button>
              </div>

              <div className="pt-4 border-t border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-800">Nuclear System Reset</h4>
                  <p className="text-xs text-rose-600/70 italic font-medium">Clears entire origin storage. Use only for fatal errors.</p>
                </div>
                <button onClick={() => setShowNuclearModal(true)} className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                  <AlertTriangle size={14} /> Nuclear Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modals */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden text-center animate-in zoom-in duration-300 flex flex-col">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between shrink-0">
               <h3 className="text-sm font-bold flex items-center gap-2"><ShieldAlert size={18} /> Institutional Purge</h3>
               <button onClick={() => setShowPurgeModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Trash2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Clear Manuscripts?</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed px-4">
                This will delete all locally stored manuscripts and version history. User settings will remain intact.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={executePurge} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg hover:bg-rose-700 transition-all active:scale-95">
                  Confirm Deletion
                </button>
                <button onClick={() => setShowPurgeModal(false)} className="w-full py-4 bg-white text-slate-500 border border-slate-100 rounded-2xl font-bold text-[10px] uppercase hover:bg-slate-50 transition-colors">Abort Action</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNuclearModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden text-center animate-in zoom-in duration-300 flex flex-col">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between shrink-0">
               <h3 className="text-sm font-bold flex items-center gap-2"><AlertTriangle size={18} /> Critical System Reset</h3>
               <button onClick={() => setShowNuclearModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2 animate-pulse">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight text-rose-600">Nuclear Warning</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed px-4 italic">
                This clears EVERYTHING in your browser storage for this domain. You will be signed out and all projects will be wiped.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={executeNuclear} className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg hover:bg-slate-900 transition-all active:scale-95">
                  Final System Wipe
                </button>
                <button onClick={() => setShowNuclearModal(false)} className="w-full py-4 bg-white text-slate-500 border border-slate-100 rounded-2xl font-bold text-[10px] uppercase hover:bg-slate-50 transition-colors">Cancel Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value, highlight = false }: any) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-bold ${highlight ? 'text-indigo-900' : 'text-slate-700'}`}>
      {value}
    </div>
  </div>
);

export default ProfileView;
