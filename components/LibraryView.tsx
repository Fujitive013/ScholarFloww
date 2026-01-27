
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Thesis, ThesisStatus } from '../types';
import { summarizeThesis } from '../services/geminiService';
import { getTheses } from '../services/mockData';
import { Library, User, Calendar, Bookmark, ChevronRight, Sparkles, Loader2, SearchX, Filter } from 'lucide-react';

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

  const departments = ['All', 'Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Philosophy', 'Data Science'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-900">
            <Library size={20} />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">University Repository</h1>
          </div>
          <p className="text-slate-500 text-xs font-medium max-w-xl">
            Institutional archive of Stellaris research excellence.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <Filter size={12} /> Filter
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border shadow-sm ${
                  filterDept === dept 
                  ? 'bg-indigo-900 text-white border-indigo-900' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 active:scale-95'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((thesis) => (
            <Link 
              key={thesis.id} 
              to={`/thesis/${thesis.id}`}
              className="group bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-lg hover:border-indigo-100 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-900 rounded-md text-[9px] font-bold uppercase tracking-widest border border-indigo-50">
                  {thesis.department}
                </span>
                <button className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors">
                  <Bookmark size={16} />
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {thesis.title}
              </h3>

              <div className="space-y-2.5 mb-5 flex-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <User size={14} className="text-slate-300" />
                  <span className="text-xs font-medium">{thesis.authorName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={14} className="text-slate-300" />
                  <span className="text-xs font-medium">{thesis.year}</span>
                </div>
              </div>

              {summaries[thesis.id] && (
                <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1.5 text-indigo-600">
                    <Sparkles size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">ScholarAI</span>
                  </div>
                  {summaries[thesis.id].loading ? (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold italic">
                      <Loader2 size={12} className="animate-spin" /> Synthesizing...
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-600 leading-normal italic line-clamp-3">
                      {summaries[thesis.id].text}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <button 
                  onClick={(e) => handleSummarize(e, thesis)}
                  className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800"
                >
                  <Sparkles size={12} /> Summarize
                </button>
                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">
                  View <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-inner flex flex-col items-center">
          <SearchX size={40} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No records discovered</h3>
          <p className="text-slate-500 mt-1 max-w-sm text-xs">
            Refine your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
