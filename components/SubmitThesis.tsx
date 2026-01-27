
import React, { useState, useRef, useEffect } from 'react';
import { User, ThesisStatus, Thesis } from '../types';
import { submitNewThesis } from '../services/mockData';
import { 
  Upload, CheckCircle2, Loader2, X, ArrowLeft, Send, FileText, Maximize2, AlertTriangle, Users, User as UserIcon
} from 'lucide-react';

interface SubmitThesisProps {
  user: User;
}

const SubmitThesis: React.FC<SubmitThesisProps> = ({ user }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [isIndependent, setIsIndependent] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    department: '',
    supervisor: '',
    coAuthors: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        alert("Institutional records must be in PDF format.");
        return;
      }

      // LocalStorage is roughly 5MB. Base64 adds ~33% overhead. 
      // 2.5MB File -> 3.3MB String. Plus other existing data, this is the safe limit.
      const MAX_SIZE = 2.5 * 1024 * 1024; 
      if (selectedFile.size > MAX_SIZE) {
        alert(`File too large (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB). Manuscripts must be under 2.5MB for browser storage.`);
        return;
      }

      setIsValidating(true);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
      
      setTimeout(() => {
        setIsValidating(false);
        setStep(2);
      }, 600);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field-level Validation
    if (!formData.title.trim()) {
      alert("Submission Error: Manuscript title is required.");
      return;
    }
    if (formData.abstract.trim().length < 50) {
      alert("Submission Error: The abstract is too short. Please provide at least 50 characters of academic context.");
      return;
    }
    if (!formData.supervisor.trim()) {
      alert("Submission Error: A Faculty Supervisor must be specified for ingress evaluation.");
      return;
    }
    if (!isIndependent && !formData.coAuthors.trim()) {
      alert("Submission Error: Collaborative work must specify at least one co-author.");
      return;
    }
    if (!file) {
      alert("Submission Error: No PDF manuscript file detected.");
      return;
    }

    setIsUploading(true);
    
    try {
      console.log("Starting manuscript ingress for file:", file.name);

      const fileDataUrl = await (new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Browser failed to read the PDF file."));
        reader.readAsDataURL(file);
      }));
      
      const coResearchers = !isIndependent && formData.coAuthors 
        ? formData.coAuthors.split(',').map(name => name.trim()).filter(Boolean)
        : [];

      const newThesis: Thesis = {
        id: `m_${Date.now()}`,
        authorId: user.id,
        authorName: user.name,
        supervisorName: formData.supervisor.trim(),
        coResearchers: coResearchers,
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

      console.log("Committing manuscript to centralized vault...");
      submitNewThesis(newThesis);
      
      setIsUploading(false);
      setStep(3);
    } catch (err: any) {
      setIsUploading(false);
      console.error("Submission Failure Detail:", err);
      
      if (err.message === 'QUOTA_FULL') {
        alert("Vault Error: Your manuscript is valid, but the browser's 5MB local storage limit has been reached. Please go to Settings and 'Clear Local Cache' to make room.");
      } else {
        alert(`Ingress Error: ${err.message || "The system encountered an unknown error during upload."}`);
      }
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
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center shadow-sm relative overflow-hidden group">
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
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-8 flex items-center justify-center gap-1">
            <AlertTriangle size={12} /> LocalStorage Limit Applies
          </p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-10 py-3 bg-indigo-900 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-sm shadow-lg shadow-indigo-100"
          >
            Select PDF
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col lg:flex-row h-full min-h-[75vh] gap-4">
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[40vh] lg:h-auto">
             <div className="p-3.5 bg-slate-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-indigo-900" />
                  <p className="text-[10px] font-bold text-slate-800 truncate max-w-xs">{file?.name}</p>
                </div>
                <button onClick={() => window.open(previewUrl!, '_blank')} className="p-1.5 text-slate-400 hover:text-indigo-900"><Maximize2 size={14} /></button>
             </div>
             <div className="flex-1 bg-slate-800">
               <iframe src={previewUrl!} className="w-full h-full border-none bg-white" title="Reader" />
             </div>
          </div>

          <div className="flex-1 lg:max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col">
            <div className="p-5 bg-indigo-900 text-white flex items-center gap-4">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-white/10 rounded-lg"><ArrowLeft size={16} /></button>
              <div>
                <h2 className="text-base font-bold">Metadata Suite</h2>
                <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest">ScholarFlow Engine</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-sm font-bold" placeholder="Manuscript title..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Abstract</label>
                  <textarea required rows={4} value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all resize-none text-xs leading-relaxed" placeholder="Synthesize findings..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supervisor</label>
                  <input required value={formData.supervisor} onChange={e => setFormData({...formData, supervisor: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-sm" placeholder="Faculty Advisor name..." />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Authorship Type</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setIsIndependent(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${isIndependent ? 'bg-white shadow-sm text-indigo-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <UserIcon size={12} /> Independent
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsIndependent(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${!isIndependent ? 'bg-white shadow-sm text-indigo-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Users size={12} /> Collaborative
                    </button>
                  </div>
                </div>

                {!isIndependent && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Users size={10} /> Co-Authors
                    </label>
                    <input 
                      required={!isIndependent}
                      value={formData.coAuthors} 
                      onChange={e => setFormData({...formData, coAuthors: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all text-sm" 
                      placeholder="Names separated by commas..." 
                    />
                    <p className="text-[8px] text-slate-400 font-medium px-1 italic">e.g. "Jane Doe, John Smith"</p>
                  </div>
                )}
              </div>
              <button type="submit" disabled={isUploading} className="w-full py-3.5 bg-indigo-900 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center justify-center gap-2 transition-all shadow-md">
                {isUploading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Commit Record</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-lg animate-in zoom-in">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Indexed Successfully</h2>
          <p className="text-slate-500 mb-10 text-xs font-medium">Routed for Faculty Evaluation.</p>
          <button onClick={() => window.location.hash = '#/my-thesis'} className="w-full py-3.5 bg-indigo-900 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-sm">View Portfolio</button>
        </div>
      )}
    </div>
  );
};

export default SubmitThesis;
