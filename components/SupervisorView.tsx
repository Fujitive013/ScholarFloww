
import React from 'react';
import { Users, FileCheck, AlertCircle, Search, Filter, MoreVertical, ExternalLink } from 'lucide-react';

const SupervisorView: React.FC = () => {
  const students = [
    { id: '1', name: 'Jane Doe', topic: 'Decentralized Finance Interoperability', progress: 65, status: 'Active', avatar: 'https://picsum.photos/seed/jane/200', lastAction: 'Submitted Lit Review' },
    { id: '2', name: 'Mark Wilson', topic: 'ML in Supply Chain Management', progress: 30, status: 'At Risk', avatar: 'https://picsum.photos/seed/mark/200', lastAction: 'No activity for 2 weeks' },
    { id: '3', name: 'Sarah Chen', topic: 'Quantum Cryptography Protocols', progress: 85, status: 'Review', avatar: 'https://picsum.photos/seed/sarah/200', lastAction: 'Ready for full draft' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thesis Supervision Dashboard</h1>
          <p className="text-slate-500">You are supervising 3 students across 2 departments.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Add New Student
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Users size={20} /></div>
            <span className="text-sm font-bold text-slate-400 uppercase">Total Students</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">03</h3>
          <p className="text-xs text-emerald-600 mt-1">+1 from last semester</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><FileCheck size={20} /></div>
            <span className="text-sm font-bold text-slate-400 uppercase">Awaiting Review</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">02</h3>
          <p className="text-xs text-slate-500 mt-1">Updates within last 24h</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><AlertCircle size={20} /></div>
            <span className="text-sm font-bold text-slate-400 uppercase">At Risk</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">01</h3>
          <p className="text-xs text-rose-600 mt-1">Action required</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-bold text-slate-800">Assigned Students</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                placeholder="Search students..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none w-64"
              />
            </div>
            <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thesis Topic</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</th>
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
                        <p className="text-xs text-slate-500">{student.lastAction}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 font-medium max-w-xs truncate">{student.topic}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[120px] space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>{student.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${student.status === 'At Risk' ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      student.status === 'At Risk' ? 'bg-rose-100 text-rose-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg transition-colors">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button className="text-sm font-semibold text-indigo-600 hover:underline">View All Students</button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorView;
