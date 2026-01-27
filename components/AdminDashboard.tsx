
import React, { useState, useEffect } from 'react';
import { Thesis, ThesisStatus } from '../types';
import { getTheses, updateTheses } from '../services/mockData';
import { 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  ShieldCheck,
  Users,
  SearchX,
  Clock,
  X,
  Eye,
  ExternalLink,
  Loader2,
  Maximize2,
  AlertTriangle,
  Gavel
} from 'lucide-react';

const AdminDashboard: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const [queue, setQueue] = useState<Thesis[]>([]);
  const [viewingManuscript, setViewingManuscript] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isExternal, setIsExternal] = useState(false);

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      setQueue(all.filter(t => t.status === ThesisStatus.REVIEWED));
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, []);

  useEffect(() => {
    if (viewingManuscript) {
      const isData = viewingManuscript.startsWith('data:');
      setIsExternal(!isData && viewingManuscript.startsWith('http'));

      if (isData) {
        try {
          const base64Content = viewingManuscript.split(',')[1];
          const byteCharacters = atob(base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          return () => URL.revokeObjectURL(url);
        } catch (e) {
          console.error("PDF Decode Error", e);
          setBlobUrl(viewingManuscript);
        }
      } else {
        setBlobUrl(viewingManuscript);
      }
    } else {
      setBlobUrl(null);
    }
  }, [viewingManuscript]);

  const openNative = () => {
    if (blobUrl) window.open(blobUrl, '_blank');
  };

  const handleApprove = (id: string) => {
    const all = getTheses();
    updateTheses(all.map(t => t.id === id ? { ...t, status: ThesisStatus.PUBLISHED, publishedDate: new Date().toLocaleDateString() } : t));
    alert("Institutional Sanction Granted. Manuscript is now Public.");
  };

  const handleReject = (id: string) => {
    if (!window.confirm("Reject institutional authorization? This record will be returned to the Faculty Advisor.")) return;
    const all = getTheses();
    updateTheses(all.map(t => t.id === id ? { ...t, status: ThesisStatus.REJECTED } : t));
  };

  const filtered = queue.filter(item => {
    const s = searchQuery.toLowerCase().trim();
    return !s || item.title.toLowerCase().includes(s) || item.authorName.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 px-4 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Dean's Authorization Ledger</h1>
          <p className="text-slate-500 font-medium mt-1">Final institutional sanction for scholarly publication.</p>
        </div>
        <div className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-[9px] sm:text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
          <Gavel size={16} /> <span className="whitespace-nowrap">Gatekeeper Access</span>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-10">
        {filtered.length > 0 ? filtered.map(item => {
          const isReady = item.reviews.some(r => r.recommendation === 'APPROVE');
          return (
            <div key={item.id} className={`bg-white rounded-3xl sm:rounded-[4rem] border-2 p-6 sm:p-12 transition-all group ${isReady ? 'border-indigo-600 shadow-2xl shadow-indigo-50' : 'border-slate-100 opacity-90'}`}>
              <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-16">
                <div className="flex-1 space-y-6 sm:space-y-8 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest ${isReady ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {isReady ? 'Sanction Pending' : 'Evaluations Req.'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">{item.department} Record</span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors break-words">{item.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border text-indigo-600 shadow-inner"><Users size={18} /></div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest">Investigator</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{item.authorName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border text-indigo-600 shadow-inner"><Clock size={18} /></div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ingress</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">{item.submissionDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-slate-50">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">Evaluator Feedback</h4>
                    <div className="grid gap-4">
                      {item.reviews.map(r => (
                        <div key={r.id} className="p-6 sm:p-8 bg-slate-50 rounded-2xl sm:rounded-[3rem] border border-slate-100 hover:bg-white transition-all shadow-inner">
                          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /> {r.reviewerName}</span>
                            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-3 py-1 bg-white border border-slate-100 rounded-lg tracking-widest text-emerald-600">{r.recommendation}D</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed pl-4 border-l-2 border-slate-200">"{r.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-80 space-y-3 flex flex-col justify-center animate-in slide-in-from-right-4 shrink-0">
                  <button onClick={() => setViewingManuscript(item.fileUrl || "")} className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                    <Eye size={20} className="text-indigo-600" /> Inspect
                  </button>
                  <button disabled={!isReady} onClick={() => handleApprove(item.id)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3">
                    <UserCheck size={20} /> Grant Sanction
                  </button>
                  <button onClick={() => handleReject(item.id)} className="w-full py-4 border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-3">
                    <XCircle size={20} /> Revoke Ingress
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-24 sm:py-32 text-center bg-white rounded-3xl sm:rounded-[5rem] border border-slate-200 shadow-inner px-4">
            <CheckCircle size={56} className="mx-auto text-slate-100 mb-8" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Ledger Synchronized</h3>
            <p className="text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed font-medium text-sm sm:text-base">No scholarly records are currently awaiting Dean’s Authorization.</p>
          </div>
        )}
      </div>

      {viewingManuscript && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl sm:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2"><Gavel size={20} className="text-indigo-600" /> Authorization Panel</h3>
              <div className="flex gap-2">
                <button onClick={openNative} className="hidden sm:flex p-3 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest items-center gap-2 hover:bg-slate-50 transition-all"><Maximize2 size={16} /> Native Reader</button>
                <button onClick={() => setViewingManuscript(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-all bg-white rounded-full shadow-sm"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center relative">
              {isExternal ? (
                <div className="text-center p-10 sm:p-16 bg-white rounded-3xl sm:rounded-[3rem] shadow-xl border border-slate-100 max-w-lg mx-4">
                   <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
                   <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 tracking-tight">Embed Restricted</h4>
                   <p className="text-xs sm:text-sm text-slate-500 mb-8 leading-relaxed font-medium">The external scholarly repository restricts frame embedding for institutional gatekeepers.</p>
                   <button onClick={openNative} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-extrabold uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-100 active:scale-95 transition-all flex items-center gap-3 mx-auto"><ExternalLink size={20} /> Authorize Direct View</button>
                </div>
              ) : blobUrl ? (
                <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-none bg-white" title="Institutional Gatekeeper Reader" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-300">
                  <Loader2 className="animate-spin" size={48} />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.3em]">Processing Record...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
