import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { CompetitionSettings as SettingsType } from '../../types';

export const CompetitionSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setFeedback('');
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setFeedback('Competition settings saved and synchronized.');
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return <div className="text-center py-12 text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Module 14: Parameters &amp; Rules
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Competition Settings &amp; Rules</h1>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-indigo-400 hover:text-white">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Identity Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>Event Identity &amp; General Settings</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Competition Title</label>
              <input
                type="text"
                required
                value={settings.competitionTitle}
                onChange={e => setSettings({ ...settings, competitionTitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Sub-Title / Motto</label>
              <input
                type="text"
                value={settings.subTitle}
                onChange={e => setSettings({ ...settings, subTitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
              <input
                type="checkbox"
                checked={settings.isRegistrationOpen}
                onChange={e => setSettings({ ...settings, isRegistrationOpen: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span>Team Registration is OPEN</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
              <input
                type="checkbox"
                checked={settings.isLeaderboardVisibleToTeams}
                onChange={e => setSettings({ ...settings, isLeaderboardVisibleToTeams: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span>Display Leaderboard to Participants</span>
            </label>
          </div>
        </div>

        {/* Round Timers & Points Config */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Round 1 */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <span className="text-xs font-extrabold uppercase text-amber-400 block">Round 1 (Fastest Finger)</span>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Timer (Seconds)</label>
              <input
                type="number"
                value={settings.round1Timer}
                onChange={e => setSettings({ ...settings, round1Timer: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Base Correct Points</label>
              <input
                type="number"
                value={settings.round1Points}
                onChange={e => setSettings({ ...settings, round1Points: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Fastest Correct Bonus</label>
              <input
                type="number"
                value={settings.round1Bonus}
                onChange={e => setSettings({ ...settings, round1Bonus: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* Round 2 */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <span className="text-xs font-extrabold uppercase text-cyan-400 block">Round 2 (Guess Defect)</span>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Timer (Seconds)</label>
              <input
                type="number"
                value={settings.round2Timer}
                onChange={e => setSettings({ ...settings, round2Timer: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">All Correct Points</label>
              <input
                type="number"
                value={settings.round2AllCorrectPoints}
                onChange={e => setSettings({ ...settings, round2AllCorrectPoints: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Fewer Than 3 Penalty</label>
              <input
                type="number"
                value={settings.round2PenaltyPoints}
                onChange={e => setSettings({ ...settings, round2PenaltyPoints: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* Round 3 */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <span className="text-xs font-extrabold uppercase text-purple-400 block">Round 3 (Quality MSQ)</span>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Timer (Seconds)</label>
              <input
                type="number"
                value={settings.round3Timer}
                onChange={e => setSettings({ ...settings, round3Timer: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Exact Combination Points</label>
              <input
                type="number"
                value={settings.round3CorrectPoints}
                onChange={e => setSettings({ ...settings, round3CorrectPoints: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Wrong Answer Penalty</label>
              <input
                type="number"
                value={settings.round3WrongPenalty}
                onChange={e => setSettings({ ...settings, round3WrongPenalty: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="py-3.5 px-8 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Settings...' : 'Save & Synchronize Settings'}</span>
        </button>
      </form>
    </div>
  );
};
