
import React from 'react';
import { Thesis, ThesisStatus, User } from '../types';
import { Clock, FileText, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, ShieldCheck, UserCheck } from 'lucide-react';

const MySubmissions: React.FC<{ user: User }> = ({ user }) => {
  const history: Thesis[] = [
    {
      id: 's1',
      authorId: user.id,
      authorName: user.name,
      supervisorName: 'Dr. Robert Smith',
      title: 'Advancing Decentralized Finance through Multi-Chain Interoperability Protocols',
      abstract: 'Brief abstract content...',
      department: 'Computer Science',
      year: '2024',
      status: ThesisStatus.UNDER_REVIEW,
      submissionDate: '2024-02-15',
      keywords: ['Blockchain', 'DeFi'],
      reviews: []
    }
  ];

  const statusIcons = {
    [ThesisStatus.PENDING]: <Clock className="text-amber-500" size={18} />,
    [ThesisStatus.UNDER_REVIEW]: <RefreshCw className="text-blue-500 animate-spin-slow" size={18} />,
    [ThesisStatus.REVIEWED]: <ShieldCheck className="text-indigo-500" size={18} />,
    [ThesisStatus.PUBLISHED]: <CheckCircle2 className="text-emerald-500" size={18} />,
    [ThesisStatus.REVISION_REQUIRED]: <AlertCircle className="text-rose-500" size={18} />,
    [ThesisStatus.REJECTED]: <AlertCircle className="text-slate-500" size={18} />,
  };

  const statusBg = {
    [ThesisStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-100',
    [ThesisStatus.UNDER_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-100',
    [ThesisStatus.REVIEWED]: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    [ThesisStatus.PUBLISHED]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    [ThesisStatus.REVISION_REQUIRED]: 'bg-rose-50 text-rose-700 border-rose-100',
    [ThesisStatus.REJECTED]: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Submission History</h1>
          <p className="text-slate-500">Track the progress of your thesis through peer review and administrative approval.</p>
        </div>
      </div>

      <div className="space-y-4">
        {history.map(item => {
          const reviewCount = item.reviews.length;
          // Progress calculation: Submitted (25%), Reviewed (75%), Published (100%)
          const progress = item.status === ThesisStatus.PUBLISHED ? 100 : 
                          item.status === ThesisStatus.REVIEWED || reviewCount >= 1 ? 75 : 25;

          return (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                  <FileText size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${statusBg[item.status]}`}>
                      {statusIcons[item.status]}
                      {item.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
                    <p><strong>Review Status:</strong> {reviewCount} of 1 review completed</p>
                    <p><strong>Department:</strong> {item.department}</p>
                  </div>
                  
                  {/* Granular Tracker */}
                  <div className="mt-4 relative">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-700" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="flex flex-col items-center gap-1 text-emerald-600">
                        <CheckCircle2 size={12} />
                        <span>Submitted</span>
                      </div>
                      <div className={`flex flex-col items-center gap-1 ${reviewCount >= 1 ? 'text-indigo-600' : ''}`}>
                        <ShieldCheck size={12} />
                        <span>Peer Review</span>
                      </div>
                      <div className={`flex flex-col items-center gap-1 ${item.status === ThesisStatus.PUBLISHED ? 'text-indigo-600' : ''}`}>
                        <UserCheck size={12} />
                        <span>Admin Approval</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <button className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-colors">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MySubmissions;
