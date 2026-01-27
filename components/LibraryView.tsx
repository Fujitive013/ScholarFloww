
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Thesis, ThesisStatus } from '../types';
import { summarizeThesis } from '../services/geminiService';
import { getTheses } from '../services/mockData';
import { Library, Download, ExternalLink, Calendar, User, Filter, Sparkles, Loader2, SearchX, Bookmark, ChevronRight } from 'lucide-react';

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

  const handleSummarize = async (e: React.MouseEvent, thesis: Thesis) => {
    e.preventDefault();
    e.stopPropagation();
    setSummaries(prev => ({ ...prev, [thesis.id]: { text: '', loading: true } }));
    const summaryText = await summarizeThesis(thesis);
    setSummaries(prev => ({ ...prev, [thesis.id]: { text: summaryText, loading: false } }));
  };

  const filtered = theses.filter((t) => {
    const matchesDept = filterDept === 'All' || t.department === filterDept;
    const searchLower = searchQuery.toLowerCase().trim();
    return matchesDept && (!searchLower || (
      t.title.toLowerCase().includes(searchLower) ||
      t.authorName.toLowerCase().includes(searchLower)
    ));
  });

  const departments = ['All', 'Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Philosophy'];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-indigo-900 mb-1">
            <Library size={28} className="shrink-0" />
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">University Repository</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-2xl">
            Access the official archive of Stellaris research excellence and verified scholarly records.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                filterDept === dept 
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-md' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((thesis) => (
            <Link 
              key={thesis.id} 
              to={`/thesis/${thesis.id}`}
              className="group bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-900 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                  {thesis.department}
                </span>
                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                  <Bookmark size={20} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {thesis.title}
              </h3>

              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-center gap-3 text-slate-500">
                  <User size={16} />
                  <span className="text-sm font-medium">{thesis.authorName}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">{thesis.year}</span>
                </div>
              </div>

              {summaries[thesis.id] && (
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI Synopsis</span>
                  </div>
                  {summaries[thesis.id].loading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 size={14} className="animate-spin" /> Analyzing...
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-3">
                      {summaries[thesis.id].text}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <button 
                  onClick={(e) => handleSummarize(e, thesis)}
                  className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                >
                  <Sparkles size={14} /> Summarize
                </button>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                  View Record <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
          <SearchX size={48} className="text-slate-200 mb-6" />
          <h3 className="text-xl font-bold text-slate-800">No records found</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            We couldn't find any published manuscripts matching your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
