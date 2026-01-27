
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
      case ThesisStatus.PENDING: return 'Ingress Pending';
      case ThesisStatus.UNDER_REVIEW: return 'Faculty Review';
      case ThesisStatus.REVIEWED: return 'Evaluation Complete';
      case ThesisStatus.PUBLISHED: return 'Institutionally Published';
      case ThesisStatus.REVISION_REQUIRED: return 'Revision Requested';
      case ThesisStatus.REJECTED: return 'Sanction Declined';
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-16 px-4 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Scholarly Portfolio</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your academic contributions and track institutional lifecycle progression.</p>
        </div>
        <button 
          onClick={() => navigate('/submit')}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-indigo-600 text-white rounded-[2rem] font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 text-base sm:text-lg"
        >
          <Plus size={24} />
          Initialize Ingress
        </button>
      </div>

      {/* Filter Navigation - Wrapped for zero horizontal scrolling */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-[2rem] text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                filter === s 
                  ? 'bg-indigo-900 text-white shadow-xl' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter === s && <CheckCircle2 size={14} className="shrink-0" />}
              <span className="whitespace-nowrap">{s === 'ALL' ? 'Total Portfolio' : getFriendlyStatus(s as ThesisStatus)}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredTheses.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10">
          {filteredTheses.map((thesis) => (
            <div key={thesis.id} className={`group bg-white rounded-3xl sm:rounded-[4rem] border p-6 sm:p-12 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative overflow-hidden ${thesis.status === ThesisStatus.REJECTED ? 'border-rose-100 bg-rose-50/10' : 'border-slate-200 hover:border-indigo-200'}`}>
              <div className="flex justify-between items-start mb-6 sm:mb-10">
                <div className={`flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${getStatusTheme(thesis.status)}`}>
                  {getFriendlyStatus(thesis.status)}
                </div>
                {(thesis.versions && thesis.versions.length > 0) ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50 text-slate-400 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-slate-100 shadow-inner">
                    <History size={14} /> {thesis.versions.length} <span className="hidden sm:inline">Versions</span>
                  </div>
                ) : null}
              </div>

              <div className="flex-1 space-y-4 sm:space-y-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                  {thesis.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-8 gap-y-3 text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-100"><ShieldCheck size={16} className="text-indigo-400" /> {thesis.supervisorName}</span>
                  {thesis.coResearchers && thesis.coResearchers.length > 0 && (
                    <span className="flex items-center gap-2 bg-emerald-50/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-emerald-100 text-emerald-600"><Users size={16} /> {thesis.coResearchers.length} <span className="hidden sm:inline">Scholars</span></span>
                  )}
                  <span className="flex items-center gap-2"><Clock size={16} /> {thesis.lastModified}</span>
                </div>

                {thesis.status === ThesisStatus.REJECTED && (
                  <div className="mt-6 sm:mt-8 p-6 sm:p-8 bg-rose-50 rounded-2xl sm:rounded-[2.5rem] border border-rose-100 text-[11px] sm:text-xs text-rose-800 italic leading-relaxed shadow-inner">
                    <span className="font-extrabold uppercase not-italic block mb-2 sm:mb-3 text-rose-600 tracking-[0.2em] text-[9px] sm:text-[10px]">Institutional Feedback:</span>
                    "{thesis.reviews?.[0]?.comment || "Formal record return dispatch pending."}"
                  </div>
                )}
              </div>

              <div className="mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-slate-100">
                {thesis.status === ThesisStatus.REJECTED ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => navigate(`/thesis/${thesis.id}`)} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-rose-600 text-white rounded-2xl sm:rounded-3xl text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95">
                      <Scale size={18} /> Formal Appeal
                    </button>
                    <button onClick={() => navigate(`/thesis/${thesis.id}`)} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl sm:rounded-3xl text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95">
                      <RotateCcw size={18} /> Draft Restoration
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
                       <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6 md:gap-8 w-full md:w-auto py-2">
                          <PhaseNode label="Ingress" status={true} icon={<Send size={14} />} />
                          <div className={`hidden sm:block w-8 sm:w-10 h-0.5 rounded-full shrink-0 ${thesis.status !== ThesisStatus.PENDING ? 'bg-indigo-600 shadow-sm' : 'bg-slate-100'}`}></div>
                          <PhaseNode label="Evaluation" status={thesis.status !== ThesisStatus.PENDING && thesis.status !== ThesisStatus.UNDER_REVIEW} active={thesis.status === ThesisStatus.UNDER_REVIEW || thesis.status === ThesisStatus.REVISION_REQUIRED || thesis.status === ThesisStatus.REVIEWED} alert={thesis.status === ThesisStatus.REVISION_REQUIRED} icon={<RefreshCw size={14} />} />
                          <div className={`hidden sm:block w-8 sm:w-10 h-0.5 rounded-full shrink-0 ${thesis.status === ThesisStatus.PUBLISHED ? 'bg-indigo-600 shadow-sm' : 'bg-slate-100'}`}></div>
                          <PhaseNode label="Sanction" status={thesis.status === ThesisStatus.PUBLISHED} icon={<Gavel size={14} />} />
                       </div>
                       <button onClick={() => navigate(`/thesis/${thesis.id}`)} className="w-full md:w-auto flex items-center justify-center gap-4 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 hover:gap-6 transition-all bg-indigo-50 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-[1.8rem] border border-indigo-100 shadow-sm whitespace-nowrap">
                         Open Record <ArrowRight size={18} />
                       </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 sm:py-40 text-center bg-white rounded-3xl sm:rounded-[5rem] border border-slate-200 shadow-inner px-4">
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-8 sm:mb-10 border border-slate-100">
            <FileSearch size={48} className="sm:size-[64px]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Portfolio Record Empty</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-4 leading-relaxed font-medium text-sm sm:text-base">No scholarly documents have been synchronized to your institutional portfolio.</p>
          <button onClick={() => navigate('/submit')} className="mt-8 sm:mt-10 px-8 py-4 sm:px-12 sm:py-5 bg-indigo-600 text-white rounded-[2rem] font-bold shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-base sm:text-lg">Initialize First Ingress</button>
        </div>
      )}
    </div>
  );
};

const PhaseNode = ({ label, status, active = false, alert = false, icon }: { label: string, status: boolean, active?: boolean, alert?: boolean, icon: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-2 sm:gap-3 shrink-0">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
      alert ? 'bg-amber-100 border-amber-500 text-amber-600 animate-pulse' :
      status ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 shadow-lg' : 
      active ? 'bg-indigo-50 border-indigo-300 text-indigo-600 ring-4 sm:ring-8 ring-indigo-50' :
      'bg-slate-50 border-slate-100 text-slate-300'
    }`}>
      {alert ? <AlertCircle size={18} className="sm:size-[20px]" /> : status ? <CheckCircle2 size={18} className="sm:size-[20px]" /> : icon}
    </div>
    <span className={`text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest ${status || active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
  </div>
);

export default MyThesisView;
