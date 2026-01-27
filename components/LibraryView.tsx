
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
    <div className="space-y-10 pb-20">
      {/* Dynamic Header & Filter Group */}
      <div className="flex flex-col gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-indigo-900 mb-2">
            <div className="p-3 bg-indigo-900 text-white rounded-2xl shadow-xl"><Library size={24} /></div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">University Repository</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-2xl text-sm sm:text-base leading-relaxed">
            Access the sanctioned archive of Stellaris research excellence and verified scholarly records for institutional advancement.
          </p>
        </div>

        {/* Scalable Filter System (Wrapping chips, no horizontal scroll) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
            <Filter size={14} /> Filter by Discipline
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-5 py-2.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all border shadow-sm ${
                  filterDept === dept 
                  ? 'bg-indigo-900 text-white border-indigo-900 shadow-indigo-100 scale-105' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 active:scale-95'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Result Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in duration-700">
          {filtered.map((thesis) => (
            <Link 
              key={thesis.id} 
              to={`/thesis/${thesis.id}`}
              className="group bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col hover:shadow-2xl hover:border-indigo-200 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-900 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] border border-indigo-100 shadow-sm">
                  {thesis.department}
                </span>
                <button className="p-2.5 text-slate-300 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl group-hover:bg-indigo-50">
                  <Bookmark size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-900 leading-snug mb-6 group-hover:text-indigo-700 transition-colors line-clamp-2">
                {thesis.title}
              </h3>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors"><User size={16} /></div>
                  <span className="text-sm font-bold">{thesis.authorName}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors"><Calendar size={16} /></div>
                  <span className="text-sm font-bold">{thesis.year}</span>
                </div>
              </div>

              {summaries[thesis.id] && (
                <div className="mb-8 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2 mb-3 text-indigo-600">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">ScholarAI Synopsis</span>
                  </div>
                  {summaries[thesis.id].loading ? (
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold italic">
                      <Loader2 size={16} className="animate-spin" /> Synthesizing abstract...
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium italic line-clamp-4">
                      {summaries[thesis.id].text}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between mt-auto">
                <button 
                  onClick={(e) => handleSummarize(e, thesis)}
                  className="flex items-center gap-2 text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-all hover:scale-105"
                >
                  <Sparkles size={16} /> Summarize
                </button>
                <span className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-all">
                  Open Record <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-200 shadow-inner flex flex-col items-center animate-in zoom-in-95">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8"><SearchX size={56} /></div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">No records discovered</h3>
          <p className="text-slate-500 mt-2 max-w-sm font-medium">
            We couldn't find any published manuscripts matching your search or discipline filters.
          </p>
          <button onClick={() => setFilterDept('All')} className="mt-10 px-10 py-4 bg-indigo-900 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all">
            Clear Discipline Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
