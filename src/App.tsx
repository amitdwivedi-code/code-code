import React, { useState, useEffect } from 'react';
import { User, Question, Tag } from './types';
import { ShieldCheck } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { QuestionsView } from './components/QuestionsView';
import { LeaderboardView } from './components/LeaderboardView';
import { ActivityView } from './components/ActivityView';
import { AdminView } from './components/AdminView';
import { QuestionDetailModal } from './components/QuestionDetailModal';
import { AddQuestionModal } from './components/AddQuestionModal';
import { PinInputBox } from './components/PinInputBox';
import { UserProfileModal } from './components/UserProfileModal';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: '1',
      username: 'Amit',
      role: 'Team Lead',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      solved_count: '18',
      attempted_count: '22',
      comments_count: '45',
      code_count: '15',
      reviews_count: '12',
      points: '340'
    };
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    solvedQuestions: 0,
    pendingQuestions: 0,
    todaysDiscussions: 0,
    activeMembers: 5,
    recentActivity: []
  });

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  // Admin PIN Protection State & Login State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [loginEmailInput, setLoginEmailInput] = useState('worksample822@gmail.com');
  const [loginPinInput, setLoginPinInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmailInput, password: loginPinInput })
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('authToken', data.token);
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        if (data.user.role === 'Admin') {
          setIsAdminUnlocked(true);
        } else {
          setIsAdminUnlocked(false);
        }
        setLoginError(null);
        setLoginPinInput('');
      } else {
        setLoginError(data.error || 'Invalid credentials or PIN.');
      }
    } catch (err: any) {
      setLoginError('Login failed: ' + err.message);
    }
  };

  const handleNavigate = (view: string) => {
    if (view === 'admin' && currentUser.role !== 'Admin') {
      alert('Access restricted to Admin role only.');
      return;
    }
    if (view === 'admin' && !isAdminUnlocked) {
      setShowAdminPinModal(true);
      setAdminPinInput('');
      setAdminPinError(null);
      return;
    }
    setCurrentView(view);
  };

  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '1234') {
      setIsAdminUnlocked(true);
      setShowAdminPinModal(false);
      setCurrentView('admin');
    } else {
      setAdminPinError('Invalid Admin PIN. (Default PIN: 1234)');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/auth/session', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          setIsLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
        }
      })
      .catch(() => {});
    }

    fetchInitialData();
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = () => {
      fetchInitialData();
    };
    return () => {
      eventSource.close();
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [uRes, qRes, tRes, sRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/questions'),
        fetch('/api/tags'),
        fetch('/api/stats')
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData);
      }
      if (qRes.ok) setQuestions(await qRes.json());
      if (tRes.ok) setTags(await tRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/questions/${id}/bookmark`, { method: 'POST' });
      if (res.ok) {
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQuestionStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        if (selectedQuestion && selectedQuestion.id === id) {
          setSelectedQuestion(updated);
        }
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this question?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedQuestion && selectedQuestion.id === id) {
          setSelectedQuestion(null);
        }
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unresolvedCount = questions.filter(q => q.status !== 'Solved').length;

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl space-y-6 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 text-indigo-500 mb-2">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Team Portal Login</h1>
            <p className="text-xs text-slate-400">Enter your email and your password (or Admin PIN 1234) to access your workspace.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={loginEmailInput}
                onChange={(e) => setLoginEmailInput(e.target.value)}
                placeholder="worksample822@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 text-center">Password / Admin PIN (Default: 1234)</label>
              <PinInputBox value={loginPinInput} onChange={setLoginPinInput} length={4} />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition text-center"
            >
              Authenticate & Login
            </button>
          </form>
          <div className="text-center text-[10px] text-slate-500">
            Protected Team Workspace • Secure Session Verification
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        users={users}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={() => { 
          setIsLoggedIn(false); 
          setIsAdminUnlocked(false);
          localStorage.clear();
        }}
        onOpenProfile={() => setSelectedUserProfile(currentUser)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={handleNavigate}
          darkMode={darkMode}
          unresolvedCount={unresolvedCount}
          currentUserRole={currentUser.role}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {currentView === 'dashboard' && (
            <DashboardView
              stats={stats}
              questions={questions}
              users={users}
              onOpenAddQuestion={() => setShowAddQuestion(true)}
              onSelectQuestion={setSelectedQuestion}
              darkMode={darkMode}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'questions' && (
            <QuestionsView
              questions={questions}
              tags={tags}
              onOpenAddQuestion={() => setShowAddQuestion(true)}
              onSelectQuestion={setSelectedQuestion}
              onToggleBookmark={handleToggleBookmark}
              onDeleteQuestion={handleDeleteQuestion}
              darkMode={darkMode}
            />
          )}

          {currentView === 'leaderboard' && (
            <LeaderboardView
              users={users}
              darkMode={darkMode}
              onSelectUser={setSelectedUserProfile}
            />
          )}

          {currentView === 'activity' && (
            <ActivityView
              darkMode={darkMode}
            />
          )}

          {currentView === 'admin' && (
            <AdminView
              darkMode={darkMode}
              users={users}
              onRefreshUsers={fetchInitialData}
              questions={questions}
              onRefreshQuestions={fetchInitialData}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          currentUser={currentUser}
          onClose={() => { setSelectedQuestion(null); fetchInitialData(); }}
          darkMode={darkMode}
          onUpdateQuestionStatus={handleUpdateQuestionStatus}
          onDeleteQuestion={handleDeleteQuestion}
        />
      )}

      {showAddQuestion && (
        <AddQuestionModal
          currentUser={currentUser.username}
          onClose={() => setShowAddQuestion(false)}
          onQuestionAdded={fetchInitialData}
          darkMode={darkMode}
        />
      )}

      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">Admin PIN Required</h3>
                <p className="text-xs text-slate-400">Enter Admin PIN to access Control Panel.</p>
              </div>
            </div>

            <form onSubmit={handleVerifyAdminPin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 text-center">Admin PIN (Default: 1234)</label>
                <PinInputBox value={adminPinInput} onChange={setAdminPinInput} length={4} />
              </div>

              {adminPinError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {adminPinError}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
                >
                  Verify & Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UserProfileModal
        user={selectedUserProfile}
        isOpen={Boolean(selectedUserProfile)}
        onClose={() => setSelectedUserProfile(null)}
        onUpdateUser={(updated) => {
          setUsers(users.map(u => u.id === updated.id ? updated : u));
          if (currentUser.id === updated.id) {
            setCurrentUser(updated);
          }
          setSelectedUserProfile(updated);
          fetchInitialData();
        }}
        currentUserRole={currentUser.role}
        darkMode={darkMode}
      />
    </div>
  );
}
