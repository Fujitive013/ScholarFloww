
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Thesis, ThesisStatus } from '../types';
import { summarizeThesis } from '../services/geminiService';
import { getTheses } from '../services/mockData';
import { Download, ExternalLink, Calendar, User, Filter, Sparkles, Loader2, SearchX } from 'lucide-react';

interface LibraryViewProps {
  searchQuery?: string;
}

const LibraryView: React.FC<LibraryViewProps> = ({ searchQuery = '' }) => {
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
    const matchesSearch = !searchLower || (
      t.title.toLowerCase().includes(searchLower) ||
      t.authorName.toLowerCase().includes(searchLower) ||
      t.abstract.toLowerCase().includes(searchLower) ||
      t.keywords.some(kw => kw.toLowerCase().includes(searchLower))
    );
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Repository</h1>
          <p className="text-slate-500 mt-1">Discover peer-reviewed excellence across our global academic community.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="text-sm bg-transparent outline-none font-bold text-slate-600"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Psychology">Psychology</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100/50 w-fit">
          <span className="font-medium">Showing results for:</span>
          <span className="font-bold text-indigo-600 italic">"{searchQuery}"</span>
          <span className="text-slate-300 mx-1">|</span>
          <span className="text-xs">{filtered.length} found</span>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filtered.map((thesis) => (
            <div key={thesis.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                  {thesis.department}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSummarize(thesis)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 bg-white border border-indigo-100 rounded-xl transition-all shadow-sm flex items-center gap-2 px-3"
                  >
                    <Sparkles size={16} />
                    <span className="text-[10px] font-bold uppercase">AI Summary</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-4 leading-tight">
                {thesis.title}
              </h3>
              
              <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                "{thesis.abstract}"
              </p>

              {summaries[thesis.id] && (
                <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">ScholarAI Summary</span>
                  </div>
                  {summaries[thesis.id].loading ? (
                    <div className="flex items-center gap-2 text-xs text-indigo-400">
                      <Loader2 className="animate-spin" size={14} /> Analyzing abstract...
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {summaries[thesis.id].text}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg"><User size={14} className="text-slate-400" /></div>
                  <span className="text-xs font-bold text-slate-700">{thesis.authorName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg"><Calendar size={14} className="text-slate-400" /></div>
                  <span className="text-xs font-bold text-slate-700">{thesis.year} Submission</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {(thesis.keywords || []).map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
                    #{kw}
                  </span>
                ))}
                <Link 
                  to={`/thesis/${thesis.id}`}
                  className="ml-auto flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View Publication <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-inner">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <SearchX size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No matches found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            We couldn't find any thesis matching your current search and filters. Try adjusting your keywords or department.
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
