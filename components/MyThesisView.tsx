
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
        return { label: 'Published', color: 'text-emerald-700 bg-emerald-50 border-emerald-50', icon: <CheckCircle2 size={12} /> };
      case ThesisStatus.REVISION_REQUIRED: 
        return { label: 'Revision', color: 'text-amber-700 bg-amber-50 border-amber-50', icon: <AlertCircle size={12} /> };
      case ThesisStatus.UNDER_REVIEW: 
        return { label: 'Reviewing', color: 'text-blue-700 bg-blue-50 border-blue-50', icon: <Clock size={12} /> };
      case ThesisStatus.REJECTED: 
        return { label: 'Rejected', color: 'text-rose-700 bg-rose-50 border-rose-50', icon: <AlertCircle size={12} /> };
      default: 
        return { label: 'Pending', color: 'text-slate-700 bg-slate-50 border-slate-50', icon: <Clock size={12} /> };
    }
  };

  const filtered = theses.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Scholarly Portfolio</h1>
          <p className="text-slate-500 text-xs">Track active research records.</p>
        </div>
        <button 
          onClick={() => navigate('/submit')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-900 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-slate-900 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} />
          <span>New Submission</span>
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((thesis) => {
            const status = getStatusInfo(thesis.status);
            return (
              <div 
                key={thesis.id} 
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-4 group cursor-pointer"
                onClick={() => navigate(`/thesis/${thesis.id}`)}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-900 shrink-0 border border-slate-50 group-hover:bg-indigo-50 transition-colors">
                  <FileText size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{thesis.submissionDate}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 truncate">
                    {thesis.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-slate-300" />
                      <span>{thesis.supervisorName}</span>
                    </div>
                    {thesis.versions && thesis.versions.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <History size={14} className="text-slate-300" />
                        <span>{thesis.versions.length} vers.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-5">
                  <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg">
                    <MoreVertical size={16} />
                  </button>
                  <button className="flex items-center gap-1 text-indigo-600 font-bold text-xs group/btn">
                    <span>Manage</span>
                    <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-inner flex flex-col items-center">
          <FileSearch size={40} className="text-slate-100 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Portfolio Empty</h3>
          <p className="text-slate-500 mt-1 text-xs max-w-xs mx-auto">
            Submit your first manuscript.
          </p>
          <button 
            onClick={() => navigate('/submit')}
            className="mt-6 px-8 py-3 bg-indigo-900 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-xs"
          >
            Start Submission
          </button>
        </div>
      )}
    </div>
  );
};

export default MyThesisView;
