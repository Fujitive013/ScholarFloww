
import React, { useState, useEffect } from 'react';
import { Thesis, ThesisStatus, Review } from '../types';
import { getTheses, updateTheses } from '../services/mockData';
import { 
  CheckCircle, 
  Clock,
  ShieldCheck,
  SearchX,
  X,
  RotateCcw,
  Ban,
  Filter,
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
      reviewerName: 'Dr. Expert Reviewer',
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
  };

  const filteredQueue = queue.filter(item => {
    const s = searchQuery.toLowerCase().trim();
    return !s || item.title.toLowerCase().includes(s) || item.authorName.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Review Workload</h1>
          <p className="text-slate-500">Expert peer-review queue for institutional validation.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {filteredQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Research Document</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Manuscript</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.title}</td>
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => setShowManuscript(item.fileUrl || "")} className="p-2.5 bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                         <Eye size={18} />
                       </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setReviewingThesis(item)} className="px-5 py-2.5 bg-indigo-600 text-white text-[11px] font-bold rounded-xl shadow-lg active:scale-95">
                        Start Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <SearchX size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Queue Cleared</h3>
          </div>
        )}
      </div>

      {showManuscript && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><FileText size={18} /> Reviewer Verification</h3>
              <div className="flex gap-2">
                <button onClick={openNative} className="p-2 px-4 bg-white border rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Maximize2 size={14} /> Fullscreen Bypass</button>
                <button onClick={() => setShowManuscript(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-all bg-white rounded-full shadow-sm"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center">
              {isExternal ? (
                <div className="text-center p-12">
                   <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
                   <h4 className="text-lg font-bold mb-2">Embed Blocked by Provider</h4>
                   <p className="text-sm text-slate-500 mb-6">This external research source prevents embedded frames.</p>
                   <button onClick={openNative} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 mx-auto"><ExternalLink size={18} /> View Native Source</button>
                </div>
              ) : blobUrl ? (
                <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-none bg-white" title="Manuscript" />
              ) : (
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              )}
            </div>
          </div>
        </div>
      )}

      {reviewingThesis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]">
            <div className="hidden lg:flex flex-[1.2] bg-slate-100 border-r flex-col">
              <div className="p-4 bg-white border-b flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manuscript</span>
                <button onClick={openNative} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"><Maximize2 size={12} /> Fullscreen</button>
              </div>
              <div className="flex-1 bg-slate-50 relative overflow-hidden">
                {isExternal ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <AlertTriangle size={24} className="text-amber-500 mb-2" />
                    <p className="text-xs font-bold text-slate-800">External View Only</p>
                    <button onClick={openNative} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase">Open Source</button>
                  </div>
                ) : blobUrl ? (
                  <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-none bg-white" title="Review Frame" />
                ) : (
                  <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Expert Panel</h3>
                <button onClick={() => setReviewingThesis(null)}><X size={24} className="text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmitReview} className="flex-1 overflow-y-auto p-10 space-y-8">
                <textarea required value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={6} placeholder="Enter feedback..." className="w-full p-6 bg-slate-50 border rounded-2xl text-sm focus:bg-white transition-all shadow-inner outline-none" />
                <div className="grid grid-cols-3 gap-4">
                  <DecisionBtn type="APPROVE" active={recommendation==='APPROVE'} onClick={() => setRecommendation('APPROVE')} icon={<CheckCircle size={20} />} />
                  <DecisionBtn type="REVISE" active={recommendation==='REVISE'} onClick={() => setRecommendation('REVISE')} icon={<RotateCcw size={20} />} />
                  <DecisionBtn type="REJECT" active={recommendation==='REJECT'} onClick={() => setRecommendation('REJECT')} icon={<Ban size={20} />} />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setReviewingThesis(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DecisionBtn = ({ type, active, onClick, icon }: any) => (
  <button type="button" onClick={onClick} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}>
    {icon}
    <span className="text-[9px] font-bold uppercase">{type}</span>
  </button>
);

export default AdminReview;
