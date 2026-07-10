import React, { useState, useEffect } from 'react';
import { Users, Mail, Activity, Shield, Trash2, Plus, RefreshCw, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { User, Question } from '../types';

interface AdminViewProps {
  darkMode: boolean;
  users: User[];
  onRefreshUsers: () => void;
  questions: Question[];
  onRefreshQuestions: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  darkMode,
  users,
  onRefreshUsers,
  questions,
  onRefreshQuestions
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'email_logs' | 'activity_logs' | 'archives'>('users');
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Python Developer');
  const [newPassword, setNewPassword] = useState('');

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPoints, setEditPoints] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    try {
      if (activeTab === 'email_logs') {
        const res = await fetch('/api/admin/email_logs');
        if (res.ok) setEmailLogs(await res.json());
      } else if (activeTab === 'activity_logs') {
        const res = await fetch('/api/admin/activity_logs');
        if (res.ok) setActivityLogs(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          role: newRole,
          status: 'active',
          password: newPassword
        })
      });
      if (res.ok) {
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setShowAddUserModal(false);
        onRefreshUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) onRefreshUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) onRefreshUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (id: string, archive: boolean) => {
    const endpoint = archive ? `/api/questions/${id}/archive` : `/api/questions/${id}/restore`;
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) onRefreshQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditUsername(u.username);
    setEditEmail((u as any).email || '');
    setEditRole(u.role);
    setEditPoints(u.points || '0');
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername,
          email: editEmail,
          role: editRole,
          points: editPoints
        })
      });
      if (res.ok) {
        setEditingUser(null);
        onRefreshUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cardBg = darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Control Panel</h2>
          <p className="text-xs text-slate-400">Manage team users, monitor automated email notifications, review activity logs, and archive questions.</p>
        </div>
        <button
          onClick={() => { onRefreshUsers(); onRefreshQuestions(); fetchLogs(); }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'users' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Management</span>
        </button>
        <button
          onClick={() => setActiveTab('email_logs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'email_logs' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Email Logs (email_logs.csv)</span>
        </button>
        <button
          onClick={() => setActiveTab('activity_logs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'activity_logs' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Activity Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('archives')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
            activeTab === 'archives' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Question Archives</span>
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Registered Team Users ({users.length})</h3>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-md shadow-indigo-600/30"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New User</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] font-mono ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                <tr>
                  <th className="p-3 border-b border-slate-800">User</th>
                  <th className="p-3 border-b border-slate-800">Email</th>
                  <th className="p-3 border-b border-slate-800">Role</th>
                  <th className="p-3 border-b border-slate-800">Status</th>
                  <th className="p-3 border-b border-slate-800">Points</th>
                  <th className="p-3 border-b border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-indigo-500/5 transition">
                    <td className="p-3 flex items-center space-x-3">
                      <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt={u.username} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                      <span className="font-semibold text-slate-200">{u.username}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{(u as any).email || 'No email'}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px]">{u.role}</span></td>
                    <td className="p-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        (!u.status || u.status === 'active') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {(!u.status || u.status === 'active') ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        {(!u.status || u.status === 'active') ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{u.points} pts</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"
                        title="Edit User"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition"
                      >
                        {(!u.status || u.status === 'active') ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                        title="Delete User"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Email Logs */}
      {activeTab === 'email_logs' && (
        <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm space-y-4`}>
          <h3 className="text-sm font-semibold">Automated Email Notification Logs (email_logs.csv)</h3>
          <p className="text-xs text-slate-400">Every time a question is added, updated, deleted, archived, or restored, automated emails are sent to all active registered members in <code className="text-indigo-400">users.csv</code>.</p>
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[60vh]">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] font-mono ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                <tr>
                  <th className="p-3 border-b border-slate-800">ID</th>
                  <th className="p-3 border-b border-slate-800">Recipient</th>
                  <th className="p-3 border-b border-slate-800">Subject</th>
                  <th className="p-3 border-b border-slate-800">Status</th>
                  <th className="p-3 border-b border-slate-800">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {emailLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-indigo-500/5 transition">
                    <td className="p-3 font-mono text-slate-500">#{log.id}</td>
                    <td className="p-3 font-mono text-indigo-400">{log.recipient}</td>
                    <td className="p-3 font-medium text-slate-200">{log.subject}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">{log.status}</span></td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Activity Logs */}
      {activeTab === 'activity_logs' && (
        <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm space-y-4`}>
          <h3 className="text-sm font-semibold">Activity Timeline Logs (activity_logs.csv)</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[60vh]">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] font-mono ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                <tr>
                  <th className="p-3 border-b border-slate-800">User</th>
                  <th className="p-3 border-b border-slate-800">Action</th>
                  <th className="p-3 border-b border-slate-800">Target</th>
                  <th className="p-3 border-b border-slate-800">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {activityLogs.map((act, idx) => (
                  <tr key={idx} className="hover:bg-indigo-500/5 transition">
                    <td className="p-3 font-semibold text-slate-200">{act.user}</td>
                    <td className="p-3 text-indigo-400">{act.action}</td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">{act.target}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{act.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Archives */}
      {activeTab === 'archives' && (
        <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm space-y-4`}>
          <h3 className="text-sm font-semibold">Question Archive & Restoration</h3>
          <p className="text-xs text-slate-400">Admin can archive or restore questions. Archiving triggers automated email notifications to all members.</p>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] font-mono ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                <tr>
                  <th className="p-3 border-b border-slate-800">ID</th>
                  <th className="p-3 border-b border-slate-800">Title</th>
                  <th className="p-3 border-b border-slate-800">Difficulty</th>
                  <th className="p-3 border-b border-slate-800">Status</th>
                  <th className="p-3 border-b border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {questions.map(q => {
                  const isArchived = (q as any).archived === 'true';
                  return (
                    <tr key={q.id} className="hover:bg-indigo-500/5 transition">
                      <td className="p-3 font-mono text-slate-500">#{q.id}</td>
                      <td className="p-3 font-semibold text-slate-200">{q.title}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px]">{q.difficulty}</span></td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          isArchived ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {isArchived ? 'Archived' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {isArchived ? (
                          <button
                            onClick={() => handleArchive(q.id, false)}
                            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-medium transition"
                          >
                            Restore Question
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(q.id, true)}
                            className="px-3 py-1 rounded bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 text-[10px] font-medium transition"
                          >
                            Archive Question
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${cardBg} shadow-2xl space-y-4`}>
            <h3 className="text-lg font-bold">Add New Team User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Python Developer">Python Developer</option>
                  <option value="Algorithm Specialist">Algorithm Specialist</option>
                  <option value="Data Engineer">Data Engineer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-md shadow-indigo-600/30"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${cardBg} shadow-2xl space-y-4`}>
            <h3 className="text-lg font-bold">Edit Team User</h3>
            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Python Developer">Python Developer</option>
                  <option value="Algorithm Specialist">Algorithm Specialist</option>
                  <option value="Data Engineer">Data Engineer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Points</label>
                <input
                  type="number"
                  required
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-md shadow-indigo-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
