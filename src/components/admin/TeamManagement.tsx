import React, { useState, useEffect } from 'react';
import { UserCheck, Check, X, Trash2, Edit2, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { api } from '../../services/api';
import { Team } from '../../types';

export const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [maxTeams, setMaxTeams] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadData = async () => {
    try {
      const settingsRes = await api.getSettings();
      if (settingsRes.success && settingsRes.settings) {
        setIsRegistrationOpen(settingsRes.settings.isRegistrationOpen);
        setMaxTeams(settingsRes.settings.maxTeams || 20);
      }

      const res = await api.getAllTeams();
      if (res.success && res.teams) {
        setTeams(res.teams);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleRegistration = async () => {
    try {
      const res = await api.updateSettings({ isRegistrationOpen: !isRegistrationOpen });
      if (res.success) {
        setIsRegistrationOpen(!isRegistrationOpen);
        setFeedbackMsg(`Registration is now ${!isRegistrationOpen ? 'OPEN' : 'CLOSED'}`);
      }
    } catch {
      // ignore
    }
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.approveRejectTeam(id, status);
      if (res.success) {
        loadData();
        setFeedbackMsg(`Team status set to ${status}`);
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string, teamName: string) => {
    if (!window.confirm(`Are you sure you want to remove team "${teamName}"?`)) return;
    try {
      const res = await api.deleteTeam(id);
      if (res.success) {
        loadData();
        setFeedbackMsg(`Team ${teamName} removed.`);
      }
    } catch {
      // ignore
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    try {
      const res = await api.updateTeam(editingTeam._id, editingTeam);
      if (res.success) {
        setEditingTeam(null);
        loadData();
        setFeedbackMsg('Team updated successfully.');
      }
    } catch {
      // ignore
    }
  };

  const filteredTeams = teams.filter(t =>
    t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.teamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.captainName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Module 3: Team Administration
            </span>
            <span className="text-xs text-slate-400">
              {teams.length} / {maxTeams} Slots Registered
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Registered Teams &amp; Rosters</h1>
        </div>

        {/* Registration Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleRegistration}
            className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-colors ${
              isRegistrationOpen
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-red-950/40 text-red-400 border-red-500/40 hover:bg-red-900/40'
            }`}
          >
            {isRegistrationOpen ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>Registration: {isRegistrationOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg('')} className="text-indigo-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by Team Name, ID, or Captain..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Teams Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Team Name</th>
                <th className="py-3.5 px-4">Nominated Captain</th>
                <th className="py-3.5 px-4 hidden md:table-cell">5 Roster Members</th>
                <th className="py-3.5 px-4">PIN</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No teams registered yet.
                  </td>
                </tr>
              ) : (
                filteredTeams.map(team => (
                  <tr key={team._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {team.teamId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {team.teamName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{team.captainName}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-400">
                      {team.members.map(m => m.name).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {team.pin || '••••'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${
                          team.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : team.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {team.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {team.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(team._id, 'approved')}
                            className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-800/40 text-emerald-400 border border-emerald-500/30"
                            title="Approve Team"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {team.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(team._id, 'rejected')}
                            className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-800/40 text-amber-400 border border-amber-500/30"
                            title="Reject Team"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingTeam({ ...team })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white"
                          title="Edit Team"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(team._id, team.teamName)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white"
                          title="Remove Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-700 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Team: {editingTeam.teamId}</h3>
              <button onClick={() => setEditingTeam(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={editingTeam.teamName}
                  onChange={e => setEditingTeam({ ...editingTeam, teamName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Nominated Captain</label>
                <input
                  type="text"
                  required
                  value={editingTeam.captainName}
                  onChange={e => setEditingTeam({ ...editingTeam, captainName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Security PIN</label>
                <input
                  type="text"
                  required
                  value={editingTeam.pin || ''}
                  onChange={e => setEditingTeam({ ...editingTeam, pin: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
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
