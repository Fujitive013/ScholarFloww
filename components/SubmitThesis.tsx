
import React, { useState, useRef, useEffect } from 'react';
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
  Send,
  Maximize2,
  FileText,
  ShieldCheck,
  Zap
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

  // Clean up the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const dispatchToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    window.dispatchEvent(new CustomEvent('scholarflow-toast', { detail: { message, type } }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        dispatchToast("Institutional requirement: Manuscripts must be in PDF format.", "error");
        e.target.value = '';
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) {
        dispatchToast("Limit exceeded: Manuscript must be under 20MB.", "error");
        e.target.value = '';
        return;
      }

      setIsValidating(true);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
      
      // Auto-advance logic: Give user a moment to see the validation then move to workspace
      setTimeout(() => {
        setIsValidating(false);
        setStep(2);
        dispatchToast("Manuscript integrity verified. Workspace active.", "success");
      }, 800);
      
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
      }, 1500);

    } catch (err) {
      dispatchToast("Verification failed. Check file sanity.", "error");
      setIsUploading(false);
    }
  };

  return (
    <div className={`mx-auto ${step === 2 ? 'max-w-none' : 'max-w-4xl'} transition-all duration-700 ease-in-out`}>
      {/* Header logic - stays visible for steps 1 and 3 */}
      {step !== 2 && (
        <div className="text-center space-y-3 px-4 mb-12 animate-in fade-in">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Manuscript Ingress</h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm sm:text-lg">Digitally index your research for official Stellaris peer evaluation.</p>
        </div>
      )}

      {/* Step Indicator (Visible on steps 1 and 3) */}
      {step !== 2 && (
        <div className="flex items-center justify-between relative max-w-md mx-auto px-6 mb-16">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10 rounded-full"></div>
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2 bg-slate-50 relative z-10 px-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border-4 border-slate-50 transition-all shadow-md ${step >= s ? 'bg-indigo-900 text-white scale-110' : 'bg-white text-slate-300'}`}>
                {s < step ? <CheckCircle2 size={20} /> : s}
              </div>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap hidden sm:block ${step >= s ? 'text-indigo-900' : 'text-slate-300'}`}>
                {s === 1 ? 'Validation' : s === 2 ? 'Metadata' : 'Indexing'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Initial Ingress Staging */}
      {step === 1 && (
        <div className="bg-white p-8 sm:p-24 rounded-[3rem] sm:rounded-[5rem] border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-8 shadow-sm mx-4 sm:mx-0 relative overflow-hidden">
          {isValidating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-900 animate-spin mb-6"></div>
              <p className="text-sm font-extrabold text-indigo-900 uppercase tracking-widest">Validating Manuscript Integrity...</p>
            </div>
          )}
          
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center text-indigo-900 mx-auto mb-10 shadow-inner group-hover:scale-105 transition-transform duration-500">
            <Upload size={48} className="animate-bounce" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Institutional Drop-Zone</h2>
          <p className="text-slate-500 mb-12 max-w-sm mx-auto text-sm sm:text-base font-medium leading-relaxed">Select your final PDF manuscript. Our engine will automatically initialize a research workspace for you.</p>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf" />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-full sm:w-auto px-16 py-6 bg-indigo-900 text-white rounded-[2.5rem] font-extrabold hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 active:scale-95 text-lg flex items-center justify-center gap-4 mx-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <FileText size={24} />
            Initialize Ingress
          </button>
          
          <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2"><ShieldCheck size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">PDF Standard</span></div>
            <div className="flex items-center gap-2"><Zap size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Auto-Initialize</span></div>
          </div>
        </div>
      )}

      {/* Step 2: Workspace View (Split Screen) */}
      {step === 2 && (
        <div className="flex flex-col lg:flex-row h-full min-h-[80vh] gap-6 px-4 sm:px-0 animate-in fade-in zoom-in duration-500">
          {/* Manuscript Viewer Panel */}
          <div className="flex-1 bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-2xl flex flex-col h-[50vh] lg:h-[80vh] group">
             <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-900 text-white rounded-2xl shadow-lg"><FileText size={20} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Live Ingress Review</p>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[150px] sm:max-w-md">{file?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(previewUrl!, '_blank')} 
                  className="p-3 text-slate-400 hover:text-indigo-900 bg-white rounded-xl border-2 border-slate-50 shadow-sm transition-all hover:scale-110"
                >
                  <Maximize2 size={18} />
                </button>
             </div>
             <div className="flex-1 bg-slate-800 relative">
               {previewUrl ? (
                 <iframe 
                   src={previewUrl} 
                   className="w-full h-full border-none bg-white" 
                   title="Manuscript Review Engine"
                 />
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                   <Loader2 size={32} className="animate-spin" />
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing Document...</p>
                 </div>
               )}
             </div>
          </div>

          {/* Metadata Form Panel */}
          <div className="flex-1 lg:max-w-xl bg-white rounded-[3rem] border-2 border-indigo-50 shadow-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-6 sm:p-10 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button type="button" onClick={() => setStep(1)} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-indigo-200 hover:text-white border border-white/10">
                    <ArrowLeft size={20} />
                 </button>
                 <div>
                   <h2 className="text-xl font-bold tracking-tight">Assign Metadata</h2>
                   <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">ScholarFlow Ingress Engine</p>
                 </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Research Title</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                      required 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] focus:bg-white focus:border-indigo-900 outline-none transition-all text-slate-900 font-extrabold text-sm shadow-inner" 
                      placeholder="Institutional research title..." 
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Academic Abstract</label>
                    <button 
                      type="button" 
                      onClick={handleAISuggest} 
                      disabled={!formData.title || !formData.abstract || isUploading} 
                      className="flex items-center gap-2 text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest disabled:opacity-30"
                    >
                      <Sparkles size={12} /> AI Optimize
                    </button>
                  </div>
                  <textarea 
                    required 
                    rows={6} 
                    value={formData.abstract} 
                    onChange={e => setFormData({...formData, abstract: e.target.value})} 
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-indigo-900 outline-none transition-all resize-none text-slate-700 text-sm leading-relaxed shadow-inner" 
                    placeholder="Reference the left panel to refine your core methodologies and expected outcomes..." 
                  />
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="text-center sm:text-left">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Users size={18} className="text-indigo-900" /> Research Mode
                    </h3>
                  </div>
                  <div className="flex bg-white p-1.5 rounded-2xl shadow-inner border border-slate-200">
                    <button type="button" onClick={() => setIsCollaborative(true)} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all ${isCollaborative === true ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-400'}`}>Collaborative</button>
                    <button type="button" onClick={() => setIsCollaborative(false)} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all ${isCollaborative === false ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-400'}`}>Independent</button>
                  </div>
                </div>

                {isCollaborative && (
                  <div className="animate-in slide-in-from-top-4">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-2">Co-Investigators</label>
                    <input 
                      required={isCollaborative} 
                      value={formData.coResearchersRaw} 
                      onChange={e => setFormData({...formData, coResearchersRaw: e.target.value})} 
                      className="w-full px-6 py-5 mt-2 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 text-xs font-extrabold outline-none focus:border-indigo-900 transition-all shadow-sm" 
                      placeholder="Separate full names with commas..." 
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-2">Department</label>
                    <input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-800 font-extrabold text-xs focus:bg-white shadow-inner focus:border-indigo-900 transition-all" placeholder="e.g. Physics" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-2">Primary Advisor</label>
                    <input required value={formData.supervisor} onChange={e => setFormData({...formData, supervisor: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-slate-800 font-extrabold text-xs focus:bg-white shadow-inner focus:border-indigo-900 transition-all" placeholder="Dr. Full Name" />
                  </div>
                </div>
              </div>

              <div className="pt-8 pb-12">
                <button 
                  type="submit" 
                  disabled={isUploading} 
                  className="w-full py-6 bg-indigo-900 text-white rounded-[2.5rem] font-extrabold hover:bg-slate-900 flex items-center justify-center gap-4 shadow-2xl shadow-indigo-100 active:scale-95 text-lg transition-all"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={24} /> : <><Send size={24} /> Commit to Evaluation Queue</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 3: Success Confirmation */}
      {step === 3 && (
        <div className="bg-white p-12 sm:p-32 rounded-[4rem] sm:rounded-[6rem] border border-slate-200 text-center animate-in zoom-in duration-700 shadow-2xl mx-4 sm:mx-0">
          <div className="w-28 h-28 sm:w-36 sm:h-36 bg-emerald-50 text-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto mb-12 ring-[24px] ring-emerald-50/50 shadow-2xl">
            <CheckCircle2 size={64} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Institutional Ingress Successful</h2>
          <p className="text-slate-500 mb-16 max-w-sm mx-auto leading-relaxed text-base sm:text-xl font-medium">Your research manuscript is now indexed and successfully routed to the Faculty Evaluation Queue.</p>
          <div className="flex flex-col sm:flex-row gap-6 max-w-lg mx-auto">
             <button onClick={() => window.location.hash = '#/my-thesis'} className="flex-1 py-6 bg-indigo-900 text-white rounded-[2.5rem] font-extrabold hover:bg-slate-900 transition-all shadow-2xl active:scale-95 text-lg">Open Scholarly Portfolio</button>
             <button onClick={() => {setStep(1); setFile(null); setPreviewUrl(null);}} className="flex-1 py-6 bg-white text-slate-500 border-2 border-slate-200 rounded-[2.5rem] font-extrabold hover:bg-slate-50 transition-all text-lg">Submit Another Record</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitThesis;
