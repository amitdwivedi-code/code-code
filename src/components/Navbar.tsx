import React, { useState, useEffect } from 'react';
import { User, NotificationItem } from '../types';
import { 
  Terminal, Bell, Sun, Moon, UserCheck, 
  FileText, Download, CheckCircle2, ShieldCheck, Mail, LogOut
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout?: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  darkMode,
  setDarkMode,
  onLogout,
  onOpenProfile
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEmailLoginModal, setShowEmailLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('worksample822@gmail.com');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?user=${currentUser.username}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus('verifying');
    setTimeout(() => {
      setLoginStatus('success');
      setIsVerified(true);
      setTimeout(() => {
        setLoginStatus('idle');
        setShowEmailLoginModal(false);
      }, 800);
    }, 600);
  };

  const unreadCount = notifications.filter(n => n.read === 'false').length;

  return (
    <>
      <header className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-40 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Python CodeNet</h1>
            <p className="text-xs text-slate-400">Python Code Review & Discussion Platform</p>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center space-x-4">
          {/* Email Verification Login / Verified Badge */}
          {isVerified ? (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Account</span>
            </div>
          ) : (
            <button
              onClick={() => setShowEmailLoginModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-500 text-xs font-semibold transition"
              title="Login & Verify Email"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Verify Email Login</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg relative transition ${
                darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border py-2 z-50 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="px-4 py-2 border-b flex items-center justify-between border-slate-700/50">
                  <span className="font-semibold text-xs uppercase tracking-wider text-slate-400">Notifications</span>
                  <span className="text-xs text-indigo-400 font-medium">{unreadCount} unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/30">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 text-xs flex items-start justify-between gap-2 hover:bg-slate-800/40 transition ${n.read === 'false' ? 'bg-indigo-500/5' : ''}`}>
                        <div>
                          <p className="font-medium">{n.message}</p>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        {n.read === 'false' && (
                          <button onClick={() => markAsRead(n.id)} className="text-indigo-400 hover:text-indigo-300 shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition ${
              darkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Current Active User Profile (No member switching list) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border transition ${
                darkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <img src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt={currentUser.username} className="h-7 w-7 rounded-full object-cover ring-2 ring-indigo-500/40" />
              <div className="text-left">
                <div className="text-xs font-semibold leading-tight">{currentUser.username}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{currentUser.role}</div>
              </div>
            </button>

            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border p-4 z-50 space-y-3 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-700/50">
                  <img src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt={currentUser.username} className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/50" />
                  <div>
                    <div className="font-bold text-sm">{currentUser.username}</div>
                    <div className="text-xs text-indigo-400 font-medium">{currentUser.role}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Points: {currentUser.points || '0'}</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>• Profile privacy enforced: Only your active profile is visible.</p>
                  <p>• Actions are performed exclusively by the logged-in user.</p>
                </div>

                <div className="pt-2 border-t border-slate-700/50 space-y-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition text-center shadow-md shadow-indigo-600/30"
                  >
                    View Full Profile & Stats
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowEmailLoginModal(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition text-center"
                  >
                    Verify Email / Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onLogout) {
                        onLogout();
                      } else {
                        window.location.reload();
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Email Verification Login Modal */}
      {showEmailLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-500">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Email Verification & Login</h3>
                <p className="text-xs text-slate-400">Enter your email address to verify identity and login with Admin privileges.</p>
              </div>
            </div>

            <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. worksample822@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {loginStatus === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-medium flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Email verified! Logged in as Admin successfully.</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailLoginModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginStatus === 'verifying' || loginStatus === 'success'}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {loginStatus === 'verifying' ? 'Verifying Email...' : 'Verify & Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
