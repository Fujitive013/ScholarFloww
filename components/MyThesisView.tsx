
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Thesis, ThesisStatus } from '../types';
import { getTheses } from '../services/mockData';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  ArrowRight,
  AlertCircle,
  FileSearch,
  RefreshCw,
  Send,
  Gavel,
  Scale,
  RotateCcw,
  Users,
  History
} from 'lucide-react';

interface MyThesisViewProps {
  user: User;
  searchQuery?: string;
}

const MyThesisView: React.FC<MyThesisViewProps> = ({ user, searchQuery = '' }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  const [theses, setTheses] = useState<(Thesis & { lastModified: string })[]>([]);

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      const filtered = all.filter(t => t.authorId === user.id);
      setTheses(filtered.map(t => ({ ...t, lastModified: 'Institutional Sync' })));
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, [user.id]);

  const filteredTheses = theses.filter(t => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusTheme = (status: ThesisStatus) => {
    switch (status) {
      case ThesisStatus.PUBLISHED: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case ThesisStatus.REVISION_REQUIRED: return 'text-amber-600 bg-amber-50 border-amber-100';
      case ThesisStatus.UNDER_REVIEW: return 'text-blue-600 bg-blue-50 border-blue-100';
      case ThesisStatus.REJECTED: return 'text-rose-600 bg-rose-50 border-rose-100';
      case ThesisStatus.REVIEWED: return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getFriendlyStatus = (status: ThesisStatus) => {
    switch (status) {
      case ThesisStatus.PENDING: return 'Pending';
      case ThesisStatus.UNDER_REVIEW: return 'Review';
      case ThesisStatus.REVIEWED: return 'Evaluated';
      case ThesisStatus.PUBLISHED: return 'Published';
      case ThesisStatus.REVISION_REQUIRED: return 'Revision';
      case ThesisStatus.REJECTED: return 'Declined';
      default: return status;
    }
  };

  const STATUS_FILTERS = [
    'ALL', 
    ThesisStatus.PENDING, 
    ThesisStatus.UNDER_REVIEW, 
    ThesisStatus.REVIEWED, 
    ThesisStatus.REVISION_REQUIRED, 
    ThesisStatus.REJECTED, 
    ThesisStatus.PUBLISHED
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-16 px-0 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Scholarly Portfolio</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your academic contributions and track institutional lifecycle.</p>
        </div>
        <button 
          onClick={() => navigate('/submit')}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 text-base"
        >
          <Plus size={20} />
          Initialize Ingress
        </button>
      </div>

      {/* Responsive Filter Navigation */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4">
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 sm:px-0 sm:flex-wrap">
          <div className="flex bg-white p-1.5 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm min-w-max sm:min-w-0 sm:w-full">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-[2rem] text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none whitespace-nowrap ${
                  filter === s 
                    ? 'bg-indigo-900 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter === s && <CheckCircle2 size={14} className="shrink-0" />}
                <span>{s === 'ALL' ? 'Total' : getFriendlyStatus(s as ThesisStatus)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTheses.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-4 sm:px-0">
          {filteredTheses.map((thesis) => (
            <div key={thesis.id} className={`group bg-white rounded-3xl border p-6 sm:p-10 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative overflow-hidden ${thesis.status === ThesisStatus.REJECTED ? 'border-rose-100 bg-rose-50/10' : 'border-slate-200 hover:border-indigo-200'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${getStatusTheme(thesis.status)}`}>
                  {getFriendlyStatus(thesis.status)}
                </div>
                {(thesis.versions && thesis.versions.length > 0) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                    <History size={14} /> {thesis.versions.length}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                  {thesis.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-3 text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"><ShieldCheck size={14} className="text-indigo-400" /> {thesis.supervisorName}</span>
                  {thesis.coResearchers && thesis.coResearchers.length > 0 && (
                    <span className="flex items-center gap-2 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100 text-emerald-600"><Users size={14} /> {thesis.coResearchers.length}</span>
                  )}
                  <span className="flex items-center gap-2"><Clock size={14} /> {thesis.submissionDate}</span>
                </div>

                {thesis.status === ThesisStatus.REJECTED && (
                  <div className="mt-4 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-[11px] text-rose-800 italic leading-relaxed">
                    <span className="font-extrabold uppercase not-italic block mb-1 text-rose-600 tracking-wider text-[9px]">Advisor Note:</span>
                    "{thesis.reviews?.[0]?.comment || "Formal record return pending."}"
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                {thesis.status === ThesisStatus.REJECTED ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => navigate(`/thesis/${thesis.id}`)} className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 bg-rose-600 text-white rounded-2xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-95">
                      <Scale size={16} /> Formal Appeal
                    </button>
                    <button onClick={() => navigate(`/thesis/${thesis.id}`)} className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-rose-200 text-rose-600 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95">
                      <RotateCcw size={16} /> Draft Restoration
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                       <div className="flex justify-center sm:justify-start items-center gap-4 w-full md:w-auto">
                          <PhaseNode label="Ingress" status={true} icon={<Send size={14} />} />
                          <div className={`w-8 h-0.5 rounded-full ${thesis.status !== ThesisStatus.PENDING ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                          <PhaseNode label="Review" status={thesis.status !== ThesisStatus.PENDING && thesis.status !== ThesisStatus.UNDER_REVIEW} active={thesis.status === ThesisStatus.UNDER_REVIEW || thesis.status === ThesisStatus.REVISION_REQUIRED || thesis.status === ThesisStatus.REVIEWED} alert={thesis.status === ThesisStatus.REVISION_REQUIRED} icon={<RefreshCw size={14} />} />
                          <div className={`w-8 h-0.5 rounded-full ${thesis.status === ThesisStatus.PUBLISHED ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                          <PhaseNode label="Sanction" status={thesis.status === ThesisStatus.PUBLISHED} icon={<Gavel size={14} />} />
                       </div>
                       <button onClick={() => navigate(`/thesis/${thesis.id}`)} className="w-full md:w-auto flex items-center justify-center gap-3 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 hover:gap-4 transition-all bg-indigo-50 px-6 py-3.5 rounded-2xl border border-indigo-100 whitespace-nowrap">
                         Open Record <ArrowRight size={16} />
                       </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-inner mx-4 sm:mx-0">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-8 border border-slate-100">
            <FileSearch size={40} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Portfolio Empty</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed font-medium text-sm">No documents have been indexed to your scholarly portfolio.</p>
          <button onClick={() => navigate('/submit')} className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-[1.8rem] font-bold shadow-xl hover:bg-indigo-700 transition-all active:scale-95 text-sm">Initialize Ingress</button>
        </div>
      )}
    </div>
  );
};

const PhaseNode = ({ label, status, active = false, alert = false, icon }: { label: string, status: boolean, active?: boolean, alert?: boolean, icon: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
      alert ? 'bg-amber-100 border-amber-500 text-amber-600 animate-pulse' :
      status ? 'bg-indigo-600 border-indigo-600 text-white' : 
      active ? 'bg-indigo-50 border-indigo-300 text-indigo-600 ring-4 ring-indigo-50' :
      'bg-slate-50 border-slate-100 text-slate-300'
    }`}>
      {alert ? <AlertCircle size={16} /> : status ? <CheckCircle2 size={16} /> : icon}
    </div>
    <span className={`text-[8px] font-extrabold uppercase tracking-wider ${status || active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
  </div>
);

export default MyThesisView;
