
import React, { useState, useEffect } from 'react';
import { Thesis, ThesisStatus } from '../types';
import { getTheses, updateTheses } from '../services/mockData';
import { 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  ShieldCheck,
  FileText,
  Users,
  SearchX,
  MessageSquareQuote,
  Clock,
  X,
  Eye,
  ExternalLink,
  Loader2,
  Maximize2,
  AlertTriangle
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
    alert("Authorization Granted.");
  };

  const handleReject = (id: string) => {
    if (!window.confirm("Reject administrative authorization?")) return;
    const all = getTheses();
    updateTheses(all.map(t => t.id === id ? { ...t, status: ThesisStatus.REJECTED } : t));
  };

  const filtered = queue.filter(item => {
    const s = searchQuery.toLowerCase().trim();
    return !s || item.title.toLowerCase().includes(s) || item.authorName.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Administrative Authorization</h1>

      <div className="space-y-8">
        {filtered.length > 0 ? filtered.map(item => {
          const isReady = item.reviews.some(r => r.recommendation === 'APPROVE');
          return (
            <div key={item.id} className={`bg-white rounded-[3rem] border-2 p-10 transition-all ${isReady ? 'border-indigo-600 shadow-2xl' : 'border-slate-100 opacity-90 shadow-sm'}`}>
              <div className="flex flex-col lg:flex-row justify-between gap-12">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isReady ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100'}`}>
                      {isReady ? 'Authorized' : 'Pending Clearance'}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 leading-tight">{item.title}</h3>
                  <div className="flex items-center gap-4 text-sm bg-slate-50 w-fit px-4 py-2 rounded-2xl border">
                    <Users size={16} className="text-indigo-600" />
                    <span className="font-bold text-slate-800">{item.authorName}</span>
                  </div>

                  <div className="space-y-4 pt-6 border-t">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16} className="text-indigo-600" /> Institutional Reviews</h4>
                    <div className="grid gap-4">
                      {item.reviews.map(r => (
                        <div key={r.id} className="p-6 bg-slate-50 rounded-[2rem] border hover:bg-white transition-all">
                          <div className="flex justify-between mb-4">
                            <span className="text-sm font-bold text-slate-800">{r.reviewerName}</span>
                            <span className="text-[9px] font-bold uppercase px-3 py-1 bg-white border rounded-lg">{r.recommendation}</span>
                          </div>
                          <p className="text-sm text-slate-600 italic">"{r.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:w-80 space-y-4 flex flex-col justify-center">
                  <button onClick={() => setViewingManuscript(item.fileUrl || "")} className="w-full py-4 bg-white border text-slate-700 rounded-[1.5rem] text-sm font-bold shadow-sm flex items-center justify-center gap-2">
                    <Eye size={20} /> Preview Manuscript
                  </button>
                  <button disabled={!isReady} onClick={() => handleApprove(item.id)} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-bold hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-xl shadow-indigo-100">
                    <UserCheck size={20} className="mr-2 inline" /> Grant Approval
                  </button>
                  <button onClick={() => handleReject(item.id)} className="w-full py-4 border border-rose-100 text-rose-500 rounded-[1.5rem] text-sm font-bold hover:bg-rose-50 transition-all">
                    <XCircle size={20} className="mr-2 inline" /> Reject
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <CheckCircle size={40} className="mx-auto text-slate-300 mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Ledger Clear</h3>
          </div>
        )}
      </div>

      {viewingManuscript && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><FileText size={20} /> Institutional Gatekeeper Verification</h3>
              <div className="flex gap-2">
                <button onClick={openNative} className="p-2 px-4 bg-white border rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Maximize2 size={16} /> Native Viewer</button>
                <button onClick={() => setViewingManuscript(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-all bg-white rounded-full shadow-sm"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center">
              {isExternal ? (
                <div className="text-center p-12">
                   <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
                   <h4 className="text-lg font-bold mb-2">Embedded View Blocked</h4>
                   <p className="text-sm text-slate-500 mb-6">This external repository forbids iframe embedding.</p>
                   <button onClick={openNative} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 mx-auto"><ExternalLink size={18} /> View Document Directly</button>
                </div>
              ) : blobUrl ? (
                <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-none bg-white" title="Admin Reader" />
              ) : (
                <div className="text-slate-400 italic">Processing Document...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
