
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
        alert("Institutional Regulation: Manuscripts must be in PDF format.");
        return;
      }
      setIsValidating(true);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
      
      setTimeout(() => {
        setIsValidating(false);
        setStep(2);
      }, 1000);
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
        supervisorName: formData.supervisor || 'Unassigned Faculty',
        coResearchers: isCollaborative ? formData.coResearchersRaw.split(',').map(s => s.trim()) : [],
        title: formData.title,
        abstract: formData.abstract,
        department: formData.department || 'General Academic',
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
      }, 1500);
    } catch (err) {
      setIsUploading(false);
      alert("Verification failed.");
    }
  };

  return (
    <div className={`mx-auto transition-all duration-700 ${step === 2 ? 'max-w-none' : 'max-w-4xl'}`}>
      {step !== 2 && (
        <div className="text-center space-y-4 mb-16 animate-in fade-in duration-1000">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">Manuscript Ingress</h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm sm:text-xl leading-relaxed italic">Digitally archive your research for institutional evaluation.</p>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white p-10 sm:p-24 rounded-[3.5rem] border border-slate-200 text-center shadow-sm relative overflow-hidden group mx-4 sm:mx-0">
          {isValidating && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-50 border-t-indigo-900 animate-spin" />
              <p className="mt-8 text-xs font-extrabold text-indigo-900 uppercase tracking-widest">Validating Ingress Integrity...</p>
            </div>
          )}
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-indigo-900 mx-auto mb-10 shadow-inner group-hover:scale-105 transition-transform">
            <Upload size={56} className="animate-bounce" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">Drop-Zone</h2>
          <p className="text-slate-500 mb-12 max-w-sm mx-auto text-sm sm:text-lg font-medium italic">Upload your final PDF manuscript to initialize the indexing engine.</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-16 py-6 bg-indigo-900 text-white rounded-[2.5rem] font-extrabold hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 active:scale-95 text-lg"
          >
            Select Manuscript
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col lg:flex-row h-full min-h-[85vh] gap-6 px-4 sm:px-0 animate-in fade-in duration-500">
          <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[50vh] lg:h-auto">
             <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-900 text-white rounded-2xl shadow-lg"><FileText size={20} /></div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-sm">{file?.name}</p>
                </div>
                <button onClick={() => window.open(previewUrl!, '_blank')} className="p-3 text-slate-400 hover:text-indigo-900 transition-all"><Maximize2 size={18} /></button>
             </div>
             <div className="flex-1 bg-slate-800">
               <iframe src={previewUrl!} className="w-full h-full border-none bg-white" title="Reader" />
             </div>
          </div>

          <div className="flex-1 lg:max-w-xl bg-white rounded-[3rem] border-2 border-indigo-50 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 bg-indigo-900 text-white flex items-center gap-6">
              <button onClick={() => setStep(1)} className="p-3 hover:bg-white/10 rounded-2xl text-indigo-200 hover:text-white border border-white/10"><ArrowLeft size={20} /></button>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Metadata Suite</h2>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest italic">ScholarFlow Engine</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-2">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:bg-white focus:border-indigo-900 outline-none transition-all font-extrabold text-lg" placeholder="Manuscript title..." />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-2">Abstract</label>
                  <textarea required rows={5} value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] focus:bg-white focus:border-indigo-900 outline-none transition-all resize-none text-sm leading-relaxed" placeholder="Synthesize findings..." />
                </div>
              </div>
              <button type="submit" disabled={isUploading} className="w-full py-7 bg-indigo-900 text-white rounded-[3rem] font-extrabold hover:bg-slate-900 flex items-center justify-center gap-4 transition-all shadow-2xl">
                {isUploading ? <Loader2 className="animate-spin" size={28} /> : <><Send size={28} /> Commit Record</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-16 sm:p-32 rounded-[4rem] border border-slate-200 text-center animate-in zoom-in shadow-2xl mx-4 sm:mx-0">
          <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-[3.5rem] flex items-center justify-center mx-auto mb-14 shadow-2xl">
            <CheckCircle2 size={72} />
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-8 tracking-tighter italic">Successfully Indexed</h2>
          <p className="text-slate-500 mb-20 max-w-sm mx-auto text-lg sm:text-2xl font-medium">Your research has been routed for Faculty Evaluation.</p>
          <button onClick={() => window.location.hash = '#/my-thesis'} className="w-full py-7 bg-indigo-900 text-white rounded-[3rem] font-extrabold hover:bg-slate-900 transition-all shadow-2xl active:scale-95 text-xl">Manage Portfolio</button>
        </div>
      )}
    </div>
  );
};

export default SubmitThesis;
