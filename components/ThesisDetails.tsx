
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Thesis, ThesisStatus, Review, ThesisVersion } from '../types';
import { getTheses, updateTheses } from '../services/mockData';
import DocumentReaderModal from './DocumentReaderModal';
import { 
  FileText, 
  User as UserIcon, 
  Calendar, 
  ArrowLeft,
  Eye,
  X,
  ShieldCheck,
  History,
  Loader2,
  Upload,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Gavel,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { showToast } from '../App';

const ThesisDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showReader, setShowReader] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showConfirmRevision, setShowConfirmRevision] = useState(false);
  const [localThesis, setLocalThesis] = useState<Thesis | null>(null);
  
  // Revision Form State
  const [revTitle, setRevTitle] = useState('');
  const [revAbstract, setRevAbstract] = useState('');
  const [revFile, setRevFile] = useState<File | null>(null);
  const [revNote, setRevNote] = useState('');
  const [isSubmittingRev, setIsSubmittingRev] = useState(false);
  const revFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      const found = all.find(t => t.id === id);
      if (found) {
        setLocalThesis(found);
        setRevTitle(found.title);
        setRevAbstract(found.abstract);
      }
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, [id]);

  const handleRevisionSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revFile || !revNote.trim() || !revTitle.trim() || !revAbstract.trim()) {
      showToast("Please fill all revision fields.", "warning");
      return;
    }
    setShowConfirmRevision(true);
  };

  const handleFinalRevisionSubmit = async () => {
    if (!revFile || !localThesis) return;
    setIsSubmittingRev(true);

    try {
      const fileDataUrl = await (new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(new Error("File hydration failed"));
        reader.readAsDataURL(revFile);
      }));

      const newVersion: ThesisVersion = {
        id: `v${(localThesis.versions?.length || 0) + 1}_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        title: revTitle.trim(),
        abstract: revAbstract.trim(),
        fileName: revFile.name,
        fileUrl: fileDataUrl,
        changeNote: revNote
      };

      const all = getTheses();
      const updated = all.map(t => t.id === localThesis.id ? {
        ...t,
        status: ThesisStatus.UNDER_REVIEW,
        title: revTitle.trim(),
        abstract: revAbstract.trim(),
        fileUrl: fileDataUrl,
        fileName: revFile.name,
        versions: [...(t.versions || []), newVersion]
      } : t);

      updateTheses(updated);
      setIsSubmittingRev(false);
      setShowConfirmRevision(false);
      setShowRevisionForm(false);
      setRevFile(null);
      setRevNote('');
      showToast("Revision successfully committed.");
    } catch (err: any) {
      setIsSubmittingRev(false);
      console.error("Revision Submission Error:", err);
      if (err.message === 'QUOTA_FULL') {
        showToast("Storage Quota Exceeded. History pruned, try again with a smaller PDF.", "error");
      } else {
        showToast("Revision commit failed. Check PDF integrity.", "error");
      }
    }
  };

  if (!localThesis) return <div className="p-12 text-center text-slate-400">Loading record...</div>;

  const reviews = localThesis.reviews || [];
  const isPublished = localThesis.status === ThesisStatus.PUBLISHED;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Link to="/my-thesis" className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowVersions(!showVersions)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${showVersions ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            <History size={14} /> {showVersions ? 'Close History' : 'Version History'}
          </button>
        </div>
      </div>

      {localThesis.status === ThesisStatus.REVISION_REQUIRED && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3 text-amber-800">
            <div className="p-2 bg-white rounded-lg shadow-sm"><AlertCircle size={20} className="text-amber-600" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight">Institutional Requirement: Revision</p>
              <p className="text-[10px] opacity-80">Faculty or Admin has requested updates. Review remarks below to proceed.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setRevTitle(localThesis.title);
              setRevAbstract(localThesis.abstract);
              setShowRevisionForm(true);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-amber-700 transition-all shadow-md active:scale-95"
          >
            Submit Revision
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6 min-w-0">
          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 sm:p-10">
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-widest border ${
                  isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  localThesis.status === ThesisStatus.REVISION_REQUIRED ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' :
                  'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                  {localThesis.status.replace('_', ' ')}
                </span>
             </div>

             <div className="space-y-4 mb-10 max-w-full">
                <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-[0.2em]">Master Archive Record</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight pr-0 sm:pr-24 break-words">{localThesis.title}</h1>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                <InfoItem icon={<UserIcon size={16} />} label="Lead Author" value={localThesis.authorName} />
                <InfoItem icon={<ShieldCheck size={16} />} label="Supervisor" value={localThesis.supervisorName} />
                <InfoItem icon={<Calendar size={16} />} label="Archive Date" value={isPublished ? (localThesis.publishedDate || localThesis.submissionDate) : localThesis.submissionDate} />
             </div>

             <div className="mt-10 pt-8 border-t border-slate-50 flex items-center gap-4">
                <button onClick={() => setShowReader(true)} className="flex items-center gap-2 px-8 py-4 bg-indigo-900 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                  <Eye size={18} /> Open Manuscript
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full min-w-0 overflow-hidden">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-slate-50 pb-5">
                  <FileText size={18} className="text-indigo-600" /> Research Abstract
                </h3>
                <div className="flex-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
                  <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-wrap font-medium break-words w-full">
                    {localThesis.abstract}
                  </p>
                </div>
             </div>
             
             <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full min-w-0">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-slate-50 pb-5">
                  <MessageSquare size={18} className="text-indigo-600" /> Institutional Memos
                </h3>
                {isPublished ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 animate-in fade-in duration-700">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="text-slate-800 text-[11px] font-extrabold uppercase tracking-[0.2em]">Academic Sanction Granted</p>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-medium">Internal review cycle completed. This manuscript is now part of the university's permanent public archive.</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {reviews.slice().reverse().map((rev) => (
                      <div key={rev.id} className={`p-6 rounded-[2rem] border relative group overflow-hidden ${
                        rev.reviewerName.includes('Dean') ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          {rev.reviewerName.includes('Dean') ? <Gavel size={40} /> : <ShieldCheck size={40} />}
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold shadow-sm ${
                               rev.reviewerName.includes('Dean') ? 'bg-indigo-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                            }`}>
                              {rev.reviewerName.includes('Dean') ? <Gavel size={14} /> : rev.reviewerName[0]}
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-900">{rev.reviewerName}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{rev.reviewerName.includes('Dean') ? 'Dean Office' : 'Faculty Panel'}</p>
                            </div>
                          </div>
                          <span className={`text-[8px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg border shadow-sm ${
                            rev.recommendation === 'APPROVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>{rev.recommendation}</span>
                        </div>
                        <div className="bg-white/80 p-5 rounded-2xl border border-white mb-3 shadow-sm">
                           <p className="text-[11px] text-slate-700 leading-relaxed font-medium italic">"{rev.comment}"</p>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-right">{rev.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                        <Loader2 size={24} className="text-indigo-200 animate-spin" />
                    </div>
                    <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">Pending Ingress Review</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {showVersions && (
          <div className="w-full lg:w-80 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-6 space-y-4 animate-in slide-in-from-right-4 shrink-0 h-fit">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-5"><History size={18} className="text-indigo-600" /> Version History</h3>
             <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-2 custom-scrollbar">
                {localThesis.versions?.slice().reverse().map((v, i) => (
                  <div key={v.id} className="p-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] hover:border-indigo-200 transition-colors shadow-sm group">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">v{localThesis.versions!.length - i}</span>
                      <span className="text-[9px] text-slate-400 font-bold">{v.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-800 font-bold mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">{v.title}</p>
                    {v.changeNote && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                             <p className="text-[10px] text-slate-500 italic leading-relaxed line-clamp-3">"{v.changeNote}"</p>
                        </div>
                    )}
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Revision Form Modal */}
      {showRevisionForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest"><History size={18} /> Revision Panel</h3>
              <button onClick={() => setShowRevisionForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleRevisionSubmitRequest} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Updated Project Title</label>
                    <input required value={revTitle} onChange={e => setRevTitle(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Synthesized Abstract</label>
                    <textarea required rows={5} value={revAbstract} onChange={e => setRevAbstract(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none text-xs leading-relaxed" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Replacement Manuscript (PDF)</label>
                  <div onClick={() => revFileInputRef.current?.click()} className="p-12 border-2 border-dashed border-slate-100 bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-300 transition-all group hover:bg-white hover:shadow-inner">
                    <input type="file" ref={revFileInputRef} className="hidden" accept="application/pdf" onChange={(e) => setRevFile(e.target.files?.[0] || null)} />
                    <Upload size={32} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                    <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">{revFile ? revFile.name : 'Ingest Revised PDF'}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">Change Log Remark <span className="text-rose-500">*</span></label>
                  <textarea required rows={2} value={revNote} onChange={(e) => setRevNote(e.target.value)} placeholder="Addressing faculty feedback regarding..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all resize-none" />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowRevisionForm(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors active:scale-95">Discard</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95">Commit Revision</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmRevision && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden text-center animate-in zoom-in duration-300 flex flex-col">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between shrink-0">
               <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest"><HelpCircle size={18} /> Confirm Ingress</h3>
               <button onClick={() => setShowConfirmRevision(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-6">
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                <RotateCcw size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Commit Revision?</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed px-4 font-medium">
                This will officially update your master manuscript archive. Faculty and Administrators will be notified of the ingress update.
              </p>
              <div className="flex flex-col gap-2.5 pt-4">
                <button onClick={handleFinalRevisionSubmit} disabled={isSubmittingRev} className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
                  {isSubmittingRev ? <Loader2 size={16} className="animate-spin" /> : "Yes, Commit Revision"}
                </button>
                <button onClick={() => setShowConfirmRevision(false)} className="w-full py-4 bg-white text-slate-500 border border-slate-100 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors active:scale-95">Wait, Go Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Reader Modal */}
      <DocumentReaderModal 
        isOpen={showReader} 
        onClose={() => setShowReader(false)} 
        fileUrl={localThesis.fileUrl} 
        fileName={localThesis.fileName} 
        title="ScholarFlow Master Manuscript"
      />
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center gap-4 min-w-0">
    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-50 shrink-0 group-hover:text-indigo-600 transition-colors shadow-sm">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{label}</p>
      <p className="text-[12px] font-bold text-slate-800 leading-none truncate">{value}</p>
    </div>
  </div>
);

export default ThesisDetails;
