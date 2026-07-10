import React from 'react';
import { 
  LayoutDashboard, HelpCircle, Trophy, Activity, 
  FolderCode, Shield 
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  darkMode: boolean;
  unresolvedCount: number;
  currentUserRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  darkMode,
  unresolvedCount,
  currentUserRole
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'questions', label: 'Questions & Discussions', icon: HelpCircle, badge: unresolvedCount },
    { id: 'leaderboard', label: 'Member Leaderboard', icon: Trophy },
    { id: 'activity', label: 'Activity Timeline', icon: Activity },
    ...(currentUserRole === 'Admin' ? [
      { id: 'admin', label: 'Admin Control Panel', icon: Shield },
    ] : [])
  ];

  return (
    <aside className={`w-64 border-r flex flex-col justify-between shrink-0 select-none transition-colors ${
      darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
    }`}>
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</div>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Storage Info Box */}
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1">
            <FolderCode className="h-4 w-4" />
            <span>MySQL Database Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Persistent MySQL tables backing questions, nested discussions, solutions, and logs.
          </p>
          <div className="flex flex-wrap gap-1 text-[9px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">questions table</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">comments table</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">solutions table</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">users table</span>
          </div>
        </div>
      </div>

      <div className={`p-4 border-t text-xs text-center text-slate-400 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        Python CodeNet v2.5
      </div>
    </aside>
  );
};
