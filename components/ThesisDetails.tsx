
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Thesis, ThesisStatus, Review, ThesisVersion } from '../types';
import { getTheses, updateTheses } from '../services/mockData';
import { 
  FileText, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  Download,
  ArrowLeft,
  Eye,
  X,
  ShieldCheck,
  Users,
  Scale,
  RotateCcw,
  AlertTriangle,
  History,
  Archive,
  MessageCircle,
  ArrowUpRight,
  FileDown,
  ExternalLink,
  Loader2,
  Maximize2
} from 'lucide-react';

const ThesisDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showReader, setShowReader] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [localThesis, setLocalThesis] = useState<Thesis | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isExternal, setIsExternal] = useState(false);

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
      setIsExternal(!isData && url.startsWith('http'));

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
          console.error("PDF Parsing Error", e);
          setBlobUrl(url);
        }
      } else {
        setBlobUrl(url);
      }
    } else {
      setBlobUrl(null);
    }
  }, [showReader, localThesis?.fileUrl]);

  const openNative = () => {
    if (blobUrl) window.open(blobUrl, '_blank');
  };

  if (!localThesis) {
    return (
      <div className="p-24 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-8">
          <FileText size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Thesis Not Found</h2>
        <Link to="/" className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl mt-6">
          <ArrowLeft size={20} className="mr-2" /> Back to Library
        </Link>
      </div>
    );
  }

  const reviews = localThesis.reviews || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex justify-between items-center">
        <Link to="/my-thesis" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600">
          <ArrowLeft size={18} /> Portfolio Overview
        </Link>
        <div className="flex gap-3">
           <button 
            onClick={() => setShowVersions(!showVersions)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-bold border transition-all ${showVersions ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            <History size={16} /> History
          </button>
          {showReader && (
            <button onClick={() => setShowReader(false)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-bold">
              <X size={16} /> Exit Reader
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className={`flex-1 space-y-8 transition-all duration-700 ${showVersions ? 'lg:w-[62%]' : 'w-full'}`}>
          {!showReader ? (
            <div className={`p-10 rounded-[3.5rem] border shadow-sm bg-white border-slate-200`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                  <div className="space-y-3 flex-1">
                    <div className="px-4 py-1.5 rounded-full text-[10px] font-bold w-fit mb-4 uppercase tracking-widest bg-slate-50 border">
                      {localThesis.status} PHASE
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                      {localThesis.title}
                    </h1>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {localThesis.fileUrl && (
                      <button 
                        onClick={() => setShowReader(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl"
                      >
                        <Eye size={20} /> Open Manuscript
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border"><UserIcon size={20} /></div>
                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Investigator</p><p className="text-sm font-bold text-slate-800">{localThesis.authorName}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border"><Calendar size={20} /></div>
                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Submitted</p><p className="text-sm font-bold text-slate-800">{localThesis.submissionDate}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border"><ShieldCheck size={20} /></div>
                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Supervisor</p><p className="text-sm font-bold text-slate-800">{localThesis.supervisorName}</p></div>
                  </div>
                </div>
              </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in duration-500">
              <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg"><FileText size={18} /></div>
                  <h3 className="text-sm font-bold text-slate-800 truncate max-w-sm">{localThesis.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={openNative} className="p-2 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2">
                    <Maximize2 size={16} /> Fullscreen Reader
                  </button>
                  <button onClick={() => setShowReader(false)} className="p-2 bg-white border rounded-full text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 relative overflow-hidden">
                {isExternal ? (
                  <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6">
                      <AlertTriangle size={40} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Security Block: External Source</h4>
                    <p className="text-slate-500 text-sm max-w-sm mb-8">This document is hosted on an external server ({new URL(localThesis.fileUrl!).hostname}) which prevents embedded viewing for security reasons.</p>
                    <a href={localThesis.fileUrl} target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl flex items-center gap-3">
                      <ExternalLink size={20} /> Open Original Document
                    </a>
                  </div>
                ) : blobUrl ? (
                  <iframe 
                    key={blobUrl}
                    src={blobUrl} 
                    className="w-full h-full border-none bg-white" 
                    title="Manuscript Reader"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full flex-col gap-4 text-slate-400">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-xs font-bold uppercase">Preparing Manuscript Engine...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!showReader && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                   <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3"><FileText size={24} className="text-indigo-600" /> Abstract</h2>
                   <p className="text-slate-600 leading-relaxed text-sm italic">{localThesis.abstract}</p>
                 </div>
                 <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                   <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3"><ShieldCheck size={24} className="text-indigo-600" /> Reviews</h2>
                   <div className="space-y-4">
                     {reviews.length > 0 ? reviews.map((rev) => (
                       <div key={rev.id} className="p-4 rounded-2xl border bg-slate-50">
                         <div className="flex justify-between mb-2">
                           <span className="text-[10px] font-bold uppercase">{rev.reviewerName}</span>
                           <span className="text-[9px] font-extrabold text-indigo-600">{rev.recommendation}</span>
                         </div>
                         <p className="text-xs text-slate-500 italic">"{rev.comment}"</p>
                       </div>
                     )) : <p className="text-center py-10 text-xs text-slate-400 uppercase font-bold tracking-widest">No Records</p>}
                   </div>
                 </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThesisDetails;
