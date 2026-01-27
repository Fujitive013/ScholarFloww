
import React, { useState, useRef } from 'react';
import { User, ThesisStatus, Thesis, ThesisVersion } from '../types';
import { extractThesisMetadata } from '../services/geminiService';
import { getTheses, updateTheses } from '../services/mockData';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X, Users, AlertCircle, HelpCircle, FileCheck } from 'lucide-react';

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
    changeNote: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 3 * 1024 * 1024) {
        alert("For this prototype, please keep PDF files under 3MB to fit in local storage.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleAISuggest = async () => {
    if (!formData.title || !formData.abstract) return;
    setIsUploading(true);
    const result = await extractThesisMetadata(formData.title, formData.abstract);
    if (result?.suggestedDepartment) {
        setFormData(prev => ({ ...prev, department: result.suggestedDepartment }));
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
    
    if (isCollaborative === null) {
      alert("Please specify if this research is collaborative.");
      return;
    }
    if (isCollaborative && !formData.coResearchersRaw.trim()) {
      alert("Please provide the names of your co-researchers.");
      return;
    }

    setIsUploading(true);
    
    try {
      let fileDataUrl = "";
      if (file) {
        fileDataUrl = await readFileAsDataURL(file);
      }

      const all = getTheses();
      const newThesis: Thesis = {
        id: `local_${Date.now()}`,
        authorId: user.id,
        authorName: user.name,
        supervisorName: formData.supervisor || 'Unassigned',
        coResearchers: isCollaborative ? formData.coResearchersRaw.split(',').map(s => s.trim()) : [],
        title: formData.title,
        abstract: formData.abstract,
        department: formData.department || 'General Academic',
        year: new Date().getFullYear().toString(),
        status: ThesisStatus.PENDING,
        submissionDate: new Date().toLocaleDateString(),
        fileUrl: fileDataUrl, // The real Base64 PDF
        fileName: file?.name,
        keywords: [],
        reviews: [],
        versions: []
      };

      const initialVersion: ThesisVersion = {
        id: `v_init_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        title: formData.title,
        abstract: formData.abstract,
        fileName: file?.name,
        fileUrl: fileDataUrl,
        changeNote: formData.changeNote || "Initial institutional submission."
      };
      newThesis.versions = [initialVersion];

      const updated = [...all, newThesis];
      updateTheses(updated);
      
      // Artificial delay for "Institutional Processing" feel
      setTimeout(() => {
        setIsUploading(false);
        setStep(3);
      }, 1500);

    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to process document. Please try a different PDF.");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Institutional Research Submission</h1>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Upload your manuscript and provide required metadata for institutional review.</p>
      </div>

      <div className="flex items-center justify-between mb-16 relative max-w-xl mx-auto">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-100 -z-10 rounded-full"></div>
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white transition-all shadow-md ${
              step >= s ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {s < step ? <CheckCircle2 size={24} /> : s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-dashed border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 shadow-sm hover:border-indigo-300 transition-all duration-500">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-inner shadow-indigo-100/50">
            <Upload size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Upload Research Manuscript</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto text-sm leading-relaxed font-medium">Please upload your finalized thesis in PDF format. Max size 3MB for this prototype.</p>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />
          
          {file ? (
            <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center gap-5 mb-8 border border-slate-200 max-w-md mx-auto shadow-inner group">
              <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100"><FileCheck size={24} /></div>
              <div className="flex-1 text-left truncate">
                <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest mt-1">Ready for Encoding</p>
              </div>
              <button onClick={() => setFile(null)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors bg-white rounded-xl shadow-sm"><X size={20} /></button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-12 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
            >
              Select PDF Document
            </button>
          )}

          {file && (
            <div className="mt-10 pt-10 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="px-16 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all shadow-2xl active:scale-95">
                Proceed to Metadata
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-right-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3 ml-2">Thesis Title</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white outline-none transition-all text-slate-900 font-bold text-lg shadow-inner" placeholder="Enter Full Research Title" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3 ml-2">Research Abstract</label>
              <textarea required rows={5} value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white outline-none transition-all resize-none text-slate-900 text-sm leading-relaxed shadow-inner" placeholder="Summarize methodology and primary objectives..." />
              <button type="button" onClick={handleAISuggest} disabled={!formData.title || !formData.abstract || isUploading} className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100/50 w-fit">
                <Sparkles size={14} /> ScholarAI Assistant: Auto-fill Metadata
              </button>
            </div>
            
            <div className="md:col-span-2 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                    <Users size={18} className="text-indigo-600" />
                    Collaboration Declaration
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">Was this research conducted with partners or co-researchers?</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                  <button 
                    type="button" 
                    onClick={() => setIsCollaborative(true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isCollaborative === true ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Yes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsCollaborative(false)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isCollaborative === false ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    No
                  </button>
                </div>
              </div>

              {isCollaborative && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">List Co-Researchers</label>
                  <input 
                    required={isCollaborative}
                    value={formData.coResearchersRaw} 
                    onChange={e => setFormData({...formData, coResearchersRaw: e.target.value})} 
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-slate-900 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all border-indigo-100" 
                    placeholder="Enter names separated by commas..." 
                  />
                  <p className="mt-2 text-[10px] text-indigo-400 flex items-center gap-1">
                    <AlertCircle size={10} /> Collaboration declaration is mandatory for multi-author research.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3 ml-2">Academic Department</label>
              <input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-900 font-bold focus:bg-white transition-all shadow-inner" placeholder="e.g. Physics" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3 ml-2">Primary Supervisor</label>
              <input required value={formData.supervisor} onChange={e => setFormData({...formData, supervisor: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-900 font-bold focus:bg-white transition-all shadow-inner" placeholder="Dr. Advisor Name" />
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex gap-6">
             <button type="button" onClick={() => setStep(1)} className="px-10 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all shadow-sm">Back</button>
             <button type="submit" disabled={isUploading} className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold hover:bg-indigo-700 flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 transition-all active:scale-95">
                {isUploading ? <Loader2 className="animate-spin" /> : "Commit Research to Ledger"}
             </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="bg-white p-16 rounded-[4rem] border border-slate-200 text-center animate-in zoom-in duration-500 shadow-2xl">
           <div className="w-28 h-28 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-10 ring-[16px] ring-emerald-50/50 shadow-xl shadow-emerald-100/20">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Project Committed</h2>
          <p className="text-slate-500 mb-12 max-w-sm mx-auto leading-relaxed font-medium">Your research document has been successfully encoded and submitted. It is now visible in your Institutional Portfolio.</p>
          <div className="flex flex-col gap-4">
             <button onClick={() => window.location.hash = '#/my-thesis'} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all shadow-2xl active:scale-95">Enter Portfolio</button>
             <button onClick={() => setStep(1)} className="w-full py-5 bg-white text-slate-600 border border-slate-200 rounded-[1.5rem] font-bold hover:bg-slate-50 transition-all">Submit Another Project</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitThesis;
