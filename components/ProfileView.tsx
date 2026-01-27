
import React, { useState, useRef } from 'react';
import { User } from '../types';
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
  ChevronRight
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Profile</h1>
          <p className="text-slate-500 mt-1">Manage your identity and account settings on ScholarFlow.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-600 to-violet-600"></div>
            
            <div className="relative mt-4">
              <div className="relative inline-block">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover transition-transform group-hover:scale-105 duration-500"
                />
                <button 
                  onClick={triggerFileInput}
                  disabled={isUpdating}
                  className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full border-2 border-white shadow-lg hover:bg-indigo-700 transition-all active:scale-90"
                >
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-sm font-medium text-slate-500">{user.email}</p>
            </div>

            <div className="mt-6 w-full pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">12</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bookmarks</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">03</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reviews</p>
              </div>
            </div>

            {showSuccess && (
              <div className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle size={14} /> Avatar updated successfully
              </div>
            )}
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <Shield size={18} /> Verification Status
            </h3>
            <p className="text-xs text-indigo-100 mb-4 leading-relaxed">Your account is verified by the Institutional Research Office. You have full access to repository features.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20">
              Download Credentials
            </button>
          </div>
        </div>

        {/* Details & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <IdCard size={20} className="text-indigo-600" />
                Identity Details
              </h3>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <DetailItem 
                icon={<UserIcon size={18} className="text-slate-400" />} 
                label="Full Academic Name" 
                value={user.name} 
              />
              <DetailItem 
                icon={<Mail size={18} className="text-slate-400" />} 
                label="Primary Email" 
                value={user.email} 
              />
              <DetailItem 
                icon={<Briefcase size={18} className="text-slate-400" />} 
                label="Institutional Role" 
                value={user.role} 
                highlight 
              />
              <DetailItem 
                icon={<ExternalLink size={18} className="text-slate-400" />} 
                label="Member Since" 
                value="September 2022" 
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Account Preferences</h3>
            </div>
            <div className="p-4 space-y-2">
              <PreferenceToggle label="Email Notifications" description="Receive status updates for thesis submissions" defaultEnabled />
              <PreferenceToggle label="Public Profile" description="Allow other researchers to view your publications" defaultEnabled />
              <PreferenceToggle label="AI Assistance" description="Enable Gemini suggestions in the submission portal" defaultEnabled />
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 py-3 px-6 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
              Update Security
            </button>
            <button className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              Save Changes
            </button>
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
    <div className={`p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold ${highlight ? 'text-indigo-600' : 'text-slate-700'}`}>
      {value}
    </div>
  </div>
);

const PreferenceToggle = ({ label, description, defaultEnabled = false }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer">
    <div className="flex-1">
      <h4 className="text-sm font-bold text-slate-800">{label}</h4>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-all ${defaultEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${defaultEnabled ? 'left-7' : 'left-1'}`}></div>
    </div>
  </div>
);

export default ProfileView;
