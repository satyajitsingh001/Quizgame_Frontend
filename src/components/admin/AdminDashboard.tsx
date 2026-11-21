import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Trophy,
  ShieldCheck,
  Play,
  Settings,
  HelpCircle,
  Award,
  Radio,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useGame } from '../../context/GameContext';

export const AdminDashboard: React.FC = () => {
  const { gameState } = useGame();
  const [teamsCount, setTeamsCount] = useState(0);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [isRegOpen, setIsRegOpen] = useState(true);
  const [topTeams, setTopTeams] = useState<any[]>([]);

  const loadMetrics = async () => {
    try {
      const setRes = await api.getSettings();
      if (setRes.success && setRes.settings) {
        setIsRegOpen(setRes.settings.isRegistrationOpen);
      }

      const teamRes = await api.getAllTeams();
      if (teamRes.success && teamRes.teams) {
        setTeamsCount(teamRes.teams.length);
        setParticipantsCount(teamRes.teams.length);
      }

      const leadRes = await api.getLeaderboard();
      if (leadRes.success && leadRes.leaderboard) {
        setTopTeams(leadRes.leaderboard.slice(0, 5));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-950 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Quizmaster Central
            </span>
            <span className="text-xs text-slate-400">Quality Month 2026 Edition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Powering Performance 2026 Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Control the technical rounds, operate live countdown clocks, manage team submissions, and monitor rankings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/control"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Live Control Room</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Teams Registered */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Enrolled</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{teamsCount}</div>
          <p className="text-xs text-slate-400 mt-1">Total Registered Participants</p>
        </div>

        {/* Total Participants */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rosters</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{participantsCount}</div>
          <p className="text-xs text-slate-400 mt-1">Registered Team Members</p>
        </div>

        {/* Registration Status */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gate</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {isRegOpen ? (
              <span className="text-emerald-400">OPEN</span>
            ) : (
              <span className="text-red-400">CLOSED</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Team Portal Registration</p>
        </div>

        {/* Competition Game Status */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <Radio className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Engine</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {gameState?.status || 'NOT_STARTED'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {gameState?.currentRound ? `Round ${gameState.currentRound} Active` : 'Awaiting Quizmaster Start'}
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards & Top Leaderboard Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Navigation Tiles (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Administrative Modules &amp; Controls</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Link
              to="/admin/control"
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-indigo-400" />
                </div>
                <h3 className="font-bold text-white text-base">Live Competition Control Room</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Activate rounds, start authoritative timers, lock submissions, and reveal answers.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-400">
                <span>Enter Room</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/admin/teams"
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Team Management &amp; Approvals</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Review registrations, change captain designations, edit rosters, and approve teams.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-cyan-400">
                <span>Manage Teams</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/admin/questions"
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Question Bank Management</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manually create prompts, upload defect photos for Round 2, and set answer keys.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-400">
                <span>Open Question Bank</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/admin/settings"
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Competition Settings</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure round timers, scoring point parameters, and registration limits.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-400">
                <span>Configure Settings</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Col: Top Leaderboard Snapshot & Quick Adjustment */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard Snapshot</span>
            </h3>
            <Link to="/leaderboard" className="text-xs text-indigo-400 hover:underline">
              Full Standings
            </Link>
          </div>

          <div className="space-y-2">
            {topTeams.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No scores registered yet.</p>
            ) : (
              topTeams.map((item, idx) => (
                <div
                  key={item.teamId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-bold text-[10px] flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white leading-tight">{item.teamName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.teamId}</p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {item.totalScore} PTS
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
