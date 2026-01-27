
import React from 'react';
// Added Link import from react-router-dom to fix errors on lines 187 and 189
import { Link } from 'react-router-dom';
import { User, Thesis, ThesisStatus } from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  Award,
  // Added Sparkles import from lucide-react to fix error on line 183
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  user: User;
  thesis: Thesis;
}

const Dashboard: React.FC<DashboardProps> = ({ user, thesis }) => {
  // Safe access to milestones with fallback to an empty array
  const milestones = thesis.milestones || [];
  const completedMilestones = milestones.filter(m => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  // Fix: Added missing REVIEWED key to satisfy Record<ThesisStatus, string>
  const statusColors: Record<ThesisStatus, string> = {
    [ThesisStatus.PENDING]: 'bg-amber-100 text-amber-700',
    [ThesisStatus.UNDER_REVIEW]: 'bg-blue-100 text-blue-700',
    [ThesisStatus.REVIEWED]: 'bg-indigo-100 text-indigo-700',
    [ThesisStatus.PUBLISHED]: 'bg-emerald-100 text-emerald-700',
    [ThesisStatus.REVISION_REQUIRED]: 'bg-rose-100 text-rose-700',
    [ThesisStatus.REJECTED]: 'bg-slate-100 text-slate-700',
  };

  const chartData = [
    { name: 'Oct', progress: 10 },
    { name: 'Nov', progress: 20 },
    { name: 'Dec', progress: 40 },
    { name: 'Jan', progress: 45 },
    { name: 'Feb', progress: 60 },
  ];

  const pieData = [
    { name: 'Completed', value: completedMilestones },
    { name: 'Remaining', value: (milestones.length - completedMilestones) },
  ];
  const COLORS = ['#4f46e5', '#e2e8f0'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}!</h1>
          <p className="text-slate-500">You're making great progress on your thesis.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
          <Calendar size={18} className="text-indigo-600" />
          <span className="text-sm font-medium text-slate-700">Next Deadline: 20 Feb 2024</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Clock className="text-indigo-600" />} 
          title="Days Remaining" 
          value="142" 
          subtext="Until Submission" 
        />
        <StatCard 
          icon={<TrendingUp className="text-emerald-600" />} 
          title="Progress" 
          value={`${progressPercent}%`} 
          subtext={`${completedMilestones}/${milestones.length} Milestones`} 
        />
        <StatCard 
          icon={<CheckCircle2 className="text-blue-600" />} 
          title="Status" 
          value={thesis.status} 
          subtext="Current Phase"
          className={statusColors[thesis.status]}
        />
        <StatCard 
          icon={<Award className="text-amber-600" />} 
          title="GPA Impact" 
          value="+0.4" 
          subtext="Estimated" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-800">Thesis Progress Trend</h2>
            <select className="text-xs border-slate-200 rounded-md">
              <option>Last 6 months</option>
              <option>Full Academic Year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="progress" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestone Snapshot */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="font-semibold text-slate-800 mb-6">Milestone Snapshot</h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-800">{completedMilestones}</p>
              <p className="text-sm text-slate-500">Completed</p>
            </div>
          </div>
          <button className="mt-6 w-full py-2 px-4 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 group">
            <span className="text-sm font-medium">View Detailed Plan</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Upcoming Deadlines</h2>
          <div className="space-y-4">
            {milestones.filter(m => !m.completed).slice(0, 3).map(m => (
              <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                  <p className="text-xs text-slate-500">Due: {m.dueDate}</p>
                </div>
                <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg">Submit</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl border border-transparent shadow-md text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-indigo-200" />
            <h2 className="font-semibold">AI Writing Assistant</h2>
          </div>
          <p className="text-indigo-100 text-sm mb-6">Need help refining your abstract or generating literature review outlines? Our AI can help you structure your thoughts.</p>
          <Link to="/ai-helper" className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors">
            Try ScholarAI
          </Link>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, subtext: string, className?: string }> = ({ icon, title, value, subtext, className }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
    </div>
    <div>
      <h3 className={`text-2xl font-bold ${className?.includes('text-') ? className : 'text-slate-900'}`}>{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
  </div>
);

export default Dashboard;
