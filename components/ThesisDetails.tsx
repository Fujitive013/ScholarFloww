
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Thesis, ThesisStatus, Review, ThesisVersion } from '../types';
import { getTheses, updateTheses } from '../services/mockData';
import { 
  FileText, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Eye,
  X,
  ShieldCheck,
  History,
  AlertTriangle,
  Loader2,
  Maximize2,
  Upload,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ThesisDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showReader, setShowReader] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [localThesis, setLocalThesis] = useState<Thesis | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  
  // Revision Form State
  const [revFile, setRevFile] = useState<File | null>(null);
  const [revNote, setRevNote] = useState('');
  const [isSubmittingRev, setIsSubmittingRev] = useState(false);
  const revFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      const found = all.find(t => t.id === id);
      if (found) setLocalThesis(found);
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, [id]);

  useEffect(() => {
    if (showReader && localThesis?.fileUrl) {
      const url = localThesis.fileUrl;
      const isData = url.startsWith('data:');
      if (isData) {
        try {
          const base64Content = url.split(',')[1];
          const byteCharacters = atob(base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          return () => URL.revokeObjectURL(objectUrl);
        } catch (e) {
          setBlobUrl(url);
        }
      } else {
        setBlobUrl(url);
      }
    }
  }, [showReader, localThesis?.fileUrl]);

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revFile || !localThesis) return;
    setIsSubmittingRev(true);

    try {
      const fileDataUrl = await (new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(revFile);
      }));

      const newVersion: ThesisVersion = {
        id: `v${(localThesis.versions?.length || 0) + 1}_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        title: localThesis.title,
        abstract: localThesis.abstract,
        fileName: revFile.name,
        fileUrl: fileDataUrl,
        changeNote: revNote
      };

      const all = getTheses();
      const updated = all.map(t => t.id === localThesis.id ? {
        ...t,
        status: ThesisStatus.UNDER_REVIEW,
        fileUrl: fileDataUrl,
        fileName: revFile.name,
        versions: [...(t.versions || []), newVersion]
      } : t);

      updateTheses(updated);
      setIsSubmittingRev(false);
      setShowRevisionForm(false);
      setRevFile(null);
      setRevNote('');
      alert("Revision submitted. Manuscript status reset to Under Review.");
    } catch (err) {
      setIsSubmittingRev(false);
      alert("Revision upload failed.");
    }
  };

  if (!localThesis) return <div className="p-12 text-center text-slate-400">Loading record...</div>;

  const reviews = localThesis.reviews || [];
  const latestReview = reviews[reviews.length - 1];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header Navigation */}
      <div className="flex justify-between items-center">
        <Link to="/my-thesis" className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowVersions(!showVersions)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${showVersions ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            <History size={14} /> {showVersions ? 'Close History' : 'Version History'}
          </button>
        </div>
      </div>

      {/* Critical Status Banners */}
      {localThesis.status === ThesisStatus.REVISION_REQUIRED && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3 text-amber-800">
            <div className="p-2 bg-white rounded-lg shadow-sm"><AlertCircle size={20} className="text-amber-600" /></div>
            <div>
              <p className="text-xs font-bold">Action Required: Revision Requested</p>
              <p className="text-[10px] opacity-80">Faculty has requested updates. Please review comments and upload a new version.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowRevisionForm(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-amber-700 transition-all shadow-md"
          >
            Submit Revision
          </button>
        </div>
      )}

      {localThesis.status === ThesisStatus.REJECTED && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-800">
          <div className="p-2 bg-white rounded-lg shadow-sm"><AlertTriangle size={20} className="text-rose-600" /></div>
          <div>
            <p className="text-xs font-bold">Manuscript Rejected</p>
            <p className="text-[10px] opacity-80">This research path was not sanctioned for publication. Consult your supervisor for next steps.</p>
          </div>
        </div>
      )}

      {/* Main Content Split */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Record Summary Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                  localThesis.status === ThesisStatus.PUBLISHED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  localThesis.status === ThesisStatus.REVISION_REQUIRED ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                  {localThesis.status.replace('_', ' ')}
                </span>
             </div>

             <div className="space-y-4 mb-10">
                <p className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest">Master Archive Record</p>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight pr-20">{localThesis.title}</h1>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                <InfoItem icon={<UserIcon size={14} />} label="Author" value={localThesis.authorName} />
                <InfoItem icon={<ShieldCheck size={14} />} label="Supervisor" value={localThesis.supervisorName} />
                <InfoItem icon={<Calendar size={14} />} label="Submitted" value={localThesis.submissionDate} />
             </div>

             <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-4">
                <button onClick={() => setShowReader(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-slate-900 transition-all shadow-lg">
                  <Eye size={16} /> Open Document
                </button>
                {localThesis.fileUrl && (
                  <a href={localThesis.fileUrl} download={localThesis.fileName} className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-colors">
                    <Upload className="rotate-180" size={18} />
                  </a>
                )}
             </div>
          </div>

          {/* Feedback & Abstract Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-600" /> Research Abstract
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed italic">{localThesis.abstract}</p>
             </div>
             
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600" /> Evaluation Logs
                </h3>
                {reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold text-slate-800">{rev.reviewerName}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            rev.recommendation === 'APPROVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>{rev.recommendation}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">Awaiting Faculty Review</div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar panels */}
        {showVersions && (
          <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4 animate-in slide-in-from-right-4">
             <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Version Stack</h3>
             <div className="space-y-3">
                {localThesis.versions?.slice().reverse().map((v, i) => (
                  <div key={v.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-indigo-600">v{localThesis.versions!.length - i}</span>
                      <span className="text-[8px] text-slate-400">{v.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-slate-800 font-bold mb-1 truncate">{v.fileName || 'Untitled Manuscript'}</p>
                    {v.changeNote && <p className="text-[9px] text-slate-500 italic">"{v.changeNote}"</p>}
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Revision Form Overlay */}
      {showRevisionForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2"><History size={18} /> Revision Submission</h3>
              <button onClick={() => setShowRevisionForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRevisionSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload New PDF</label>
                <div 
                  onClick={() => revFileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-100 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-300 hover:bg-white transition-all group"
                >
                  <input type="file" ref={revFileInputRef} className="hidden" accept="application/pdf" onChange={(e) => setRevFile(e.target.files?.[0] || null)} />
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Upload size={20} className="text-indigo-600" /></div>
                  <p className="text-[10px] font-bold text-slate-500">{revFile ? revFile.name : 'Click to select new manuscript file'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revision Summary / Change Note</label>
                <textarea 
                  required
                  rows={4}
                  value={revNote}
                  onChange={(e) => setRevNote(e.target.value)}
                  placeholder="Summarize the changes made based on faculty feedback..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-600 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRevisionForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase">Cancel</button>
                <button 
                  type="submit" 
                  disabled={!revFile || !revNote || isSubmittingRev}
                  className="flex-1 py-3 bg-indigo-900 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingRev ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Commit Version</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reader Modal */}
      {showReader && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2"><Maximize2 size={16} /> Manuscript Reader</h3>
              <button onClick={() => setShowReader(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <div className="flex-1 bg-slate-100 relative">
              {blobUrl ? (
                <iframe src={blobUrl} className="w-full h-full border-none bg-white" title="Reader" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Loader2 className="animate-spin" />
                  <p className="text-[10px] font-bold uppercase">Synthesizing Ingress...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-slate-50 rounded-xl text-slate-400 border border-slate-50">{icon}</div>
    <div>
      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-800 leading-none">{value}</p>
    </div>
  </div>
);

export default ThesisDetails;
