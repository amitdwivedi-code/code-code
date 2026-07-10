import React, { useState } from 'react';
import { User } from '../types';
import { X, Trophy, CheckCircle2, MessageSquare, Code, CheckSquare, Award, Edit3, Save, Shield } from 'lucide-react';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  currentUserRole: string;
  darkMode: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  currentUserRole,
  darkMode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [role, setRole] = useState(user?.role || '');
  const [email, setEmail] = useState((user as any)?.email || '');
  const [solvedCount, setSolvedCount] = useState(user?.solved_count || '0');
  const [attemptedCount, setAttemptedCount] = useState(user?.attempted_count || '0');
  const [commentsCount, setCommentsCount] = useState(user?.comments_count || '0');
  const [codeCount, setCodeCount] = useState(user?.code_count || '0');
  const [reviewsCount, setReviewsCount] = useState(user?.reviews_count || '0');
  const [points, setPoints] = useState(user?.points || '0');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRole(user.role);
      setEmail((user as any).email || '');
      setSolvedCount(user.solved_count || '0');
      setAttemptedCount(user.attempted_count || '0');
      setCommentsCount(user.comments_count || '0');
      setCodeCount(user.code_count || '0');
      setReviewsCount(user.reviews_count || '0');
      setPoints(user.points || '0');
      setIsEditing(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isAdmin = currentUserRole === 'Admin';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          role,
          email,
          solved_count: solvedCount,
          attempted_count: attemptedCount,
          comments_count: commentsCount,
          code_count: codeCount,
          reviews_count: reviewsCount,
          points
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateUser(updated);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const modalBg = darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const inputBg = darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900';
  const statCardBg = darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${modalBg}`}>
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-transparent">
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-500/40 shadow-md"
            />
            <div>
              <h2 className="text-xl font-bold tracking-tight">{user.username}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium">
                  {user.role}
                </span>
                {isAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Admin Access
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {!isEditing ? (
          <div className="p-6 space-y-6">
            <div className="text-xs text-slate-400 font-mono">
              Email: <span className="text-slate-200">{(user as any).email || 'No email specified'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl border ${statCardBg} flex items-center justify-between`}>
                <div>
                  <span className="text-xs text-slate-400 block">Solved Problems</span>
                  <span className="text-xl font-bold text-emerald-400">{user.solved_count} / {user.attempted_count}</span>
                </div>
                <CheckCircle2 className="h-6 w-6 text-emerald-400/60" />
              </div>

              <div className={`p-4 rounded-xl border ${statCardBg} flex items-center justify-between`}>
                <div>
                  <span className="text-xs text-slate-400 block">Total Points</span>
                  <span className="text-xl font-bold text-indigo-400">{user.points} pts</span>
                </div>
                <Trophy className="h-6 w-6 text-indigo-400/60" />
              </div>

              <div className={`p-4 rounded-xl border ${statCardBg} flex items-center justify-between`}>
                <div>
                  <span className="text-xs text-slate-400 block">Discussions & Comments</span>
                  <span className="text-lg font-bold text-violet-400">{user.comments_count}</span>
                </div>
                <MessageSquare className="h-5 w-5 text-violet-400/60" />
              </div>

              <div className={`p-4 rounded-xl border ${statCardBg} flex items-center justify-between`}>
                <div>
                  <span className="text-xs text-slate-400 block">Code Commits</span>
                  <span className="text-lg font-bold text-sky-400">{user.code_count}</span>
                </div>
                <Code className="h-5 w-5 text-sky-400/60" />
              </div>

              <div className={`p-4 rounded-xl border ${statCardBg} flex items-center justify-between col-span-2`}>
                <div>
                  <span className="text-xs text-slate-400 block">Code Reviews Completed</span>
                  <span className="text-lg font-bold text-amber-400">{user.reviews_count}</span>
                </div>
                <CheckSquare className="h-5 w-5 text-amber-400/60" />
              </div>
            </div>

            {isAdmin && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile & Statistics</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role / Specialization</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${inputBg}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 font-mono ${inputBg}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Solved Count</label>
                <input
                  type="number"
                  value={solvedCount}
                  onChange={(e) => setSolvedCount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Attempted Count</label>
                <input
                  type="number"
                  value={attemptedCount}
                  onChange={(e) => setAttemptedCount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Total Points</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 ${inputBg}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Comments</label>
                <input
                  type="number"
                  value={commentsCount}
                  onChange={(e) => setCommentsCount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Code Commits</label>
                <input
                  type="number"
                  value={codeCount}
                  onChange={(e) => setCodeCount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Reviews</label>
                <input
                  type="number"
                  value={reviewsCount}
                  onChange={(e) => setReviewsCount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-indigo-500 ${inputBg}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
