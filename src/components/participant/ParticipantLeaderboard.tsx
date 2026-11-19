import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { LeaderboardEntry } from '../../types';

export const ParticipantLeaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cumulative' | 1 | 2 | 3>('cumulative');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [roundLeaderboard, setRoundLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchScores = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'cumulative') {
        const res = await api.getLeaderboard();
        if (res.success && res.leaderboard) {
          setLeaderboard(res.leaderboard);
        }
      } else {
        const res = await api.getRoundLeaderboard(activeTab);
        if (res.success && res.leaderboard) {
          setRoundLeaderboard(res.leaderboard);
        }
      }
    } catch {
      // offline
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [activeTab]);

  // Fire celebratory confetti when viewing cumulative
  useEffect(() => {
    if (activeTab === 'cumulative' && leaderboard.length > 0) {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [activeTab, leaderboard.length]);

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-1">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Official Competition Standings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Leaderboard &amp; Rankings</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Scores calculated from verified submissions and approved adjustments.
        </p>

        {/* Manual Refresh CTA */}
        <div className="pt-2">
          <button
            onClick={fetchScores}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white border border-slate-700 text-xs font-bold inline-flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating Standings...' : 'Refresh Standings'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('cumulative')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cumulative'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          🏆 Cumulative Standings
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 1
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          Round 1 (Fastest Finger)
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 2
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          Round 2 (Guess the Defect)
        </button>
        <button
          onClick={() => setActiveTab(3)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 3
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          Round 3 (Quality MSQ)
        </button>
      </div>

      {/* Top 3 Podium Cards (Cumulative Only) */}
      {activeTab === 'cumulative' && top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 glass-card p-5 rounded-3xl border border-slate-700 text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-slate-400/20 border border-slate-400 text-slate-300 flex items-center justify-center mx-auto mb-3 font-black text-lg">
              2
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Silver Runner-Up
            </span>
            <h3 className="text-lg font-bold text-white mt-1">{top3[1].teamName}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {top3[1].teamId}</p>
            <div className="mt-3 py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 inline-block font-mono font-extrabold text-slate-200">
              {top3[1].totalScore} PTS
            </div>
          </div>

          {/* 1st Place (Gold Champion) */}
          <div className="order-1 md:order-2 glass-card p-6 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-950/30 to-slate-900 text-center relative overflow-hidden shadow-2xl shadow-amber-500/10 scale-105">
            <div className="absolute top-2 right-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            </div>
            <div className="w-14 h-14 rounded-full bg-amber-500/30 border-2 border-amber-400 text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <span className="text-[10px] uppercase font-extrabold text-amber-400 block tracking-widest">
              CHAMPION
            </span>
            <h3 className="text-xl font-black text-white mt-1">{top3[0].teamName}</h3>
            <p className="text-xs text-amber-300 font-mono mt-0.5">ID: {top3[0].teamId}</p>
            <div className="mt-3 py-2 px-4 rounded-xl bg-slate-950 border border-amber-500/40 inline-block font-mono text-xl font-black text-amber-400 shadow-md">
              {top3[0].totalScore} PTS
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 glass-card p-5 rounded-3xl border border-amber-700/50 text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-amber-800/20 border border-amber-700 text-amber-600 flex items-center justify-center mx-auto mb-3 font-black text-lg">
              3
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">
              Bronze 3rd Place
            </span>
            <h3 className="text-lg font-bold text-white mt-1">{top3[2].teamName}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {top3[2].teamId}</p>
            <div className="mt-3 py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 inline-block font-mono font-extrabold text-slate-200">
              {top3[2].totalScore} PTS
            </div>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>
              {activeTab === 'cumulative' ? 'Cumulative Leaderboard' : `Round ${activeTab} Standings`}
            </span>
          </h3>
          <button
            onClick={fetchScores}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Refresh Scores"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'cumulative' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Captain</th>
                  <th className="py-3.5 px-4 text-center">Round 1</th>
                  <th className="py-3.5 px-4 text-center">Round 2</th>
                  <th className="py-3.5 px-4 text-center">Round 3</th>
                  <th className="py-3.5 px-4 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No participating teams registered yet.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map(item => (
                    <tr key={item.teamId} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-slate-300 font-bold">#{item.rank}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white leading-tight">{item.teamName}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.teamId}</div>
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-slate-300">
                        {item.captainName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {item.round1Score}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {item.round2Score}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {item.round3Score}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-black text-base ${
                            item.totalScore > 0
                              ? 'text-emerald-400'
                              : item.totalScore < 0
                              ? 'text-red-400'
                              : 'text-slate-200'
                          }`}
                        >
                          {item.totalScore} PTS
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4">Captain</th>
                  <th className="py-3.5 px-4 text-right">Round {activeTab} Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {roundLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No scored questions for Round {activeTab} yet.
                    </td>
                  </tr>
                ) : (
                  roundLeaderboard.map((item, idx) => (
                    <tr key={item.teamId} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        #{item.rank || idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{item.teamName}</div>
                        <div className="text-xs text-slate-400 font-mono">{item.teamId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{item.captainName}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-black text-indigo-400 text-base">
                          {item.score} PTS
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
