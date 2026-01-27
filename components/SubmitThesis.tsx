
import React, { useState, useRef } from 'react';
import { User, ThesisStatus, Thesis } from '../types';
import { extractThesisMetadata } from '../services/geminiService';
import { getTheses, updateTheses } from '../services/mockData';
import { 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  X, 
  Users, 
  FileCheck, 
  ChevronRight, 
  ArrowLeft,
  BookOpen,
  Send
} from 'lucide-react';

interface SubmitThesisProps {
  user: User;
}

const SubmitThesis: React.FC<SubmitThesisProps> = ({ user }) => {
  const [file, setFile] = useState<File | null>(null);
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

  const dispatchToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    window.dispatchEvent(new CustomEvent('scholarflow-toast', { detail: { message, type } }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        dispatchToast("Institutional requirement: Manuscripts must be in PDF format.", "error");
        e.target.value = ''; // Clear input
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        dispatchToast("Limit exceeded: Manuscript must be under 10MB.", "error");
        e.target.value = ''; // Clear input
        return;
      }
      setFile(selectedFile);
      dispatchToast("Manuscript integrity verified and staged.", "success");
      // Reset input value to allow re-upload of same file if deleted
      e.target.value = '';
    }
  };

  const handleAISuggest = async () => {
    if (!formData.title || !formData.abstract) {
      dispatchToast("Provide title and abstract for AI analysis.", "warning");
      return;
    }
    setIsUploading(true);
    dispatchToast("ScholarAI analyzing research context...", "info");
    const result = await extractThesisMetadata(formData.title, formData.abstract);
    if (result) {
        setFormData(prev => ({ 
          ...prev, 
          department: result.suggestedDepartment || prev.department,
        }));
        dispatchToast("Scholarly metadata optimized by AI.", "success");
    } else {
        dispatchToast("AI metadata synthesis failed.", "warning");
    }
    setIsUploading(false);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const fileDataUrl = file ? await readFileAsDataURL(file) : "";
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
          changeNote: "Initial Institutional Ingress"
        }]
      };

      updateTheses([...all, newThesis]);
      
      setTimeout(() => {
        setIsUploading(false);
        setStep(3);
        dispatchToast("Manuscript committed to Faculty Evaluation Queue.", "success");
      }, 1800);

    } catch (err) {
      dispatchToast("Verification failed. Check file sanity.", "error");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 pb-20">
      {/* Responsive Header */}
      <div className="text-center space-y-3 px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Manuscript Ingress</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed text-sm sm:text-lg">Index your scholarly record for official institutional peer evaluation.</p>
      </div>

      {/* Responsive Step Indicator */}
      <div className="flex items-center justify-between relative max-w-md mx-auto px-6">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10 rounded-full"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 sm:gap-3 bg-slate-50 relative z-10 px-2">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold border-4 border-slate-50 transition-all shadow-md ${step >= s ? 'bg-indigo-900 text-white scale-110' : 'bg-white text-slate-300'}`}>
              {s < step ? <CheckCircle2 size={20} /> : s}
            </div>
            <span className={`text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest whitespace-nowrap hidden sm:block ${step >= s ? 'text-indigo-900' : 'text-slate-300'}`}>
              {s === 1 ? 'Upload' : s === 2 ? 'Metadata' : 'Status'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: File Selection */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-14 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 shadow-sm mx-4 sm:mx-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-900 mx-auto mb-8 shadow-inner">
            <Upload size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Source Manuscript</h2>
          <p className="text-slate-500 mb-8 sm:mb-10 max-w-sm mx-auto text-xs sm:text-sm font-medium leading-relaxed">Please select your final thesis draft in PDF format for institutional evaluation.</p>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf" />
          
          {file ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[1.5rem] flex items-center gap-4 sm:gap-6 border border-slate-100 max-w-md mx-auto shadow-inner group">
                <div className="p-3 bg-indigo-900 text-white rounded-xl shadow-lg"><FileCheck size={24} /></div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-extrabold text-slate-800 truncate mb-1">{file.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">Validated Integrity</p>
                </div>
                <button onClick={() => setFile(null)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors bg-white rounded-lg shadow-sm">
                  <X size={18} />
                </button>
              </div>
              <button 
                onClick={() => setStep(2)} 
                className="w-full sm:w-auto px-12 py-4 bg-indigo-900 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl active:scale-95 text-sm flex items-center justify-center gap-3 mx-auto"
              >
                Next: Assign Metadata <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-10 py-4 bg-indigo-900 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95 text-sm"
            >
              Select PDF Manuscript
            </button>
          )}
        </div>
      )}

      {/* Step 2: Metadata Form */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-xl animate-in fade-in slide-in-from-right-4 mx-4 sm:mx-0">
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <button type="button" onClick={() => setStep(1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-bold text-slate-800">Scholarly Metadata</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Manuscript Title</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm shadow-inner focus:ring-4 focus:ring-indigo-50" 
                    placeholder="Enter full research title..." 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Research Abstract</label>
                <textarea 
                  required 
                  rows={4} 
                  value={formData.abstract} 
                  onChange={e => setFormData({...formData, abstract: e.target.value})} 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none transition-all resize-none text-slate-700 text-sm leading-relaxed shadow-inner focus:ring-4 focus:ring-indigo-50" 
                  placeholder="Summarize research scope, core methodologies, and expected outcomes..." 
                />
                <button 
                  type="button" 
                  onClick={handleAISuggest} 
                  disabled={!formData.title || !formData.abstract || isUploading} 
                  className="flex items-center gap-2 text-[10px] font-extrabold text-indigo-900 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors uppercase tracking-widest disabled:opacity-30"
                >
                  <Sparkles size={14} /> ScholarAI: Optimize Metadata
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
                <div className="text-center sm:text-left">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
                    <Users size={18} className="text-indigo-900" /> Taxonomy
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">Declare co-investigators if applicable.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 shrink-0">
                  <button type="button" onClick={() => setIsCollaborative(true)} className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${isCollaborative === true ? 'bg-indigo-900 text-white' : 'text-slate-400'}`}>Collaborative</button>
                  <button type="button" onClick={() => setIsCollaborative(false)} className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${isCollaborative === false ? 'bg-indigo-900 text-white' : 'text-slate-400'}`}>Independent</button>
                </div>
              </div>

              {isCollaborative && (
                <div className="animate-in slide-in-from-top-4">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Co-Investigators</label>
                  <input 
                    required={isCollaborative} 
                    value={formData.coResearchersRaw} 
                    onChange={e => setFormData({...formData, coResearchersRaw: e.target.value})} 
                    className="w-full px-4 py-4 mt-2 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 text-xs font-bold outline-none focus:border-indigo-900 transition-all shadow-sm" 
                    placeholder="Enter full names separated by commas..." 
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <input 
                    required 
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})} 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-800 font-bold text-xs focus:bg-white shadow-inner transition-all" 
                    placeholder="e.g. Astrophysics" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Advisor</label>
                  <input 
                    required 
                    value={formData.supervisor} 
                    onChange={e => setFormData({...formData, supervisor: e.target.value})} 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-800 font-bold text-xs focus:bg-white shadow-inner transition-all" 
                    placeholder="Dr. Full Name" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isUploading} 
              className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-bold hover:bg-slate-900 flex items-center justify-center gap-3 shadow-xl active:scale-95 text-base"
            >
              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Commit to Evaluation Queue</>}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="bg-white p-8 sm:p-20 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 text-center animate-in zoom-in duration-500 shadow-2xl mx-4 sm:mx-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">Ingress Successful</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed text-sm sm:text-base font-medium">Your manuscript is now indexed and awaiting faculty evaluation.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
             <button onClick={() => window.location.hash = '#/my-thesis'} className="flex-1 py-4 bg-indigo-900 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all active:scale-95 text-sm">Open Portfolio</button>
             <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm">Upload New Draft</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitThesis;
