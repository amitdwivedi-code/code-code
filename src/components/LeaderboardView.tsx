import React from 'react';
import { User } from '../types';
import { Trophy, CheckCircle2, MessageSquare, Code, CheckSquare, Award } from 'lucide-react';

interface LeaderboardViewProps {
  users: User[];
  darkMode: boolean;
  onSelectUser?: (user: User) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ users, darkMode, onSelectUser }) => {
  const sortedUsers = [...users].sort((a, b) => Number(b.points) - Number(a.points));
  const cardBg = darkMode ? 'bg-slate-900 border-slate-800 text-slate-100 hover:border-indigo-500/50' : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-500/50';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team Progress & Leaderboard</h2>
        <p className="text-xs text-slate-400">Tracking progress, solved questions, discussions, code submissions, and review counts for our {users.length} team members. Click any member to view and edit details.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {sortedUsers.map((user, idx) => (
          <div
            key={user.id}
            onClick={() => onSelectUser && onSelectUser(user)}
            className={`p-6 rounded-2xl border ${cardBg} shadow-sm text-center relative overflow-hidden flex flex-col items-center justify-between cursor-pointer transition transform hover:-translate-y-1`}
          >
            {idx === 0 && (
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-bl-xl text-[10px] flex items-center gap-1">
                <Trophy className="h-3 w-3" /> #1 Rank
              </div>
            )}
            
            <div className="space-y-3">
              <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt={user.username} className="h-16 w-16 rounded-full object-cover mx-auto ring-4 ring-indigo-500/30" />
              <div>
                <h3 className="font-bold text-base">{user.username}</h3>
                <span className="text-xs text-indigo-400 font-medium">{user.role}</span>
              </div>
            </div>

            <div className="w-full space-y-2 my-4 text-xs">
              <div className="flex justify-between px-3 py-1.5 rounded-lg bg-slate-800/30">
                <span className="text-slate-400">Solved</span>
                <strong className="text-emerald-400">{user.solved_count} / {user.attempted_count}</strong>
              </div>
              <div className="flex justify-between px-3 py-1.5 rounded-lg bg-slate-800/30">
                <span className="text-slate-400">Comments</span>
                <strong className="text-violet-400">{user.comments_count}</strong>
              </div>
              <div className="flex justify-between px-3 py-1.5 rounded-lg bg-slate-800/30">
                <span className="text-slate-400">Code Commits</span>
                <strong className="text-sky-400">{user.code_count}</strong>
              </div>
              <div className="flex justify-between px-3 py-1.5 rounded-lg bg-slate-800/30">
                <span className="text-slate-400">Reviews</span>
                <strong className="text-amber-400">{user.reviews_count}</strong>
              </div>
            </div>

            <div className="w-full pt-3 border-t border-slate-700/40">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Points</span>
              <span className="text-xl font-extrabold text-indigo-400">{user.points} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
