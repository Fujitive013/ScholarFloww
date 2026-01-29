
import React, { useState, useEffect } from 'react';
import { Thesis, ThesisStatus, Review } from '../types';
import { getTheses, updateTheses } from '../services/mockData';
import DocumentReaderModal from './DocumentReaderModal';
import { 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Users,
  X,
  Eye,
  Gavel,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { showToast } from '../App';

const AdminDashboard: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const [queue, setQueue] = useState<Thesis[]>([]);
  const [viewingManuscript, setViewingManuscript] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ id: string; action: 'APPROVE' | 'REJECT' | 'REVISE' } | null>(null);
  const [adminRemark, setAdminRemark] = useState('');

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      setQueue(all.filter(t => t.status === ThesisStatus.REVIEWED));
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, []);

  const executeAction = () => {
    if (!confirmDialog) return;
    const { id, action } = confirmDialog;
    
    if ((action === 'REJECT' || action === 'REVISE') && !adminRemark.trim()) {
      showToast("Institutional remarks are mandatory for this action.", "warning");
      return;
    }

    const all = getTheses();
    const deanReview: Review = {
      id: `dean_${Date.now()}`,
      reviewerId: 'dean-1',
      reviewerName: 'Dean of Research Office',
      comment: adminRemark || 'Institutional sanction granted for publication.',
      date: new Date().toLocaleDateString(),
      recommendation: action === 'APPROVE' ? 'APPROVE' : (action === 'REVISE' ? 'REVISE' : 'REJECT')
    };

    updateTheses(all.map(t => {
      if (t.id === id) {
        let newStatus = ThesisStatus.PUBLISHED;
        if (action === 'REVISE') newStatus = ThesisStatus.REVISION_REQUIRED;
        if (action === 'REJECT') newStatus = ThesisStatus.REJECTED;

        return { 
          ...t, 
          status: newStatus, 
          publishedDate: action === 'APPROVE' ? new Date().toLocaleDateString() : t.publishedDate,
          reviews: [...(t.reviews || []), deanReview]
        };
      }
      return t;
    }));

    showToast(
      action === 'APPROVE' ? "Institutional Sanction Granted." :
      action === 'REVISE' ? "Manuscript routed for revision." : "Ingress Revoked."
    );
    
    setConfirmDialog(null);
    setAdminRemark('');
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
      </div>

      <div className="space-y-6 sm:space-y-10">
        {filtered.length > 0 ? filtered.map(item => {
          const isReady = item.reviews.some(r => r.recommendation === 'APPROVE');
          return (
            <div key={item.id} className={`bg-white rounded-[2.5rem] border-2 p-6 sm:p-12 transition-all group ${isReady ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-slate-100'}`}>
              <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-16">
                <div className="flex-1 space-y-6 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${isReady ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {isReady ? 'Sanction Pending' : 'Evaluations Req.'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors break-words">{item.title}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-xl border text-indigo-600"><Users size={16} /></div>
                      <div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Investigator</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{item.authorName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Faculty Evaluation Summary</label>
                    <div className="grid gap-2">
                      {item.reviews.map(r => (
                        <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                             <span className="text-xs font-bold text-slate-800">{r.reviewerName}</span>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase px-2 py-1 bg-white border border-slate-100 rounded-lg text-emerald-600">{r.recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-80 space-y-3 flex flex-col justify-center shrink-0">
                  <button onClick={() => setViewingManuscript(item.fileUrl || "")} className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95">
                    <Eye size={20} className="text-indigo-600" /> Inspect
                  </button>
                  <button disabled={!isReady} onClick={() => setConfirmDialog({ id: item.id, action: 'APPROVE' })} className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95">
                    <UserCheck size={20} /> Grant Sanction
                  </button>
                  <button onClick={() => setConfirmDialog({ id: item.id, action: 'REVISE' })} className="w-full py-4 border border-amber-200 text-amber-600 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                    <RotateCcw size={20} /> Request Revision
                  </button>
                  <button onClick={() => setConfirmDialog({ id: item.id, action: 'REJECT' })} className="w-full py-4 border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                    <XCircle size={20} /> Revoke Ingress
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-24 text-center bg-white rounded-[4rem] border border-slate-200 shadow-inner px-4">
            <CheckCircle size={56} className="mx-auto text-slate-100 mb-8" />
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ledger Synchronized</h3>
          </div>
        )}
      </div>

      {/* Enhanced Dean Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between shrink-0">
               <h3 className="text-sm font-bold flex items-center gap-2"><ShieldCheck size={18} /> Administrative Decision</h3>
               <button onClick={() => setConfirmDialog(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 ${
                confirmDialog.action === 'APPROVE' ? 'bg-indigo-50 text-indigo-900' : 
                confirmDialog.action === 'REVISE' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {confirmDialog.action === 'REVISE' ? <RotateCcw size={32} /> : <Gavel size={32} />}
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  {confirmDialog.action === 'APPROVE' ? "Grant Sanction?" : confirmDialog.action === 'REVISE' ? "Request Revision?" : "Revoke Manuscript?"}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed px-4 mt-2">
                  {confirmDialog.action === 'APPROVE' 
                    ? "Confirm final publication of this research. This action is immutable."
                    : "Provide specific reasons for this institutional decision below. The student will be required to address these before re-submission."}
                </p>
              </div>

              {(confirmDialog.action === 'REVISE' || confirmDialog.action === 'REJECT') && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <MessageSquare size={12} /> Institutional Remarks
                  </label>
                  <textarea 
                    value={adminRemark} 
                    onChange={e => setAdminRemark(e.target.value)}
                    required
                    placeholder="Enter mandatory feedback for the student..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
                    rows={4}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button onClick={executeAction} className={`w-full py-4 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg transition-all active:scale-95 ${
                  confirmDialog.action === 'APPROVE' ? 'bg-indigo-600 hover:bg-indigo-700' : 
                  confirmDialog.action === 'REVISE' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}>
                  {confirmDialog.action === 'APPROVE' ? "Yes, Publish Permanently" : 
                   confirmDialog.action === 'REVISE' ? "Commit Revision Request" : "Yes, Revoke Manuscript"}
                </button>
                <button onClick={() => setConfirmDialog(null)} className="w-full py-4 bg-white text-slate-500 border border-slate-100 rounded-2xl font-bold text-[10px] uppercase hover:bg-slate-50 transition-colors active:scale-95">Wait, Inspect Again</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Reader Modal */}
      <DocumentReaderModal 
        isOpen={!!viewingManuscript} 
        onClose={() => setViewingManuscript(null)} 
        fileUrl={viewingManuscript || undefined} 
        title="Authorization Reader"
      />
    </div>
  );
};

export default AdminDashboard;
