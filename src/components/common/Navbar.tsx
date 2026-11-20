import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { Trophy, ShieldCheck, Users, LogOut, Radio, Home } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { admin, team, role, logoutAdmin, logoutTeam } = useAuth();
  const { gameState } = useGame();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (role === 'ADMIN') {
      logoutAdmin();
      navigate('/admin/login');
    } else {
      logoutTeam();
      navigate('/login');
    }
  };

  const getRoundLabel = () => {
    if (!gameState?.currentRound) return null;
    if (gameState.currentRound === 1) return 'R1: Fastest Finger';
    if (gameState.currentRound === 2) return 'R2: Guess the Defect';
    if (gameState.currentRound === 3) return 'R3: Quality MSQ';
    return `Round ${gameState.currentRound}`;
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-sm sm:text-base bg-gradient-to-r from-amber-400 via-indigo-200 to-white bg-clip-text text-transparent">
                POWERING PERFORMANCE 2026
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                QUALITY MONTH
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">The Ultimate Quality Challenge</p>
          </div>
        </Link>

        {/* Live Round / Status Pill */}
        {gameState?.status === 'RUNNING' && gameState.currentRound && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">LIVE</span>
            <span className="text-xs text-slate-300 font-medium">| {getRoundLabel()}</span>
            {gameState.currentQuestionNumber && (
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                Q{gameState.currentQuestionNumber}
              </span>
            )}
          </div>
        )}

        {/* Right Navigation & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {role === 'ADMIN' ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin/control"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Quizmaster Panel</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout Admin"
                className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : role === 'TEAM' && team ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <Users className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-200 leading-none">{team.teamName}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">ID: {team.teamId}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout Team"
                className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 transition-all"
              >
                Register
              </Link>
              <Link
                to="/admin/login"
                title="Admin Login"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-800 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
