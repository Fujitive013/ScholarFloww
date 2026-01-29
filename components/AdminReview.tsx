
import React, { useState, useEffect } from 'react';
import { Thesis, ThesisStatus, Review } from '../types';
import { getTheses, updateTheses } from '../services/mockData';
import DocumentReaderModal from './DocumentReaderModal';
import { 
  CheckCircle, 
  SearchX,
  X,
  RotateCcw,
  Ban,
  Eye,
  FileText,
  Loader2,
  HelpCircle,
  ShieldCheck,
  History,
  ExternalLink
} from 'lucide-react';
import { showToast } from '../App';

const AdminReview: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const [queue, setQueue] = useState<Thesis[]>([]);
  const [reviewingThesis, setReviewingThesis] = useState<Thesis | null>(null);
  const [showManuscript, setShowManuscript] = useState<string | null>(null);
  const [showConfirmAction, setShowConfirmAction] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [recommendation, setRecommendation] = useState<'APPROVE' | 'REVISE' | 'REJECT'>('APPROVE');
  const [evalBlobUrl, setEvalBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      setQueue(all.filter(t => t.status === ThesisStatus.PENDING || t.status === ThesisStatus.UNDER_REVIEW));
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, []);

  // Handle Blob conversion for the evaluation side-pane
  useEffect(() => {
    if (reviewingThesis?.fileUrl) {
      const url = reviewingThesis.fileUrl;
      if (url.startsWith('data:')) {
        try {
          const base64Content = url.split(',')[1];
          const byteCharacters = atob(base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const objectUrl = URL.createObjectURL(blob);
          setEvalBlobUrl(objectUrl);
          return () => URL.revokeObjectURL(objectUrl);
        } catch (e) {
          setEvalBlobUrl(url);
        }
      } else {
        setEvalBlobUrl(url);
      }
    } else {
      setEvalBlobUrl(null);
    }
  }, [reviewingThesis]);

  const handleFinalCommit = () => {
    if (!reviewingThesis) return;
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
    updateTheses(all.map(t => t.id === reviewingThesis.id ? { ...t, status: newStatus, reviews: [...(t.reviews || []), newReview] } : t));
    setReviewingThesis(null); setReviewNote(''); setRecommendation('APPROVE'); setShowConfirmAction(false);
    showToast(`Evaluation committed: ${recommendation}`);
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
            <div key={item.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all hover:shadow-md hover:border-indigo-100">
              <div className="flex-1 min-w-0">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-indigo-100 mb-2 inline-block">{item.department}</span>
                <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{item.authorName}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <button onClick={() => setShowManuscript(item.fileUrl || "")} className="p-4 bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-2xl transition-all shadow-sm active:scale-95"><Eye size={20} /></button>
                <button onClick={() => setReviewingThesis(item)} className="px-8 py-4 bg-indigo-600 text-white text-xs font-bold rounded-2xl shadow-lg active:scale-95 transition-all">Assess Record</button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-inner"><SearchX size={48} className="mx-auto text-slate-200 mb-6" /><h3 className="text-xl font-bold text-slate-800">Evaluations Complete</h3></div>
        )}
      </div>

      {/* Evaluation Interface Modal */}
      {reviewingThesis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[95vh] animate-in zoom-in duration-300">
            <div className="hidden lg:flex flex-[1.4] bg-slate-100 border-r border-slate-200 flex-col">
              <div className="p-4 bg-indigo-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Evidence Repository</span>
                  </div>
                  <div className="w-px h-6 bg-white/20 mx-2"></div>
                  <button 
                    onClick={() => evalBlobUrl && window.open(evalBlobUrl, '_blank')}
                    className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all active:scale-95"
                  >
                    <ExternalLink size={12} /> Native Viewer
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-50 relative overflow-hidden">
                <iframe src={evalBlobUrl || reviewingThesis.fileUrl} className="w-full h-full border-none bg-white" title="Evaluation Frame" />
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <div className="p-6 sm:p-8 bg-indigo-900 text-white flex items-center justify-between shrink-0 shadow-lg">
                <div><h3 className="text-lg font-bold tracking-tight">Faculty Evaluator Panel</h3><p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Investigator: {reviewingThesis.authorName}</p></div>
                <button onClick={() => setReviewingThesis(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"><X size={24} /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); setShowConfirmAction(true); }} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
                {reviewingThesis.status === ThesisStatus.UNDER_REVIEW && reviewingThesis.versions && reviewingThesis.versions.length > 0 && (
                   <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl animate-in slide-in-from-top-4">
                     <div className="flex items-center gap-2 mb-2 text-amber-700">
                       <History size={16} />
                       <p className="text-[10px] font-bold uppercase tracking-widest">Candidate Change Note (Revision v{reviewingThesis.versions.length})</p>
                     </div>
                     <p className="text-[11px] text-amber-900 italic font-medium leading-relaxed whitespace-pre-wrap">
                       "{reviewingThesis.versions[reviewingThesis.versions.length - 1].changeNote}"
                     </p>
                   </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Evaluation Remarks</label>
                  <textarea required value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={6} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm focus:bg-white outline-none focus:ring-4 focus:ring-indigo-50 leading-relaxed font-medium" placeholder="Synthesize findings and specific feedback for the candidate..." />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Assessment Recommendation</label>
                  <div className="grid grid-cols-3 gap-3">
                    <DecisionBtn active={recommendation==='APPROVE'} onClick={() => setRecommendation('APPROVE')} icon={<CheckCircle size={20} />} label="APPROVE" color="emerald" />
                    <DecisionBtn active={recommendation==='REVISE'} onClick={() => setRecommendation('REVISE')} icon={<RotateCcw size={20} />} label="REVISE" color="amber" />
                    <DecisionBtn active={recommendation==='REJECT'} onClick={() => setRecommendation('REJECT')} icon={<Ban size={20} />} label="REJECT" color="rose" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-50">
                  <button type="button" onClick={() => setReviewingThesis(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-[10px] uppercase">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-indigo-900 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 text-[10px] uppercase tracking-wider active:scale-95 transition-all">Commit Evaluation</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showConfirmAction && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden text-center animate-in zoom-in duration-300 flex flex-col">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between shrink-0"><h3 className="text-sm font-bold flex items-center gap-2"><ShieldCheck size={18} /> Confirm Evaluation</h3><button onClick={() => setShowConfirmAction(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"><X size={20} /></button></div>
            <div className="p-8 space-y-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 ${recommendation === 'APPROVE' ? 'bg-emerald-50 text-emerald-600' : recommendation === 'REVISE' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}><HelpCircle size={32} /></div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Commit Action?</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed px-4">Are you sure you want to commit a <span className="font-bold">{recommendation}</span> decision? This will be permanently logged.</p>
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={handleFinalCommit} className={`w-full py-4 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg transition-all active:scale-95 ${recommendation === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : recommendation === 'REVISE' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'}`}>Yes, Commit {recommendation}</button>
                <button onClick={() => setShowConfirmAction(false)} className="w-full py-4 bg-white text-slate-500 border border-slate-100 rounded-2xl font-bold text-[10px] uppercase active:scale-95">Review Remarks</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Use the shared Reader Modal */}
      <DocumentReaderModal 
        isOpen={!!showManuscript} 
        onClose={() => setShowManuscript(null)} 
        fileUrl={showManuscript || undefined} 
        title="Verification Terminal"
      />
    </div>
  );
};

const DecisionBtn = ({ active, onClick, icon, label, color }: any) => {
  const activeStyles = {
    emerald: 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50 shadow-sm',
    amber: 'bg-amber-50 border-amber-500 text-amber-700 ring-4 ring-amber-50 shadow-sm',
    rose: 'bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-50 shadow-sm'
  };
  return (
    <button type="button" onClick={onClick} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${active ? activeStyles[color as keyof typeof activeStyles] : 'bg-white border-slate-100 text-slate-300'}`}>
      {icon}
      <span className="text-[9px] font-extrabold uppercase tracking-widest">{label}</span>
    </button>
  );
};

export default AdminReview;
