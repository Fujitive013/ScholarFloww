
import React, { useState, useEffect } from 'react';
import { Thesis, ThesisStatus, Review } from '../types';
import { getTheses, updateTheses } from '../services/mockData';
import { 
  CheckCircle, 
  SearchX,
  X,
  RotateCcw,
  Ban,
  Eye,
  FileText,
  ExternalLink,
  Loader2,
  Maximize2,
  AlertTriangle
} from 'lucide-react';

const AdminReview: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const [queue, setQueue] = useState<Thesis[]>([]);
  const [reviewingThesis, setReviewingThesis] = useState<Thesis | null>(null);
  const [showManuscript, setShowManuscript] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isExternal, setIsExternal] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [recommendation, setRecommendation] = useState<'APPROVE' | 'REVISE' | 'REJECT'>('APPROVE');

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      setQueue(all.filter(t => t.status === ThesisStatus.PENDING || t.status === ThesisStatus.UNDER_REVIEW));
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, []);

  const dispatchToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    window.dispatchEvent(new CustomEvent('scholarflow-toast', { detail: { message, type } }));
  };

  useEffect(() => {
    const targetUrl = showManuscript || reviewingThesis?.fileUrl;
    if (targetUrl) {
      const isData = targetUrl.startsWith('data:');
      setIsExternal(!isData && targetUrl.startsWith('http'));

      if (isData) {
        try {
          const base64Content = targetUrl.split(',')[1];
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
          console.error("PDF generation error", e);
          setBlobUrl(targetUrl);
        }
      } else {
        setBlobUrl(targetUrl);
      }
    } else {
      setBlobUrl(null);
    }
  }, [showManuscript, reviewingThesis]);

  const openNative = () => {
    if (blobUrl) window.open(blobUrl, '_blank');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingThesis || !reviewNote) return;

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      reviewerId: 'reviewer-1',
      reviewerName: 'Dr. Expert Evaluator',
      comment: reviewNote,
      date: new Date().toLocaleDateString(),
      recommendation: recommendation
    };

    const newStatus = recommendation === 'APPROVE' ? ThesisStatus.REVIEWED : 
                     recommendation === 'REVISE' ? ThesisStatus.REVISION_REQUIRED : 
                     ThesisStatus.REJECTED;

    const all = getTheses();
    updateTheses(all.map(t => t.id === reviewingThesis.id ? { 
      ...t, 
      status: newStatus, 
      reviews: [...(t.reviews || []), newReview] 
    } : t));
    
    setReviewingThesis(null);
    setReviewNote('');
    setRecommendation('APPROVE');
    dispatchToast(`Review committed: ${recommendation}`, "success");
  };

  const filteredQueue = queue.filter(item => {
    const s = searchQuery.toLowerCase().trim();
    return !s || item.title.toLowerCase().includes(s) || item.authorName.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty Evaluation Queue</h1>
          <p className="text-slate-500 font-medium">Peer-review and validation of scholarly manuscripts.</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredQueue.length > 0 ? (
          filteredQueue.map((item) => (
            <div key={item.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all hover:shadow-md hover:border-indigo-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-indigo-100">
                     {item.department}
                   </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{item.authorName}</p>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <button 
                  onClick={() => setShowManuscript(item.fileUrl || "")} 
                  className="flex-1 sm:flex-none p-4 bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Eye size={20} /> <span className="sm:hidden font-bold text-xs">View</span>
                </button>
                <button 
                  onClick={() => setReviewingThesis(item)} 
                  className="flex-[2] sm:flex-none px-8 py-4 bg-indigo-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all whitespace-nowrap"
                >
                  Assess Record
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-inner">
            <SearchX size={48} className="mx-auto text-slate-200 mb-6" />
            <h3 className="text-xl font-bold text-slate-800">Evaluations Complete</h3>
            <p className="text-slate-400 text-sm mt-1 font-medium">The Faculty Evaluation Queue is currently cleared.</p>
          </div>
        )}
      </div>

      {showManuscript && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2"><FileText size={18} /> Evaluator Verification Terminal</h3>
              <div className="flex gap-2">
                <button onClick={openNative} className="hidden sm:flex p-2 px-4 bg-white border rounded-xl text-xs font-bold items-center gap-2 hover:bg-slate-50"><Maximize2 size={14} /> Native Reader</button>
                <button onClick={() => setShowManuscript(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-all bg-white rounded-full shadow-sm"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center">
              {isExternal ? (
                <div className="text-center p-12">
                   <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
                   <h4 className="text-lg font-bold mb-2">Institutional Embed Restricted</h4>
                   <p className="text-sm text-slate-500 mb-6">This external research source prevents embedded evaluations.</p>
                   <button onClick={openNative} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 mx-auto"><ExternalLink size={18} /> Evaluate Source Directly</button>
                </div>
              ) : blobUrl ? (
                <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-none bg-white" title="Manuscript Evaluation" />
              ) : (
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              )}
            </div>
          </div>
        </div>
      )}

      {reviewingThesis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-6xl rounded-2xl sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[95vh] sm:max-h-[95vh]">
            <div className="hidden lg:flex flex-[1.4] bg-slate-100 border-r flex-col">
              <div className="p-4 bg-white border-b flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scholarly Manuscript</span>
                <button onClick={openNative} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"><Maximize2 size={12} /> External View</button>
              </div>
              <div className="flex-1 bg-slate-50 relative overflow-hidden">
                {isExternal ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <AlertTriangle size={24} className="text-amber-500 mb-2" />
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">External Evaluate Only</p>
                    <button onClick={openNative} className="mt-4 px-6 py-3 bg-indigo-600 text-white text-[10px] font-bold rounded-xl uppercase shadow-lg">Open Native Repository</button>
                  </div>
                ) : blobUrl ? (
                  <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-none bg-white" title="Evaluation Frame" />
                ) : (
                  <div className="h-full flex items-center justify-center flex-col gap-3 text-slate-400">
                    <Loader2 className="animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Fetching Ingress Data...</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <div className="p-6 sm:p-8 border-b bg-slate-50 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">Faculty Evaluator Panel</h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">Investigator: {reviewingThesis.authorName}</p>
                </div>
                <button onClick={() => setReviewingThesis(null)}><X size={24} className="text-slate-400 hover:text-rose-500 transition-colors" /></button>
              </div>
              <form onSubmit={handleSubmitReview} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 sm:space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Evaluation Remarks</label>
                  <textarea required value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={6} placeholder="Enter your academic feedback and critique..." className="w-full p-4 sm:p-8 bg-slate-50 border rounded-2xl sm:rounded-3xl text-sm focus:bg-white transition-all shadow-inner outline-none focus:ring-4 focus:ring-indigo-50 leading-relaxed" />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Assessment Recommendation</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <DecisionBtn type="AUTH" active={recommendation==='APPROVE'} onClick={() => setRecommendation('APPROVE')} icon={<CheckCircle size={20} />} color="emerald" />
                    <DecisionBtn type="REVISE" active={recommendation==='REVISE'} onClick={() => setRecommendation('REVISE')} icon={<RotateCcw size={20} />} color="amber" />
                    <DecisionBtn type="REJECT" active={recommendation==='REJECT'} onClick={() => setRecommendation('REJECT')} icon={<Ban size={20} />} color="rose" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button type="button" onClick={() => setReviewingThesis(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-sm">Commit Evaluation</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DecisionBtn = ({ type, active, onClick, icon, color }: any) => {
  const activeStyles = {
    emerald: 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50',
    amber: 'bg-amber-50 border-amber-500 text-amber-700 ring-4 ring-amber-50',
    rose: 'bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-50'
  };

  return (
    <button type="button" onClick={onClick} className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all ${active ? activeStyles[color as keyof typeof activeStyles] : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'}`}>
      {icon}
      <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest">{type}</span>
    </button>
  );
};

export default AdminReview;
