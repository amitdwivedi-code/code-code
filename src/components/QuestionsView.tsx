import React, { useState } from 'react';
import { Question, Tag } from '../types';
import { 
  Search, Filter, Plus, Bookmark, CheckCircle2, 
  Clock, MessageSquare, Tag as TagIcon, Sparkles, HelpCircle, Trash2 
} from 'lucide-react';

interface QuestionsViewProps {
  questions: Question[];
  tags: Tag[];
  onOpenAddQuestion: () => void;
  onSelectQuestion: (q: Question) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onDeleteQuestion: (id: string, e: React.MouseEvent) => void;
  darkMode: boolean;
}

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  questions,
  tags,
  onOpenAddQuestion,
  onSelectQuestion,
  onToggleBookmark,
  onDeleteQuestion,
  darkMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Extract unique topics
  const topics = ['All', ...Array.from(new Set(questions.map(q => q.topic)))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const statuses = ['All', 'Not Started', 'In Discussion', 'Solved', 'Need Review', 'Archived'];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.created_by.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'All' || q.topic === selectedTopic;
    const matchesStatus = selectedStatus === 'All' || q.status === selectedStatus;

    return matchesSearch && matchesDiff && matchesTopic && matchesStatus;
  });

  const cardBg = darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Python Interview Questions & Discussions</h2>
          <p className="text-xs text-slate-400">Browse questions, inspect solutions, participate in discussions, and share code.</p>
        </div>
        <button
          onClick={onOpenAddQuestion}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition text-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className={`p-4 rounded-2xl border ${cardBg} shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4`}>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, keyword, tag, author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border outline-none transition ${
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
            {difficulties.map(d => <option key={d} value={d}>Difficulty: {d}</option>)}
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
            {topics.map(t => <option key={t} value={t}>Topic: {t}</option>)}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {statuses.map(s => <option key={s} value={s}>Status: {s}</option>)}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className={`p-12 rounded-2xl border text-center ${cardBg}`}>
            <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-1">No questions found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or add a new question.</p>
          </div>
        ) : (
          filteredQuestions.map((q, index) => (
            <div
              key={`${q.id}-${index}`}
              onClick={() => onSelectQuestion(q)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                darkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50'
              } shadow-sm`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="text-xs font-mono text-indigo-400">#{q.id} • {q.topic}</span>
                  <span className="text-xs text-slate-400">• Created by <strong className={darkMode ? 'text-slate-300' : 'text-slate-900'}>{q.created_by}</strong> ({q.created_date})</span>
                </div>

                <h3 className="font-bold text-base hover:text-indigo-400 transition">{q.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{q.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {q.tags.split(',').map((tag, idx) => (
                    <span key={idx} className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  q.status === 'Solved' ? 'bg-emerald-500/10 text-emerald-400' :
                  q.status === 'In Discussion' ? 'bg-indigo-500/10 text-indigo-400' :
                  q.status === 'Need Review' ? 'bg-violet-500/10 text-violet-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {q.status}
                </span>

                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    {q.expected_time}
                  </span>
                  <button
                    onClick={(e) => onToggleBookmark(q.id, e)}
                    className={`p-1.5 rounded-lg transition ${
                      q.bookmarked === 'true' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                  </button>
                  <button
                    onClick={(e) => onDeleteQuestion(q.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Remove Question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
