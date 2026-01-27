
import React, { useState } from 'react';
import { analyzeThesisIdea, refineTitle } from '../services/geminiService';
import { Sparkles, Send, Loader2, BookOpen, Search, Info, CheckCircle2 } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [refinedTitles, setRefinedTitles] = useState<string[]>([]);

  const handleAnalyze = async () => {
    if (!title || !abstract) return;
    setLoading(true);
    const result = await analyzeThesisIdea(title, abstract);
    setAnalysis(result);
    setLoading(false);
  };

  const handleRefineTitle = async () => {
    if (!title) return;
    setLoading(true);
    const results = await refineTitle(title);
    setRefinedTitles(results);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold gap-2 mb-2">
          <Sparkles size={14} />
          POWERED BY GEMINI AI
        </div>
        <h1 className="text-3xl font-bold text-slate-900">ScholarAI Research Assistant</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Input your thesis ideas to get academic feedback, structural suggestions, and title refinements in seconds.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              Draft Thesis Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thesis Title</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., The impact of AI on small business accounting..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Brief Abstract</label>
                <textarea 
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  rows={6}
                  placeholder="Summarize your research goal, methodology, and expected outcomes..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-800 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleAnalyze}
                disabled={loading || !title || !abstract}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                Analyze Proposal
              </button>
              <button 
                onClick={handleRefineTitle}
                disabled={loading || !title}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 disabled:opacity-50 transition-all"
              >
                Refine Title
              </button>
            </div>
          </div>

          {refinedTitles.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Suggested Variations
              </h3>
              <ul className="space-y-3">
                {refinedTitles.map((t, i) => (
                  <li key={i} className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100 italic">
                    "{t}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {analysis ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-2">Initial Feedback</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{analysis.feedback}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Core Research Questions</h3>
                <div className="grid grid-cols-1 gap-3">
                  {analysis.researchQuestions?.map((q: string, i: number) => (
                    <div key={i} className="flex gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">{i+1}</div>
                      <p className="text-sm text-slate-700 font-medium">{q}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-3">Key Literature Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords?.map((k: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                      #{k}
                    </span>
                  ))}
                </div>
              </div>

              {analysis.suggestions && (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                   <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <Info size={18} />
                    Suggestions for Improvement
                  </h3>
                  <p className="text-amber-900/80 text-sm italic">{analysis.suggestions}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                <Sparkles size={32} />
              </div>
              <h3 className="font-semibold text-slate-800">No Analysis Yet</h3>
              <p className="text-sm text-slate-500 max-w-[250px] mt-2">
                Enter your thesis details and click analyze to get started with ScholarAI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
