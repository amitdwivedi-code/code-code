import React, { useState, useEffect } from 'react';
import { Question, Comment, Solution, CodeSnippet, Review, Attachment, User } from '../types';
import { 
  X, MessageSquare, Code, Award, CheckSquare, Paperclip, 
  Send, ThumbsUp, Pin, Star, GitBranch, Play, Sparkles, 
  Upload, FileText, CheckCircle2, AlertCircle, AlertTriangle, Plus, Trash2, CornerDownRight, Maximize2, Minimize2, Copy, Check 
} from 'lucide-react';
import { CodeViewer } from './CodeViewer';

interface QuestionDetailModalProps {
  question: Question;
  currentUser: User;
  onClose: () => void;
  darkMode: boolean;
  onUpdateQuestionStatus: (id: string, status: any) => void;
  onDeleteQuestion: (id: string) => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  question,
  currentUser,
  onClose,
  darkMode,
  onUpdateQuestionStatus,
  onDeleteQuestion
}) => {
  const [activeTab, setActiveTab] = useState<'discussion' | 'code' | 'solutions' | 'reviews' | 'attachments'>('discussion');
  
  // Data states
  const [comments, setComments] = useState<Comment[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Input states
  const [newComment, setNewComment] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Mentions state
  const [teamMembers, setTeamMembers] = useState<string[]>(['Amit', 'Rahul', 'Sneha', 'Vikas', 'Anjali', 'Priya', 'Karan']);
  const [mentionSearch, setMentionSearch] = useState<{ query: string; target: 'comment' | 'reply'; pos: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTeamMembers(data.map((u: any) => u.username));
        }
      })
      .catch(() => {});
  }, []);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setNewComment(val);

    const textBeforeCursor = val.substring(0, pos);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      setMentionSearch({ query: match[1], target: 'comment', pos });
    } else {
      setMentionSearch(null);
    }
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setReplyMessage(val);

    const textBeforeCursor = val.substring(0, pos);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      setMentionSearch({ query: match[1], target: 'reply', pos });
    } else {
      setMentionSearch(null);
    }
  };

  const handleSelectMention = (username: string) => {
    if (!mentionSearch) return;
    const { target, pos } = mentionSearch;
    const text = target === 'comment' ? newComment : replyMessage;
    const textBefore = text.substring(0, pos);
    const textAfter = text.substring(pos);

    const lastAtIdx = textBefore.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      const updatedBefore = textBefore.substring(0, lastAtIdx) + `@${username} `;
      const newText = updatedBefore + textAfter;
      if (target === 'comment') {
        setNewComment(newText);
      } else {
        setReplyMessage(newText);
      }
    }
    setMentionSearch(null);
  };

  const renderMessageWithMentions = (msg: string) => {
    if (!msg) return null;
    const parts = msg.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        return (
          <span key={idx} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-semibold inline-block text-xs border border-indigo-500/30">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Code editor states
  const [editorCode, setEditorCode] = useState('def solution(nums):\n    # Write your python code here\n    pass');
  const [commitMsg, setCommitMsg] = useState('Update implementation');
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [executionMetrics, setExecutionMetrics] = useState<{
    executionTimeMs?: number;
    memoryMb?: number;
    timeComplexity?: string;
    spaceComplexity?: string;
  } | null>(null);
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [isFullScreen, setIsFullScreen] = useState(true);

  // Solution modal state
  const [showAddSolution, setShowAddSolution] = useState(false);
  const [solTitle, setSolTitle] = useState('');
  const [solExp, setSolExp] = useState('');
  const [solTime, setSolTime] = useState('O(n)');
  const [solSpace, setSolSpace] = useState('O(1)');
  const [solAdvantages, setSolAdvantages] = useState('');
  const [solDisadvantages, setSolDisadvantages] = useState('');
  const [solCode, setSolCode] = useState('');

  // Review modal state
  const [showAddReview, setShowAddReview] = useState(false);
  const [revRating, setRevRating] = useState('5');
  const [revSuggestions, setRevSuggestions] = useState('');
  const [revBugs, setRevBugs] = useState('None');
  const [revOptimization, setRevOptimization] = useState('');

  useEffect(() => {
    fetchAllSubData();
    const interval = setInterval(fetchAllSubData, 3000);
    return () => clearInterval(interval);
  }, [question.id]);

  const fetchAllSubData = async () => {
    try {
      const [cRes, sRes, snRes, rRes, aRes] = await Promise.all([
        fetch(`/api/questions/${question.id}/comments`),
        fetch(`/api/questions/${question.id}/solutions`),
        fetch(`/api/questions/${question.id}/code`),
        fetch(`/api/questions/${question.id}/reviews`),
        fetch(`/api/questions/${question.id}/attachments`)
      ]);

      if (cRes.ok) setComments(await cRes.json());
      if (sRes.ok) setSolutions(await sRes.json());
      if (snRes.ok) {
        const snData = await snRes.json();
        setSnippets(snData);
        if (snData.length > 0 && !editorCode.trim()) {
          setEditorCode(snData[snData.length - 1].code);
        }
      }
      if (rRes.ok) setReviews(await rRes.json());
      if (aRes.ok) setAttachments(await aRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/questions/${question.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser.username,
          message: newComment,
          important: isImportant,
          pinned: currentUser.role === 'Admin' ? isPinned : false
        })
      });

      if (res.ok) {
        setNewComment('');
        setIsImportant(false);
        setIsPinned(false);
        fetchAllSubData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyMessage.trim()) return;
    try {
      const res = await fetch(`/api/questions/${question.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: parentId,
          user: currentUser.username,
          message: replyMessage
        })
      });
      if (res.ok) {
        setReplyMessage('');
        setReplyingToId(null);
        fetchAllSubData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeComment = async (id: string) => {
    try {
      await fetch(`/api/comments/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username })
      });
      fetchAllSubData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunCode = async () => {
    setExecutionOutput('Executing code in server sandbox...');
    setExecutionMetrics(null);
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editorCode, language })
      });
      const data = await res.json();
      if (res.ok) {
        setExecutionOutput(data.output || 'Execution completed with no output.');
        if (data.metrics) {
          setExecutionMetrics(data.metrics);
        }
      } else {
        setExecutionOutput(`Execution Error:\n${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setExecutionOutput(`Request Error:\n${err.message}`);
    }
  };

  const handleSmartAISolve = async () => {
    setExecutionOutput('Generating optimized solution with Smart AI...');
    try {
      const res = await fetch('/api/ai/smart-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: question.title,
          description: question.description,
          language
        })
      });
      const data = await res.json();
      if (res.ok && data.code) {
        setEditorCode(data.code);
        setExecutionOutput('Smart AI Assistant generated optimized solution successfully.');
      } else {
        setExecutionOutput(`AI Generation Error:\n${data.error || 'Failed to generate solution'}`);
      }
    } catch (err: any) {
      setExecutionOutput(`AI Request Error:\n${err.message}`);
    }
  };

  const handleLanguageChange = (newLang: 'python' | 'javascript') => {
    setLanguage(newLang);
    if (newLang === 'python') {
      setEditorCode('def solution(nums):\n    # Write your python code here\n    pass');
    } else {
      setEditorCode('function solution(nums) {\n    // Write your JavaScript code here\n    return nums;\n}');
    }
    setExecutionOutput(null);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (language === 'python' && e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const value = textarea.value;

      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.substring(lineStart, selectionStart);

      const match = currentLine.match(/^(\s*)/);
      const leadingSpaces = match ? match[1] : '';

      const trimmed = currentLine.trim();
      const needsExtraIndent = trimmed.endsWith(':');
      const extraIndent = needsExtraIndent ? '    ' : '';
      const newIndent = leadingSpaces + extraIndent;

      const insertion = '\n' + newIndent;
      const newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);

      setEditorCode(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + insertion.length;
      }, 0);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const value = textarea.value;

      const newValue = value.substring(0, selectionStart) + '    ' + value.substring(selectionEnd);
      setEditorCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
      }, 0);
    }
  };

  const lintResults = React.useMemo(() => {
    const issues: { line: number; message: string; type: 'error' | 'warning' }[] = [];
    const lines = editorCode.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (language === 'python') {
        if (/^(def\s+\w+\s*\(.*\)|if\s+.+|elif\s+.+|else|for\s+.+|while\s+.+|try|except.*|finally|class\s+\w+.*)\s*$/.test(trimmed)) {
          if (!trimmed.endsWith(':')) {
            issues.push({
              line: index + 1,
              message: `Missing colon ':' at the end of statement`,
              type: 'error'
            });
          }
        }
      }
    });

    let openParens = 0;
    let openBrackets = 0;
    let openBraces = 0;
    for (let char of editorCode) {
      if (char === '(') openParens++;
      if (char === ')') openParens--;
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
    }

    if (openParens !== 0) {
      issues.push({ line: lines.length, message: `Unbalanced parentheses (${openParens > 0 ? 'missing \')\'' : 'extra \')\''})`, type: 'error' });
    }
    if (openBrackets !== 0) {
      issues.push({ line: lines.length, message: `Unbalanced brackets (${openBrackets > 0 ? 'missing \']\'' : 'extra \']\''})`, type: 'error' });
    }
    if (openBraces !== 0) {
      issues.push({ line: lines.length, message: `Unbalanced braces (${openBraces > 0 ? 'missing \'}\'' : 'extra \'}\''})`, type: 'error' });
    }

    return issues;
  }, [editorCode, language]);

  const handleSaveCodeVersion = async () => {
    try {
      const res = await fetch(`/api/questions/${question.id}/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUser.username,
          code: editorCode,
          commit_message: commitMsg
        })
      });
      if (res.ok) {
        alert('Code version saved successfully!');
        fetchAllSubData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoteSolution = async (id: string, voteType: string) => {
    try {
      const res = await fetch(`/api/solutions/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType, username: currentUser.username })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to vote');
      } else {
        fetchAllSubData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/questions/${question.id}/solutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUser.username,
          approach_name: solTitle || 'Optimal Approach',
          explanation: solExp,
          time_complexity: solTime,
          space_complexity: solSpace,
          advantages: solAdvantages,
          disadvantages: solDisadvantages,
          code: solCode || editorCode
        })
      });
      if (res.ok) {
        setShowAddSolution(false);
        setSolTitle('');
        setSolExp('');
        setSolAdvantages('');
        setSolDisadvantages('');
        setSolCode('');
        fetchAllSubData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/questions/${question.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: question.created_by,
          reviewer: currentUser.username,
          rating: revRating,
          suggestions: revSuggestions,
          bugs: revBugs,
          optimization_ideas: revOptimization
        })
      });
      if (res.ok) {
        setShowAddReview(false);
        setRevSuggestions('');
        setRevBugs('');
        setRevOptimization('');
        fetchAllSubData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cardBg = darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullScreen ? 'p-0' : 'p-4'} bg-black/70 backdrop-blur-sm animate-fadeIn`}>
      <div className={`transition-all duration-300 flex flex-col shadow-2xl overflow-hidden ${
        isFullScreen 
          ? 'w-screen h-screen rounded-none border-0' 
          : 'w-full max-w-6xl h-[90vh] rounded-3xl border resize overflow-auto'
      } ${cardBg}`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-1 rounded text-xs font-bold ${
              question.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
              question.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {question.difficulty}
            </span>
            <div>
              <h2 className="font-bold text-lg leading-tight">{question.title}</h2>
              <span className="text-xs text-slate-400 font-mono">#{question.id} • Topic: {question.topic} • By {question.created_by}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={question.status}
              onChange={(e) => onUpdateQuestionStatus(question.id, e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Discussion">In Discussion</option>
              <option value="Solved">Solved</option>
              <option value="Need Review">Need Review</option>
              <option value="Archived">Archived</option>
            </select>

            {currentUser.role === 'Admin' && (
              <button
                onClick={() => onDeleteQuestion(question.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition"
                title="Delete Question"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              title={isFullScreen ? 'Restore Window Size' : 'Maximize Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex border-b px-6 space-x-6 text-xs font-semibold ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
          {[
            { id: 'discussion', label: `Discussions (${comments.length})`, icon: MessageSquare },
            { id: 'code', label: `Code & Versions (${snippets.length})`, icon: Code },
            { id: 'solutions', label: `Solutions (${solutions.length})`, icon: Award },
            { id: 'reviews', label: `Code Reviews (${reviews.length})`, icon: CheckSquare },
            { id: 'attachments', label: `Attachments (${attachments.length})`, icon: Paperclip },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 flex items-center space-x-2 border-b-2 transition ${
                  isActive ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* QUESTION DESCRIPTION BANNER */}
          <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-indigo-400 mb-1">Problem Description</h4>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>{question.description}</p>
            {question.reference_links && (
              <div className="mt-3 pt-3 border-t border-slate-700/40 text-xs">
                <span className="text-slate-400">Reference: </span>
                <a href={question.reference_links} target="_blank" rel="noreferrer" className="text-indigo-400 underline hover:text-indigo-300">
                  {question.reference_links}
                </a>
              </div>
            )}
          </div>

          {/* TAB 1: DISCUSSION */}
          {activeTab === 'discussion' && (
            <div className="space-y-6">
              {/* Comment Input */}
              <form onSubmit={handlePostComment} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Post to Discussion (Markdown & @mentions supported)</span>
                  <div className="flex items-center space-x-4 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" checked={isImportant} onChange={e => setIsImportant(e.target.checked)} className="rounded" />
                      <span className="text-amber-400 font-medium">Mark Important</span>
                    </label>
                    {currentUser.role === 'Admin' && (
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="rounded" />
                        <span className="text-indigo-400 font-medium">Pin Comment (Admin)</span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Share your thoughts, ask questions, or mention team members (@Amit, @Rahul, @Sneha, @Vikas, @Anjali)..."
                    className={`w-full p-3 rounded-xl text-xs border outline-none transition ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  {mentionSearch && mentionSearch.target === 'comment' && (
                    <div className={`absolute left-0 bottom-full mb-1 w-64 rounded-xl shadow-xl border py-1 z-50 max-h-48 overflow-y-auto ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/40">
                        Tag Team Member
                      </div>
                      {teamMembers
                        .filter(m => m.toLowerCase().includes(mentionSearch.query.toLowerCase()))
                        .map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleSelectMention(m)}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 transition ${
                              darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <span className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                              {m.charAt(0)}
                            </span>
                            <span className="font-semibold">@{m}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 text-xs shadow-md transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>

              {/* Comments List & Separate Pinned Section */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">No comments yet. Start the discussion!</div>
                ) : (
                  (() => {
                    const rootComments = comments.filter(c => !c.parent_id || c.parent_id === '0' || c.parent_id === '');
                    const pinnedComments = rootComments.filter(c => c.pinned === 'true');
                    const regularComments = rootComments.filter(c => c.pinned !== 'true');

                    const renderCommentItem = (commentObj: Comment, isReply = false) => {
                      const childReplies = comments.filter(item => item.parent_id === commentObj.id);
                      const likedList = commentObj.liked_users ? commentObj.liked_users.split(',').map(s => s.trim()) : [];
                      const hasLiked = likedList.includes(currentUser.username);
                      const isReplyingThis = replyingToId === commentObj.id;

                      return (
                        <div key={commentObj.id} className={`${isReply ? 'mt-3 pl-3 sm:pl-4 border-l-2 border-indigo-500/20' : ''}`}>
                          <div className={`p-4 rounded-2xl border transition ${
                            commentObj.pinned === 'true' ? 'border-indigo-500/50 bg-indigo-500/5' :
                            darkMode ? 'bg-slate-800/30 border-slate-700/60' : 'bg-white border-slate-200'
                          }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-xs text-indigo-400">{commentObj.user}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{commentObj.timestamp}</span>
                                  {commentObj.pinned === 'true' && (
                                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center gap-1">
                                      <Pin className="h-3 w-3" /> Pinned
                                    </span>
                                  )}
                                  {commentObj.important === 'true' && (
                                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] flex items-center gap-1">
                                      <Star className="h-3 w-3" /> Important
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      setReplyingToId(isReplyingThis ? null : commentObj.id);
                                      setReplyMessage('');
                                    }}
                                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                                  >
                                    <CornerDownRight className="h-3.5 w-3.5" />
                                    <span>Reply</span>
                                  </button>
                                  <button
                                    onClick={() => handleLikeComment(commentObj.id)}
                                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs transition ${
                                      hasLiked 
                                        ? 'bg-indigo-500/20 text-indigo-400 font-semibold' 
                                        : 'hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400'
                                    }`}
                                  >
                                    <ThumbsUp className={`h-3.5 w-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                                    <span>{commentObj.likes}</span>
                                  </button>
                                </div>
                              </div>

                              <div className={`text-xs leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-900'} whitespace-pre-wrap font-sans`}>
                                {renderMessageWithMentions(commentObj.message)}
                              </div>

                              {/* Reply Box Inline */}
                              {isReplyingThis && (
                                <div className="mt-3 pt-3 border-t border-slate-700/40 space-y-2">
                                  <div className="relative">
                                    <textarea
                                      rows={2}
                                      value={replyMessage}
                                      onChange={handleReplyChange}
                                      placeholder={`Write a reply to ${commentObj.user}...`}
                                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition ${
                                        darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
                                      }`}
                                    />
                                    {mentionSearch && mentionSearch.target === 'reply' && (
                                      <div className={`absolute left-0 bottom-full mb-1 w-64 rounded-xl shadow-xl border py-1 z-50 max-h-48 overflow-y-auto ${
                                        darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                                      }`}>
                                        <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/40">
                                          Tag Team Member
                                        </div>
                                        {teamMembers
                                          .filter(m => m.toLowerCase().includes(mentionSearch.query.toLowerCase()))
                                          .map(m => (
                                            <button
                                              key={m}
                                              type="button"
                                              onClick={() => handleSelectMention(m)}
                                              className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 transition ${
                                                darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                                              }`}
                                            >
                                              <span className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                                                {m.charAt(0)}
                                              </span>
                                              <span className="font-semibold">@{m}</span>
                                            </button>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => setReplyingToId(null)}
                                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs transition"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePostReply(commentObj.id)}
                                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                                    >
                                      <Send className="h-3 w-3" />
                                      <span>Post Reply</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Render Child Replies */}
                            {childReplies.length > 0 && (
                              <div className="space-y-3 mt-3">
                                {childReplies.map(child => renderCommentItem(child, true))}
                              </div>
                            )}
                          </div>
                        );
                      };

                    return (
                      <div className="space-y-6">
                        {pinnedComments.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider pb-1 border-b border-indigo-500/20">
                              <Pin className="h-4 w-4" />
                              <span>Pinned Discussions ({pinnedComments.length})</span>
                            </div>
                            <div className="space-y-4">
                              {pinnedComments.map(c => renderCommentItem(c))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          {pinnedComments.length > 0 && regularComments.length > 0 && (
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
                              General Discussions ({regularComments.length})
                            </div>
                          )}
                          {regularComments.map(c => renderCommentItem(c))}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CODE SHARING & VERSIONS */}
          {activeTab === 'code' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Code Editor */}
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'} space-y-4 flex flex-col`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <select
                      value={language}
                      onChange={e => handleLanguageChange(e.target.value as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-indigo-400' : 'bg-slate-50 border-slate-200 text-indigo-600'
                      }`}
                    >
                      <option value="python">Python 3.12</option>
                      <option value="javascript">JavaScript (Node.js)</option>
                    </select>

                    {solutions.length > 0 && (
                      <select
                        onChange={(e) => {
                          const found = solutions.find(s => s.id === e.target.value);
                          if (found) {
                            setEditorCode(found.code);
                            setCommitMsg(`Loaded solution: ${found.approach_name} (${found.author})`);
                          }
                        }}
                        defaultValue=""
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="" disabled>Switch to Team Solution...</option>
                        {solutions.map((s, idx) => (
                          <option key={s.id} value={s.id}>
                            #{idx + 1}: {s.approach_name} ({s.author})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(editorCode);
                        alert('Code copied to clipboard!');
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                      title="Copy current editor code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </button>

                    <button
                      onClick={handleSmartAISolve}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 text-xs font-medium border border-indigo-500/30 transition shadow-sm"
                      title="Smart AI Assistant generates optimal code"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Smart AI Solve</span>
                    </button>

                    <button
                      onClick={handleRunCode}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 shadow-sm transition"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Run</span>
                    </button>
                  </div>
                </div>

                <div className="relative flex flex-col font-mono text-xs w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-900/50">
                    <span>{language === 'python' ? 'Python (Auto-indent enabled)' : 'JavaScript (Node.js)'}</span>
                    <span>Resizable Editor</span>
                  </div>
                  <textarea
                    rows={16}
                    value={editorCode}
                    onChange={e => setEditorCode(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    placeholder="Write your code here..."
                    spellCheck={false}
                    className="w-full p-4 font-mono text-xs bg-slate-950 text-white outline-none resize-y min-h-[300px] max-h-[600px] overflow-auto whitespace-pre"
                  />
                </div>

                {/* Real-time Linter & Syntax Validator Status */}
                <div className={`p-3 rounded-xl border text-xs flex flex-col space-y-1.5 ${
                  lintResults.length === 0
                    ? darkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : darkMode ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-semibold">
                      {lintResults.length === 0 ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>Syntax & Structure OK (No issues detected)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>Linter found {lintResults.length} syntax warning{lintResults.length > 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                    <span className="text-[10px] opacity-75 font-mono">{language === 'python' ? 'Python Linter Active' : 'JS Linter Active'}</span>
                  </div>

                  {lintResults.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-amber-500/20">
                      {lintResults.map((issue, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-[11px] font-mono">
                          <span className="opacity-70">Line {issue.line}:</span>
                          <span className="font-medium">{issue.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    value={commitMsg}
                    onChange={e => setCommitMsg(e.target.value)}
                    placeholder="Commit message (e.g. Optimized solution)"
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                  <button
                    onClick={handleSaveCodeVersion}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 text-xs shrink-0 shadow-md transition"
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    <span>Save Version</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Execution Output & Version History */}
              <div className="space-y-4 flex flex-col">
                {/* Execution Output Console */}
                <div className={`p-4 rounded-2xl border font-mono text-xs space-y-3 shadow-inner flex-1 flex flex-col ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <span className={`font-bold uppercase tracking-wider text-[11px] ${darkMode ? 'text-emerald-400' : 'text-slate-900'}`}>Execution Console & Output</span>
                    <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{language === 'python' ? 'Python 3.12 Sandbox' : 'Node.js Sandbox'}</span>
                  </div>

                  {executionMetrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-b border-slate-800 text-[11px]">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Time Complexity</span>
                        <span className="font-bold text-indigo-400 text-xs">{executionMetrics.timeComplexity || 'O(n)'}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Space Complexity</span>
                        <span className="font-bold text-violet-400 text-xs">{executionMetrics.spaceComplexity || 'O(1)'}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Execution Time</span>
                        <span className="font-bold text-emerald-400 text-xs">{executionMetrics.executionTimeMs || 12} ms</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Memory Used</span>
                        <span className="font-bold text-sky-400 text-xs">{executionMetrics.memoryMb || 14.2} MB</span>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 min-h-[160px] max-h-[220px] overflow-y-auto whitespace-pre-wrap p-3 rounded bg-black/50 text-emerald-300 font-mono text-xs">
                    {executionOutput || '// Click "Run" to execute your solution in the server sandbox and view test results here...'}
                  </div>
                </div>

                {/* Version History */}
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-indigo-400">Version History ({snippets.length})</h4>
                    <span className="text-[10px] text-slate-400">Saved commits</span>
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-2">
                    {snippets.length === 0 ? (
                      <div className="text-xs text-slate-400 py-4 text-center">No saved code versions yet. Save a version above!</div>
                    ) : (
                      snippets.map((sn, idx) => (
                        <div key={sn.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="space-y-0.5">
                            <span className="font-bold text-indigo-400">v{idx + 1} - {sn.author}</span>
                            <p className="text-[11px] text-slate-300">{sn.commit_message || 'Update implementation'}</p>
                            <span className="text-[10px] text-slate-500 font-mono">{sn.timestamp}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditorCode(sn.code);
                                setCommitMsg(`Loaded v${idx + 1} by ${sn.author}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition shadow"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(sn.code);
                                alert(`Snippet v${idx + 1} copied to clipboard!`);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                              title="Copy snippet"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOLUTIONS & VOTING */}
          {activeTab === 'solutions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Multiple Solutions & Rankings</h3>
                  <p className="text-xs text-slate-400">Vote for Best Solution, Most Readable, or Most Optimized approach.</p>
                </div>
                <button
                  onClick={() => setShowAddSolution(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 shadow-md transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit Solution</span>
                </button>
              </div>

              <div className="space-y-4">
                {solutions.map(sol => (
                  <div key={sol.id} className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'} space-y-4`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-bold text-base text-indigo-400">{sol.approach_name}</h4>
                          <span className="text-xs text-slate-400">by {sol.author}</span>
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>{sol.explanation}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditorCode(sol.code);
                            setActiveTab('code');
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                          title="Load this solution into code editor"
                        >
                          <Code className="h-3.5 w-3.5" />
                          <span>Load</span>
                        </button>
                        <button
                          onClick={() => handleVoteSolution(sol.id, 'votes_best')}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition"
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>Best ({sol.votes_best})</span>
                        </button>
                        <button
                          onClick={() => handleVoteSolution(sol.id, 'votes_readable')}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Readable ({sol.votes_readable})</span>
                        </button>
                        <button
                          onClick={() => handleVoteSolution(sol.id, 'votes_optimized')}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Optimized ({sol.votes_optimized})</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-1">Time & Space Complexity</span>
                        <div className="space-y-1 font-mono">
                          <div>Time: <strong className="text-emerald-400">{sol.time_complexity}</strong></div>
                          <div>Space: <strong className="text-violet-400">{sol.space_complexity}</strong></div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-emerald-400 font-semibold block text-[10px] uppercase tracking-wider mb-1">Pros / Advantages</span>
                        <p className={`leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sol.advantages || 'None specified'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-rose-400 font-semibold block text-[10px] uppercase tracking-wider mb-1">Cons / Disadvantages</span>
                        <p className={`leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sol.disadvantages || 'None specified'}</p>
                      </div>
                    </div>

                    <CodeViewer code={sol.code} language={sol.code.includes('function') ? 'javascript' : 'python'} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CODE REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Code Reviews & Suggestions</h3>
                  <p className="text-xs text-slate-400">Team peer reviews, bug reports, and optimization ideas.</p>
                </div>
                <button
                  onClick={() => setShowAddReview(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 shadow-md transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit Review</span>
                </button>
              </div>

              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.id} className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-xs text-indigo-400">Review by {rev.reviewer}</span>
                        <span className="text-xs text-slate-400">for Author: <strong className="text-slate-300">{rev.author}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1 bg-amber-500/10 px-2.5 py-1 rounded-full text-amber-400 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{rev.rating}/5</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                        <span className="font-semibold text-slate-400 block mb-1">Suggestions</span>
                        <p className="text-slate-300">{rev.suggestions}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                        <span className="font-semibold text-rose-400 block mb-1">Bugs / Issues</span>
                        <p className="text-slate-300">{rev.bugs}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                        <span className="font-semibold text-emerald-400 block mb-1">Optimizations</span>
                        <p className="text-slate-300">{rev.optimization_ideas}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border border-dashed ${darkMode ? 'border-slate-700 bg-slate-800/20' : 'border-slate-300 bg-slate-50'} text-center space-y-3`}>
                <Upload className="h-8 w-8 text-indigo-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm">Upload Reference Files & Diagrams</h4>
                  <p className="text-xs text-slate-400">Support Images, PDFs, and Text files stored directly in CSV references.</p>
                </div>
                <input
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('uploaded_by', currentUser.username);
                    const res = await fetch(`/api/questions/${question.id}/attachments`, {
                      method: 'POST',
                      body: formData
                    });
                    if (res.ok) fetchAllSubData();
                  }}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map(att => (
                  <div key={att.id} className={`p-4 rounded-xl border flex items-center justify-between ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-indigo-400" />
                      <div>
                        <a href={att.file_path} target="_blank" rel="noreferrer" className="font-semibold text-xs text-indigo-400 hover:underline">
                          {att.filename}
                        </a>
                        <span className="text-[10px] text-slate-400 block">Uploaded by {att.uploaded_by} on {att.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Solution Modal Overlay */}
      {showAddSolution && (
        <div className="fixed inset-0 z-65 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 space-y-4 shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">Submit Solution Approach</h3>
              <button onClick={() => setShowAddSolution(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSolutionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Approach Name / Title</label>
                <input
                  type="text"
                  value={solTitle}
                  onChange={e => setSolTitle(e.target.value)}
                  placeholder="e.g. Two Pointers / Optimal Hash Map"
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Explanation & Algorithm</label>
                <textarea
                  rows={3}
                  value={solExp}
                  onChange={e => setSolExp(e.target.value)}
                  placeholder="Explain how the algorithm works..."
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Time Complexity</label>
                  <input
                    type="text"
                    value={solTime}
                    onChange={e => setSolTime(e.target.value)}
                    placeholder="O(n)"
                    className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Space Complexity</label>
                  <input
                    type="text"
                    value={solSpace}
                    onChange={e => setSolSpace(e.target.value)}
                    placeholder="O(1)"
                    className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Advantages / Pros</label>
                  <input
                    type="text"
                    value={solAdvantages}
                    onChange={e => setSolAdvantages(e.target.value)}
                    placeholder="e.g. Extremely fast, minimal memory"
                    className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Disadvantages / Cons</label>
                  <input
                    type="text"
                    value={solDisadvantages}
                    onChange={e => setSolDisadvantages(e.target.value)}
                    placeholder="e.g. Requires sorted array"
                    className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Solution Code</label>
                <textarea
                  rows={5}
                  value={solCode || editorCode}
                  onChange={e => setSolCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border font-mono outline-none bg-slate-950 border-slate-800 text-white shadow-inner"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSolution(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-md transition"
                >
                  Publish Solution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Review Modal Overlay */}
      {showAddReview && (
        <div className="fixed inset-0 z-65 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-xl rounded-2xl border p-6 space-y-4 shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">Submit Code Review & Peer Feedback</h3>
              <button onClick={() => setShowAddReview(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Rating (1 to 5 Stars)</label>
                <select
                  value={revRating}
                  onChange={e => setRevRating(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5/5) - Exceptional Code</option>
                  <option value="4">⭐⭐⭐⭐ (4/5) - Clean & Robust</option>
                  <option value="3">⭐⭐⭐ (3/5) - Functional with Improvements Needed</option>
                  <option value="2">⭐⭐ (2/5) - Major Bug/Performance Concern</option>
                  <option value="1">⭐ (1/5) - Needs Complete Rewrite</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Code Suggestions & Peer Feedback</label>
                <textarea
                  rows={3}
                  value={revSuggestions}
                  onChange={e => setRevSuggestions(e.target.value)}
                  placeholder="Provide helpful code suggestions..."
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Bugs / Issues Identified</label>
                <input
                  type="text"
                  value={revBugs}
                  onChange={e => setRevBugs(e.target.value)}
                  placeholder="e.g. Edge case missing for empty string"
                  className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Optimization Ideas</label>
                <input
                  type="text"
                  value={revOptimization}
                  onChange={e => setRevOptimization(e.target.value)}
                  placeholder="e.g. Can be reduced to O(1) space with iterative approach"
                  className={`w-full p-2.5 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReview(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-md transition"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
