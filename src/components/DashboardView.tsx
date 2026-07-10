import React from 'react';
import { motion } from 'motion/react';
import { Activity, Question, User } from '../types';
import { 
  HelpCircle, CheckCircle2, Clock, MessageSquare, 
  Users, TrendingUp, Plus, ArrowRight, Sparkles 
} from 'lucide-react';

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

      {/* Recent Questions Full Width */}
      <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Recent Python Interview Questions</span>
          </h3>
          <button
            onClick={() => setCurrentView('questions')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.slice(0, 6).map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => onSelectQuestion(q)}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                darkMode ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="text-xs font-mono text-slate-400">#{q.id} • {q.topic}</span>
                </div>
                <h4 className="font-semibold text-sm">{q.title}</h4>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  q.status === 'Solved' ? 'bg-emerald-500/10 text-emerald-400' :
                  q.status === 'In Discussion' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {q.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
