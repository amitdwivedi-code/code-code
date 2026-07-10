import React, { useState, useEffect } from 'react';
import { Activity } from '../types';
import { Activity as ActivityIcon } from 'lucide-react';

interface ActivityViewProps {
  darkMode: boolean;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ darkMode }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error(err));
  }, []);

  const cardBg = darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activity Timeline</h2>
        <p className="text-xs text-slate-400">Chronological feed of team actions, solution submissions, code reviews, and discussions.</p>
      </div>

      <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm space-y-6`}>
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-indigo-500/20">
          {activities.map((act, idx) => (
            <div key={idx} className="flex items-start space-x-4 relative">
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 ring-4 ring-indigo-500/10">
                <ActivityIcon className="h-3 w-3" />
              </div>
              <div className={`flex-1 p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-indigo-400">{act.user}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                </div>
                <p className="text-xs">
                  {act.action} <strong className="text-slate-200">{act.target}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
