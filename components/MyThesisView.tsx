
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Thesis, ThesisStatus } from '../types';
import { getTheses } from '../services/mockData';
import { 
  FileText, 
  Plus, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Users,
  History,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';

interface MyThesisViewProps {
  user: User;
  searchQuery?: string;
}

const MyThesisView: React.FC<MyThesisViewProps> = ({ user, searchQuery = '' }) => {
  const navigate = useNavigate();
  const [theses, setTheses] = useState<Thesis[]>([]);

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      setTheses(all.filter(t => t.authorId === user.id));
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, [user.id]);

  const getStatusInfo = (status: ThesisStatus) => {
    switch (status) {
      case ThesisStatus.PUBLISHED: 
        return { label: 'Published', color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: <CheckCircle2 size={14} /> };
      case ThesisStatus.REVISION_REQUIRED: 
        return { label: 'Revision', color: 'text-amber-700 bg-amber-50 border-amber-100', icon: <AlertCircle size={14} /> };
      case ThesisStatus.UNDER_REVIEW: 
        return { label: 'Reviewing', color: 'text-blue-700 bg-blue-50 border-blue-100', icon: <Clock size={14} /> };
      case ThesisStatus.REJECTED: 
        return { label: 'Rejected', color: 'text-rose-700 bg-rose-50 border-rose-100', icon: <AlertCircle size={14} /> };
      default: 
        return { label: 'Pending', color: 'text-slate-700 bg-slate-50 border-slate-100', icon: <Clock size={14} /> };
    }
  };

  const filtered = theses.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scholarly Portfolio</h1>
          <p className="text-slate-500 font-medium">Manage and track your active research records.</p>
        </div>
        <button 
          onClick={() => navigate('/submit')}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-900 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} />
          <span>New Submission</span>
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((thesis) => {
            const status = getStatusInfo(thesis.status);
            return (
              <div 
                key={thesis.id} 
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center gap-6 group cursor-pointer"
                onClick={() => navigate(`/thesis/${thesis.id}`)}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-900 shrink-0 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                  <FileText size={32} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{thesis.submissionDate}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors truncate">
                    {thesis.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-slate-300" />
                      <span>{thesis.supervisorName}</span>
                    </div>
                    {thesis.coResearchers && thesis.coResearchers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-300" />
                        <span>{thesis.coResearchers.length} Collaborators</span>
                      </div>
                    )}
                    {thesis.versions && thesis.versions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <History size={16} className="text-slate-300" />
                        <span>{thesis.versions.length} versions</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8">
                  <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl">
                    <MoreVertical size={20} />
                  </button>
                  <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm group/btn">
                    <span>Manage</span>
                    <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-inner flex flex-col items-center">
          <FileSearch size={64} className="text-slate-100 mb-6" />
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your portfolio is empty</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Begin your research journey by submitting your first manuscript for institutional evaluation.
          </p>
          <button 
            onClick={() => navigate('/submit')}
            className="mt-8 px-10 py-4 bg-indigo-900 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
          >
            Start First Submission
          </button>
        </div>
      )}
    </div>
  );
};

export default MyThesisView;
