import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, ShieldCheck, Zap, Eye, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { CompetitionSettings } from '../types';

export const Home: React.FC = () => {
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);

  useEffect(() => {
    api.getSettings().then(res => {
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    }).catch(() => {});
  }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-amber-500/5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Quality Month 2026 Flagship Event</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          POWERING PERFORMANCE <span className="bg-gradient-to-r from-amber-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">2026</span>
        </h1>

        <p className="text-lg sm:text-xl font-bold text-slate-300">
          The Ultimate Quality Challenge
        </p>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Think Fast. Identify Defects. Win the Challenge. <br className="hidden sm:inline" />
          A 3-round digital quality competition featuring real-time synchronization, defect analysis, and live leaderboards.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="py-3.5 px-8 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>Register to Participate</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login"
            className="py-3.5 px-6 rounded-2xl font-bold text-sm text-slate-200 bg-slate-900 hover:bg-slate-850 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <span>Participant Login</span>
          </Link>

          <Link
            to="/admin/login"
            className="py-3.5 px-6 rounded-2xl font-bold text-sm text-amber-400 bg-slate-900 hover:bg-slate-850 border border-amber-500/30 flex items-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Quizmaster Console</span>
          </Link>
        </div>
      </div>

      {/* 3 Technical Rounds Showcase */}
      <div className="space-y-6">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">
            Competition Format
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Three Technical Rounds</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Round 1 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-amber-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">Round 1</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Fastest Finger First</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Arrange jumbled quality activities (A, B, C, D) into the correct sequence in {settings?.round1Timer ?? 30} seconds. Fastest completely correct team within {settings?.round1BonusThresholdSeconds ?? 15}s earns an additional +{settings?.round1Bonus ?? 5} point speed bonus!
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 font-semibold space-y-1">
              <div>🎯 {settings?.round1Points ?? 10} Points for Correct Sequence</div>
              <div>⚡ +{settings?.round1Bonus ?? 5} Speed Bonus (within {settings?.round1BonusThresholdSeconds ?? 15}s)</div>
            </div>
          </div>

          {/* Round 2 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-cyan-400 tracking-wider">Round 2</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Guess the Defect</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Inspect high-resolution photographs of defects (SMT assembly, foundry casting, automotive paint, and precision machining) and match terminology within {settings?.round2Timer ?? 15} seconds.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 font-semibold space-y-1">
              <div>🎯 +{settings?.round2AllCorrectPoints ?? 10} Points for All Correct</div>
              <div>⚡ +{settings?.round2PartialPoints ?? 5} Points for 3 Correct Matches</div>
              <div>⚠️ {settings?.round2PenaltyPoints ?? -5} Points Penalty for &lt;3 Correct</div>
            </div>
          </div>

          {/* Round 3 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Round 3</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Quality MSQ (Multiple Select)</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Participants answer rigorous Multiple-Select Questions in {settings?.round3Timer ?? 30} seconds. Exact correct option combination is required to earn +{settings?.round3CorrectPoints ?? 20} points.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 font-semibold space-y-1">
              <div>🎯 +{settings?.round3CorrectPoints ?? 20} Points for Exact Match</div>
              <div>⚠️ {settings?.round3WrongPenalty ?? -10} Points for Wrong Attempt</div>
              <div>⏱️ {settings?.round3UnansweredPenalty ?? -15} Points for Timeout / Blank</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center border-t border-slate-800/80 pt-8 text-xs text-slate-500">
        POWERING PERFORMANCE 2026 — THE ULTIMATE QUALITY CHALLENGE · Mobile-First Responsive Web Application
      </div>
    </div>
  );
};
