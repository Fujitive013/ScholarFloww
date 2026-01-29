
import React, { useState, useRef, useEffect } from 'react';
import { User, ThesisStatus, Thesis } from '../types';
import { submitNewThesis } from '../services/mockData';
import { 
  Upload, CheckCircle2, Loader2, X, ArrowLeft, Send, FileText, Maximize2, ShieldCheck, Check, HelpCircle, User as UserIcon, Users
} from 'lucide-react';
import { showToast } from '../App';

interface SubmitThesisProps { user: User; }

const SubmitThesis: React.FC<SubmitThesisProps> = ({ user }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isIndependent, setIsIndependent] = useState(true);
  const [formData, setFormData] = useState({ title: '', abstract: '', department: '', supervisor: '', coAuthors: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.includes('pdf') && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        showToast("Institutional records must be in PDF format.", "error");
        return;
      }
      if (selectedFile.size > 2.5 * 1024 * 1024) {
        showToast("File exceeds 2.5MB limit.", "error");
        return;
      }
      setIsValidating(true);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
      setTimeout(() => { setIsValidating(false); setStep(2); }, 600);
    }
  };

  const handleFinalSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const fileDataUrl = await (new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));

      const coResearchersList = !isIndependent && formData.coAuthors 
        ? formData.coAuthors.split(',').map(name => name.trim()).filter(Boolean)
        : [];

      const newThesis: Thesis = {
        id: `m_${Date.now()}`,
        authorId: user.id,
        authorName: user.name,
        supervisorName: formData.supervisor.trim(),
        coResearchers: coResearchersList,
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        department: formData.department || 'General Academic',
        year: new Date().getFullYear().toString(),
        status: ThesisStatus.PENDING,
        submissionDate: new Date().toLocaleDateString(),
        fileUrl: fileDataUrl,
        fileName: file.name,
        keywords: [],
        reviews: [],
        versions: [{
          id: `v1_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          title: formData.title.trim(),
          abstract: formData.abstract.trim(),
          fileName: file.name,
          fileUrl: fileDataUrl,
          changeNote: "Initial Ingress"
        }]
      };
      submitNewThesis(newThesis);
      setIsUploading(false);
      setShowConfirmation(false);
      setStep(3);
      showToast("Manuscript committed to archive.");
    } catch (err: any) {
      setIsUploading(false);
      showToast("Submission failed.", "error");
    }
  };

  return (
    <div className={`mx-auto transition-all duration-500 ${step === 2 ? 'max-w-none' : 'max-w-2xl'}`}>
      {step !== 2 && (
        <div className="text-center space-y-2 mb-10 animate-in fade-in">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manuscript Ingress</h1>
          <p className="text-slate-500 text-xs italic">Digital archive for evaluation.</p>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-200 text-center shadow-sm relative overflow-hidden group">
          {isValidating && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-indigo-900" size={32} />
              <p className="mt-4 text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Validating Ingress...</p>
            </div>
          )}
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-900 mx-auto mb-8 shadow-inner">
            <Upload size={32} className="animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Drop-Zone</h2>
          <p className="text-slate-500 mb-2 max-w-xs mx-auto text-xs font-medium">Upload PDF manuscript (Max 2.5MB).</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto px-10 py-3 bg-indigo-900 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-sm shadow-lg shadow-indigo-100">Select PDF</button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col lg:flex-row h-full min-h-[75vh] gap-4">
          <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[40vh] lg:h-auto">
             <div className="p-3.5 bg-indigo-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <FileText size={16} />
                  <p className="text-[10px] font-bold uppercase tracking-widest truncate max-w-xs">{file?.name}</p>
                </div>
                <button onClick={() => window.open(previewUrl!, '_blank')} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Maximize2 size={14} /></button>
             </div>
             <div className="flex-1 bg-slate-800 relative">
               {previewUrl ? <iframe src={previewUrl} className="w-full h-full border-none bg-white" title="Reader" /> : <div className="h-full flex items-center justify-center text-indigo-400"><Loader2 className="animate-spin" /></div>}
             </div>
          </div>

          <div className="flex-1 lg:max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-lg flex flex-col overflow-hidden">
            <div className="p-5 bg-indigo-900 text-white flex items-center gap-4">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-white/10 rounded-lg"><ArrowLeft size={16} /></button>
              <div>
                <h2 className="text-base font-bold">Metadata Suite</h2>
                <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest">ScholarFlow Engine</p>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowConfirmation(true); }} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-sm font-bold" placeholder="Manuscript title..." /></div>
                <div className="space-y-1.5"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Abstract</label><textarea required rows={4} value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all resize-none text-xs leading-relaxed" placeholder="Synthesize findings..." /></div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Authorship Type</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setIsIndependent(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${isIndependent ? 'bg-indigo-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <UserIcon size={12} /> Independent
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsIndependent(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${!isIndependent ? 'bg-indigo-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Users size={12} /> Collaborative
                    </button>
                  </div>
                </div>

                {!isIndependent && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Users size={10} /> Co-Researchers
                    </label>
                    <input 
                      required={!isIndependent}
                      value={formData.coAuthors} 
                      onChange={e => setFormData({...formData, coAuthors: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-sm font-bold" 
                      placeholder="Comma separated names..." 
                    />
                  </div>
                )}

                <div className="space-y-1.5"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supervisor</label><input required value={formData.supervisor} onChange={e => setFormData({...formData, supervisor: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-sm font-bold" placeholder="Faculty Advisor name..." /></div>
              </div>
              <button type="submit" className="w-full py-3.5 bg-indigo-900 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center justify-center gap-2 transition-all shadow-md"><Check size={18} /> Review & Submit</button>
            </form>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between shrink-0"><h3 className="text-sm font-bold flex items-center gap-2"><ShieldCheck size={18} /> Ingress Verification</h3><button onClick={() => setShowConfirmation(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button></div>
            <div className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-900 rounded-2xl flex items-center justify-center mx-auto mb-4"><HelpCircle size={32} /></div>
              <h3 className="text-xl font-bold text-slate-900">Final Verification</h3>
              <p className="text-xs text-slate-500 px-4 leading-relaxed">Confirm metadata accuracy before committing to the archive.</p>
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100 text-left">
                <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Title</p><p className="text-xs font-bold text-slate-800 line-clamp-2">{formData.title}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Supervisor</p><p className="text-xs font-bold text-slate-800">{formData.supervisor}</p></div>
                  <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Authorship</p><p className="text-xs font-bold text-slate-800">{isIndependent ? 'Independent' : 'Collaborative'}</p></div>
                </div>
                {!isIndependent && formData.coAuthors && (
                  <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Co-Researchers</p><p className="text-xs font-bold text-slate-800 truncate">{formData.coAuthors}</p></div>
                )}
                <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">File</p><p className="text-xs font-bold text-slate-800 truncate">{file?.name}</p></div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button onClick={handleFinalSubmit} disabled={isUploading} className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-bold text-[10px] uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">{isUploading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Commit to Archive</>}</button>
                <button onClick={() => setShowConfirmation(false)} className="w-full py-4 bg-white text-slate-500 border border-slate-100 rounded-2xl font-bold text-[10px] uppercase hover:bg-slate-50 transition-colors">Wait, Go Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center shadow-lg animate-in zoom-in">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Indexed Successfully</h2>
          <p className="text-slate-500 mb-10 text-xs font-medium">Routed for Faculty Evaluation.</p>
          <button onClick={() => window.location.hash = '#/my-thesis'} className="w-full py-3.5 bg-indigo-900 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-sm">View Portfolio</button>
        </div>
      )}
    </div>
  );
};

export default SubmitThesis;
