
import React, { useState, useRef } from 'react';
import { User, ThesisStatus, Thesis, ThesisVersion } from '../types';
import { extractThesisMetadata } from '../services/geminiService';
import { getTheses, updateTheses } from '../services/mockData';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X, Users, AlertCircle, FileCheck } from 'lucide-react';

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
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("Institutional limit exceeded: PDF manuscripts must be under 10MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleAISuggest = async () => {
    if (!formData.title || !formData.abstract) return;
    setIsUploading(true);
    const result = await extractThesisMetadata(formData.title, formData.abstract);
    if (result) {
        setFormData(prev => ({ 
          ...prev, 
          department: result.suggestedDepartment || prev.department,
        }));
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
      }, 1800);

    } catch (err) {
      alert("Institutional verification failed. Ensure your manuscript is a sanitized PDF.");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-12 text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manuscript Ingress</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed text-lg">Initiate your scholarly record by indexing your manuscript for peer evaluation.</p>
      </div>

      <div className="flex items-center justify-between mb-20 relative max-w-lg mx-auto">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-3 relative">
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-bold border-[6px] border-slate-50 transition-all shadow-xl ${step >= s ? 'bg-indigo-600 text-white scale-110' : 'bg-white text-slate-300'}`}>
              {s < step ? <CheckCircle2 size={28} /> : s}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest absolute -bottom-8 whitespace-nowrap ${step >= s ? 'text-indigo-600' : 'text-slate-300'}`}>
              {s === 1 ? 'Manuscript Ingress' : s === 2 ? 'Scholarly Metadata' : 'Verification'}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white p-14 rounded-[4rem] border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-6 shadow-sm">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mx-auto mb-10 shadow-inner">
            <Upload size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Upload Research Manuscript</h2>
          <p className="text-slate-500 mb-12 max-w-sm mx-auto text-sm font-medium leading-relaxed">Documents must strictly adhere to the Institutional Publication Guidelines (PDF Format).</p>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />
          
          {file ? (
            <div className="bg-slate-50 p-8 rounded-[2.5rem] flex items-center gap-6 mb-10 border border-slate-100 max-w-md mx-auto shadow-inner group">
              <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-50"><FileCheck size={28} /></div>
              <div className="flex-1 text-left truncate">
                <p className="text-sm font-extrabold text-slate-800 truncate mb-1">{file.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">Validated Integrity</p>
              </div>
              <button onClick={() => setFile(null)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors bg-white rounded-xl shadow-sm"><X size={20} /></button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-14 py-5 bg-indigo-600 text-white rounded-[2rem] font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 text-lg"
            >
              Select Manuscript for Ingress
            </button>
          )}

          {file && (
            <div className="mt-12 pt-10 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-bold hover:bg-slate-800 transition-all shadow-2xl active:scale-95 text-lg">
                Proceed to Metadata Evaluation
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-10 bg-white p-14 rounded-[4rem] border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-right-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Manuscript Title</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white outline-none transition-all text-slate-900 font-extrabold text-xl shadow-inner focus:ring-4 focus:ring-indigo-50" placeholder="A Comprehensive Analysis of..." />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Scholarly Abstract</label>
              <textarea required rows={5} value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:bg-white outline-none transition-all resize-none text-slate-700 text-sm leading-relaxed shadow-inner focus:ring-4 focus:ring-indigo-50" placeholder="Define research scope, core methodologies, and expected outcomes..." />
              <button type="button" onClick={handleAISuggest} disabled={!formData.title || !formData.abstract || isUploading} className="mt-5 flex items-center gap-2 text-[10px] font-extrabold text-indigo-600 bg-indigo-50/50 px-5 py-2.5 rounded-xl border border-indigo-100/50 hover:bg-indigo-100 transition-colors uppercase tracking-widest disabled:opacity-30">
                <Sparkles size={16} /> ScholarAI: Optimize Scholarly Metadata
              </button>
            </div>
            
            <div className="md:col-span-2 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-base font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
                    <Users size={20} className="text-indigo-600" />
                    Collaboration Taxonomy
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Declare if this research includes institutional co-investigators.</p>
               </div>
               <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border">
                  <button type="button" onClick={() => setIsCollaborative(true)} className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${isCollaborative === true ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Collaborative</button>
                  <button type="button" onClick={() => setIsCollaborative(false)} className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${isCollaborative === false ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Independent</button>
               </div>
            </div>

            {isCollaborative && (
              <div className="md:col-span-2 animate-in slide-in-from-top-4 duration-500">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Identify Co-Investigators</label>
                <input required={isCollaborative} value={formData.coResearchersRaw} onChange={e => setFormData({...formData, coResearchersRaw: e.target.value})} className="w-full px-8 py-5 bg-white border-2 border-indigo-50 rounded-2xl text-slate-900 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all" placeholder="Enter full scholarly names..." />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Academic Discipline</label>
              <input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-800 font-bold focus:bg-white shadow-inner transition-all" placeholder="e.g., Quantum Computing" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Faculty Advisor</label>
              <input required value={formData.supervisor} onChange={e => setFormData({...formData, supervisor: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-800 font-bold focus:bg-white shadow-inner transition-all" placeholder="Dr. Name" />
            </div>
          </div>

          <div className="pt-12 border-t border-slate-50 flex gap-6">
             <button type="button" onClick={() => setStep(1)} className="px-12 py-5 bg-slate-50 text-slate-500 rounded-[2rem] font-bold hover:bg-slate-100 transition-all shadow-sm">Review Manuscript</button>
             <button type="submit" disabled={isUploading} className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-bold hover:bg-indigo-700 flex items-center justify-center gap-4 shadow-2xl shadow-indigo-100 transition-all active:scale-95 text-lg">
                {isUploading ? <Loader2 className="animate-spin" /> : <><FileCheck size={24} /> Commit to Peer Review</>}
             </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="bg-white p-20 rounded-[4rem] border border-slate-200 text-center animate-in zoom-in duration-700 shadow-2xl">
           <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-12 ring-[20px] ring-emerald-50/50 shadow-2xl shadow-emerald-100">
            <CheckCircle2 size={64} />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Institutional Ingress Successful</h2>
          <p className="text-slate-500 mb-14 max-w-sm mx-auto leading-relaxed text-lg font-medium">Your manuscript has been successfully indexed and has entered the Faculty Evaluation Queue.</p>
          <div className="flex flex-col gap-4 max-w-md mx-auto">
             <button onClick={() => window.location.hash = '#/my-thesis'} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-extrabold hover:bg-slate-800 transition-all shadow-2xl active:scale-95">Open Scholarly Portfolio</button>
             <button onClick={() => setStep(1)} className="w-full py-5 bg-white text-slate-500 border border-slate-200 rounded-[2rem] font-extrabold hover:bg-slate-50 transition-all">Submit Additional Record</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitThesis;
