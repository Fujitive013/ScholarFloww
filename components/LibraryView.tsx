
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Thesis, ThesisStatus } from '../types';
import { summarizeThesis } from '../services/geminiService';
import { getTheses } from '../services/mockData';
import { Library, Download, ExternalLink, Calendar, User, Filter, Sparkles, Loader2, SearchX, Bookmark } from 'lucide-react';

interface LibraryViewProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ searchQuery = '', setSearchQuery }) => {
  const [filterDept, setFilterDept] = useState('All');
  const [summaries, setSummaries] = useState<Record<string, { text: string; loading: boolean }>>({});
  const [theses, setTheses] = useState<Thesis[]>([]);

  useEffect(() => {
    const load = () => {
      const all = getTheses();
      setTheses(all.filter(t => t.status === ThesisStatus.PUBLISHED));
    };
    load();
    window.addEventListener('thesesUpdated', load);
    return () => window.removeEventListener('thesesUpdated', load);
  }, []);

  const handleSummarize = async (thesis: Thesis) => {
    setSummaries(prev => ({ ...prev, [thesis.id]: { text: '', loading: true } }));
    const summaryText = await summarizeThesis(thesis);
    setSummaries(prev => ({ ...prev, [thesis.id]: { text: summaryText, loading: false } }));
  };

  const filtered = theses.filter((t) => {
    const matchesDept = filterDept === 'All' || t.department === filterDept;
    const searchLower = searchQuery.toLowerCase().trim();
    return matchesDept && (!searchLower || (
      t.title.toLowerCase().includes(searchLower) ||
      t.authorName.toLowerCase().includes(searchLower) ||
      t.abstract.toLowerCase().includes(searchLower)
    ));
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-3 text-indigo-900">
            <Library size={24} className="shrink-0" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight italic leading-tight">Stellaris Digital Repository</h1>
          </div>
          <p className="text-slate-500 font-medium text-base sm:text-lg">Official University archive of approved scholarly manuscripts and research excellence.</p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Filter size={18} className="text-slate-400 shrink-0" />
            <select 
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="text-xs sm:text-sm bg-transparent outline-none font-bold text-slate-700 cursor-pointer w-full lg:min-w-[180px]"
            >
              <option value="All">All University Faculties</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Philosophy">Philosophy</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {filtered.map((thesis) => (
            <div key={thesis.id} className="group bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-bl-[100px] -mr-10 -mt-10 group-hover:bg-indigo-900/5 transition-all"></div>
              
              <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10">
                <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-indigo-50 text-indigo-900 rounded-xl text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest border border-indigo-100">
                  {thesis.department}
                </span>
                <div className="flex gap-1 sm:gap-2">
                  <button className="p-2 text-slate-300 hover:text-indigo-900 transition-colors"><Bookmark size={20} /></button>
                  <button className="p-2 text-slate-300 hover:text-indigo-900 transition-colors"><Download size={20} /></button>
                </div>
              </div>
              
              <Link to={`/thesis/${thesis.id}`} className="block group/title relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover/title:text-indigo-900 transition-colors mb-4 sm:mb-6 leading-tight line-clamp-2">
                  {thesis.title}
                </h3>
              </Link>
              
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 line-clamp-3 italic opacity-80 pl-4 border-l-2 border-slate-100">
                "{thesis.abstract}"
              </p>

              {summaries[thesis.id] && (
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl sm:rounded-[2.5rem] animate-in slide-in-from-top-4 relative overflow-hidden shadow-inner">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={40} className="text-indigo-900" /></div>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3 text-indigo-900">
                    <Sparkles size={16} />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Stellaris AI Synopsis</span>
                  </div>
                  {summaries[thesis.id].loading ? (
                    <div className="flex items-center gap-3 text-xs text-indigo-400 font-bold">
                      <Loader2 className="animate-spin" size={16} /> <span className="text-[10px] sm:text-xs">Synthesizing...</span>
                    </div>
                  ) : (
                    <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-semibold pr-4">
                      {summaries[thesis.id].text}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-auto pt-6 sm:pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><User size={14} /></div>
                  <div className="truncate">
                    <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">Stellaris Scholar</p>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">{thesis.authorName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><Calendar size={14} /></div>
                  <div className="truncate">
                    <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">Archive Year</p>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-800">{thesis.year}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full sm:w-auto">
                   {(thesis.keywords || []).slice(0, 3).map((kw, i) => (
                    <span key={i} className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tight">#{kw}</span>
                  ))}
                </div>
                <div className="flex gap-4 w-full sm:w-auto justify-center sm:justify-end">
                   <button 
                    onClick={() => handleSummarize(thesis)}
                    className="flex items-center gap-2 text-[10px] font-bold text-indigo-900 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                  >
                    <Sparkles size={14} /> AI Synthesis
                  </button>
                  <Link 
                    to={`/thesis/${thesis.id}`}
                    className="flex items-center gap-2 text-[10px] font-bold text-slate-800 uppercase tracking-widest hover:text-indigo-900 transition-all group/link"
                  >
                    View Record <ExternalLink size={14} className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center bg-white rounded-3xl sm:rounded-[4rem] border border-slate-200 shadow-inner px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 sm:mb-8 border border-slate-100">
            <SearchX size={48} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Internal Records Not Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-3 font-medium leading-relaxed text-sm">No scholarly records match your faculty search within the university repository.</p>
          <button onClick={() => {setSearchQuery?.(''); setFilterDept('All')}} className="mt-8 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl transition-all active:scale-95">Clear Facet Filters</button>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
