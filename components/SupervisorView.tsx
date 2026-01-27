
import React from 'react';
import { Users, FileCheck, AlertCircle, Search, Filter, MoreVertical, ExternalLink } from 'lucide-react';

const SupervisorView: React.FC = () => {
  const students = [
    { id: '1', name: 'Jane Doe', topic: 'Decentralized Finance Interoperability', progress: 65, status: 'Active', avatar: 'https://picsum.photos/seed/jane/200', lastAction: 'Submitted Lit Review' },
    { id: '2', name: 'Mark Wilson', topic: 'ML in Supply Chain Management', progress: 30, status: 'At Risk', avatar: 'https://picsum.photos/seed/mark/200', lastAction: 'No activity for 2 weeks' },
    { id: '3', name: 'Sarah Chen', topic: 'Quantum Cryptography Protocols', progress: 85, status: 'Review', avatar: 'https://picsum.photos/seed/sarah/200', lastAction: 'Ready for full draft' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thesis Supervision Dashboard</h1>
          <p className="text-slate-500">You are supervising 3 students across 2 departments.</p>
        </div>
        <button className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
          Add New Student
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatSummary icon={<Users size={20} />} label="Total Students" value="03" sub="Academic Cohort" />
        <StatSummary icon={<FileCheck size={20} />} label="Awaiting Review" value="02" sub="Pending Faculty Action" color="emerald" />
        <StatSummary icon={<AlertCircle size={20} />} label="At Risk" value="01" sub="Urgent Support Required" color="rose" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-bold text-slate-800">Assigned Students</h2>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                placeholder="Search students..."
                className="w-full md:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thesis Topic</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} className="w-10 h-10 rounded-full border border-slate-200" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{student.lastAction}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 font-medium max-w-xs truncate">{student.topic}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="mx-auto w-32 space-y-1.5">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                        <span>{student.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${student.status === 'At Risk' ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      student.status === 'At Risk' ? 'bg-rose-100 text-rose-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg transition-colors"><ExternalLink size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg transition-colors"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="md:hidden divide-y divide-slate-100">
          {students.map((student) => (
            <div key={student.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={student.avatar} className="w-12 h-12 rounded-full border" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{student.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{student.lastAction}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                  student.status === 'At Risk' ? 'bg-rose-100 text-rose-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {student.status}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-snug">{student.topic}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                  <span>Course Progress</span>
                  <span>{student.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-indigo-600`} style={{ width: `${student.progress}%` }}></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200">Review</button>
                <button className="px-3 py-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-200"><ExternalLink size={16} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-widest">Load More Scholars</button>
        </div>
      </div>
    </div>
  );
};

const StatSummary = ({ icon, label, value, sub, color = 'indigo' }: any) => {
  const colorMap: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600'
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>{icon}</div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
      <p className="text-[10px] text-slate-500 mt-1 font-medium">{sub}</p>
    </div>
  );
};

export default SupervisorView;
