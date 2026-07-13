import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Question, User } from '../types';
import { 
  HelpCircle, CheckCircle2, Clock, MessageSquare, 
  Users, TrendingUp, Plus, ArrowRight, Sparkles, Search, Filter, BarChart3 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface DashboardViewProps {
  stats: {
    totalQuestions: number;
    solvedQuestions: number;
    pendingQuestions: number;
    todaysDiscussions: number;
    activeMembers: number;
    recentActivity: Activity[];
  };
  questions: Question[];
  users: User[];
  onOpenAddQuestion: () => void;
  onSelectQuestion: (q: Question) => void;
  darkMode: boolean;
  setCurrentView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  questions,
  users,
  onOpenAddQuestion,
  onSelectQuestion,
  darkMode,
  setCurrentView
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');

  const topics = ['All', ...Array.from(new Set(questions.map(q => q.topic)))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  
  // Extract all unique individual tags from questions
  const allTagsSet = new Set<string>();
  questions.forEach(q => {
    if (q.tags) {
      q.tags.split(',').forEach(t => {
        if (t.trim()) allTagsSet.add(t.trim());
      });
    }
  });
  const tagsList = ['All', ...Array.from(allTagsSet)];

  const solvedCount = questions.filter(q => q.status === 'Solved').length;
  const pendingCount = questions.filter(q => q.status !== 'Solved').length;

  const statusData = [
    { name: 'Solved', value: solvedCount, color: '#34d399' },
    { name: 'Pending', value: pendingCount, color: '#fbbf24' }
  ];

  const difficultyData = [
    { name: 'Easy', count: questions.filter(q => q.difficulty === 'Easy').length, color: '#34d399' },
    { name: 'Medium', count: questions.filter(q => q.difficulty === 'Medium').length, color: '#fbbf24' },
    { name: 'Hard', count: questions.filter(q => q.difficulty === 'Hard').length, color: '#f43f5e' }
  ];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.created_by.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'All' || q.topic === selectedTopic;
    const matchesTag = selectedTag === 'All' || q.tags.toLowerCase().includes(selectedTag.toLowerCase());

    return matchesSearch && matchesDiff && matchesTopic && matchesTag;
  });

  const cardBg = darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className={`p-5 rounded-2xl border ${cardBg} shadow-sm flex items-center justify-between`}>
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Total Questions</div>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <HelpCircle className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className={`p-5 rounded-2xl border ${cardBg} shadow-sm flex items-center justify-between`}>
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Solved</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.solvedQuestions}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className={`p-5 rounded-2xl border ${cardBg} shadow-sm flex items-center justify-between`}>
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Pending</div>
            <div className="text-2xl font-bold text-amber-400">{stats.pendingQuestions}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className={`p-5 rounded-2xl border ${cardBg} shadow-sm flex items-center justify-between`}>
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Today's Comments</div>
            <div className="text-2xl font-bold text-violet-400">{stats.todaysDiscussions}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className={`p-5 rounded-2xl border ${cardBg} shadow-sm flex items-center justify-between col-span-2 lg:col-span-1`}>
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Active Members</div>
            <div className="text-2xl font-bold text-sky-400">{stats.activeMembers} / 5</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </motion.div>
      </div>

      {/* Analytics Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solved vs Pending Pie / Bar Distribution */}
        <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span>Solved vs. Pending Distribution</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{stats.totalQuestions} Total Questions</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Breakdown Bar Chart */}
        <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <span>Questions by Difficulty Level</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Easy / Medium / Hard</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fully Searchable & Filterable Questions Explorer */}
      <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Search & Filter Python Interview Questions</span>
          </h3>
          <button
            onClick={onOpenAddQuestion}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition text-xs shrink-0 self-start md:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none transition ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {difficulties.map(d => <option key={d} value={d}>Hard Level: {d}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {topics.map(t => <option key={t} value={t}>Datatype/Topic: {t}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {tagsList.map(tag => <option key={tag} value={tag}>Tag: #{tag}</option>)}
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredQuestions.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No matching questions found for your search & filter criteria.
            </div>
          ) : (
            filteredQuestions.map((q, index) => (
              <motion.div
                key={`${q.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => onSelectQuestion(q)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  darkMode ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                      q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs font-mono text-indigo-400">#{q.id} • {q.topic}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                    q.status === 'Solved' ? 'bg-emerald-500/10 text-emerald-400' :
                    q.status === 'In Discussion' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {q.status}
                  </span>
                </div>

                <h4 className="font-semibold text-sm">{q.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-1">{q.description}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {q.tags.split(',').map((tag, idx) => (
                    <span key={idx} className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                      darkMode ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
                    }`}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

