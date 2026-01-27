
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
  Search, 
  MoreVertical,
  ArrowRight,
  AlertCircle,
  FileSearch,
  BookOpen,
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
}

const MyThesisView: React.FC<MyThesisViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [theses, setTheses] = useState<(Thesis & { lastModified: string })[]>([]);

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      // Filter for current user's research
      const filtered = all.filter(t => t.authorId === user.id);
      setTheses(filtered.map(t => ({ ...t, lastModified: 'Institutional Sync' })));
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, [user.id]);

  const filteredTheses = theses.filter(t => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Research Portfolio</h1>
          <p className="text-slate-500 mt-1">Institutional record of your academic contributions and lifecycle status.</p>
        </div>
        <button 
          onClick={() => navigate('/submit')}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
        >
          <Plus size={20} />
          New Submission
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex p-1 bg-slate-50 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
          {['ALL', ThesisStatus.PENDING, ThesisStatus.UNDER_REVIEW, ThesisStatus.REVIEWED, ThesisStatus.REVISION_REQUIRED, ThesisStatus.REJECTED, ThesisStatus.PUBLISHED].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === s ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-3 text-slate-400" size={18} />
          <input placeholder="Search portfolio..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all" />
        </div>
      </div>

      {filteredTheses.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredTheses.map((thesis) => (
            <div key={thesis.id} className={`group bg-white rounded-[3rem] border p-10 shadow-sm hover:shadow-2xl transition-all flex flex-col h-full ${thesis.status === ThesisStatus.REJECTED ? 'border-rose-100 bg-rose-50/10' : 'border-slate-200 hover:border-indigo-200'}`}>
              <div className="flex justify-between items-start mb-8">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusTheme(thesis.status)}`}>
                  {thesis.status.replace('_', ' ')}
                </div>
                {(thesis.versions && thesis.versions.length > 0) ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-100 shadow-inner">
                    <History size={12} /> {thesis.versions.length + 1} Versions
                  </div>
                ) : null}
              </div>

              <div className="flex-1 space-y-5">
                <h3 className="text-2xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                  {thesis.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"><ShieldCheck size={16} className="text-indigo-400" /> {thesis.supervisorName}</span>
                  {thesis.coResearchers && thesis.coResearchers.length > 0 && (
                    <span className="flex items-center gap-2 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100 text-emerald-600"><Users size={16} /> {thesis.coResearchers.length} Collaborators</span>
                  )}
                  <span className="flex items-center gap-2"><Clock size={16} /> {thesis.lastModified}</span>
                </div>

                {thesis.status === ThesisStatus.REJECTED && (
                  <div className="mt-6 p-6 bg-rose-50 rounded-3xl border border-rose-100 text-xs text-rose-800 italic leading-relaxed shadow-inner">
                    <span className="font-bold uppercase not-italic block mb-2 text-rose-600 tracking-widest">Administrative Feedback:</span>
                    "{thesis.reviews[0]?.comment || "Decision details pending institutional dispatch."}"
                  </div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                {thesis.status === ThesisStatus.REJECTED ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => navigate(`/thesis/${thesis.id}`)} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-rose-600 text-white rounded-2xl text-xs font-bold hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95">
                      <Scale size={18} /> File Formal Appeal
                    </button>
                    <button onClick={() => navigate(`/thesis/${thesis.id}`)} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold hover:bg-rose-50 transition-all active:scale-95">
                      <RotateCcw size={18} /> Reset Project Draft
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between w-full">
                       <div className="flex items-center justify-between gap-8">
                          <PhaseNode label="Submitted" status={true} icon={<Send size={14} />} />
                          <div className={`w-12 h-0.5 rounded-full ${thesis.status !== ThesisStatus.PENDING ? 'bg-indigo-600 shadow-sm' : 'bg-slate-100'}`}></div>
                          <PhaseNode label="Review" status={thesis.status !== ThesisStatus.PENDING && thesis.status !== ThesisStatus.UNDER_REVIEW} active={thesis.status === ThesisStatus.UNDER_REVIEW || thesis.status === ThesisStatus.REVISION_REQUIRED || thesis.status === ThesisStatus.REVIEWED} alert={thesis.status === ThesisStatus.REVISION_REQUIRED} icon={<RefreshCw size={14} />} />
                          <div className={`w-12 h-0.5 rounded-full ${thesis.status === ThesisStatus.PUBLISHED ? 'bg-indigo-600 shadow-sm' : 'bg-slate-100'}`}></div>
                          <PhaseNode label="Final" status={thesis.status === ThesisStatus.PUBLISHED} icon={<Gavel size={14} />} />
                       </div>
                       <button onClick={() => navigate(`/thesis/${thesis.id}`)} className="flex items-center gap-3 text-xs font-bold text-indigo-600 hover:gap-5 transition-all bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
                         View Details <ArrowRight size={16} />
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[4rem] border border-slate-200 shadow-inner">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-8">
            <FileSearch size={56} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Project Record Empty</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-3 leading-relaxed">No research documents currently exist in your institutional portfolio.</p>
          <button onClick={() => navigate('/submit')} className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Submit Your First Draft</button>
        </div>
      )}
    </div>
  );
};

const PhaseNode = ({ label, status, active = false, alert = false, icon }: { label: string, status: boolean, active?: boolean, alert?: boolean, icon: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
      alert ? 'bg-amber-100 border-amber-500 text-amber-600 animate-pulse' :
      status ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 shadow-lg' : 
      active ? 'bg-indigo-50 border-indigo-300 text-indigo-600 ring-4 ring-indigo-50' :
      'bg-slate-50 border-slate-100 text-slate-300'
    }`}>
      {alert ? <AlertCircle size={16} /> : status ? <CheckCircle2 size={16} /> : icon}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-widest ${status || active ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
  </div>
);

export default MyThesisView;
