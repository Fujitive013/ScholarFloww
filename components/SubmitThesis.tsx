
import React, { useState, useRef, useEffect } from 'react';
import { User, ThesisStatus, Thesis } from '../types';
import { extractThesisMetadata } from '../services/geminiService';
import { getTheses, updateTheses } from '../services/mockData';
import { 
  Upload, CheckCircle2, Loader2, Sparkles, X, Users, ArrowLeft, BookOpen, Send, FileText, Maximize2, ShieldCheck, Zap
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
  const [isCollaborative, setIsCollaborative] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    department: '',
    supervisor: '',
    coResearchersRaw: '',
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
      if (selectedFile.type !== 'application/pdf') {
        alert("Must be a PDF.");
        return;
      }
      setIsValidating(true);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
      
      setTimeout(() => {
        setIsValidating(false);
        setStep(2);
      }, 800);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const fileDataUrl = file ? await (new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      })) : "";
      
      const all = getTheses();
      const newThesis: Thesis = {
        id: `m_${Date.now()}`,
        authorId: user.id,
        authorName: user.name,
        supervisorName: formData.supervisor || 'Unassigned',
        coResearchers: isCollaborative ? formData.coResearchersRaw.split(',').map(s => s.trim()) : [],
        title: formData.title,
        abstract: formData.abstract,
        department: formData.department || 'Academic',
        year: new Date().getFullYear().toString(),
        status: ThesisStatus.PENDING,
        submissionDate: new Date().toLocaleDateString(),
        fileUrl: fileDataUrl,
        fileName: file?.name,
        keywords: [],
        reviews: [],
        versions: [{
          id: `v1_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          title: formData.title,
          abstract: formData.abstract,
          fileName: file?.name,
          fileUrl: fileDataUrl,
          changeNote: "Initial Ingress"
        }]
      };

      updateTheses([...all, newThesis]);
      setTimeout(() => {
        setIsUploading(false);
        setStep(3);
      }, 1000);
    } catch (err) {
      setIsUploading(false);
      alert("Error.");
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
          <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Drop-Zone</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto text-xs font-medium">Upload PDF manuscript.</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-10 py-3 bg-indigo-900 text-white rounded-xl font-bold hover:bg-slate-900 transition-all text-sm"
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
