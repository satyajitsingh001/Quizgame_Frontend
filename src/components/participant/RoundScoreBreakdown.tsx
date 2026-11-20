import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Users, ArrowUpRight, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { LeaderboardEntry } from '../../types';

interface RoundScoreBreakdownProps {
  currentTeamId?: string;
  defaultRound?: number;
  completedRounds?: number[];
  title?: string;
}

export const RoundScoreBreakdown: React.FC<RoundScoreBreakdownProps> = ({
  currentTeamId,
  defaultRound = 1,
  completedRounds = [],
  title
}) => {
  const [selectedRound, setSelectedRound] = useState<number>(defaultRound || 1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadLeaderboardData = async () => {
    try {
      const res = await api.getLeaderboard();
      if (res.success && Array.isArray(res.leaderboard)) {
        setLeaderboard(res.leaderboard);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  // Update default round when passed in
  useEffect(() => {
    if (defaultRound && [1, 2, 3].includes(defaultRound)) {
      setSelectedRound(defaultRound);
    }
  }, [defaultRound]);

  // Extract score for a specific round from an entry
  const getScoreForRound = (entry: LeaderboardEntry, round: number): number => {
    if (round === 1) return entry.round1Score ?? 0;
    if (round === 2) return entry.round2Score ?? 0;
    if (round === 3) return entry.round3Score ?? 0;
    return entry.totalScore ?? 0;
  };

  // Sort participants by score in the selected round descending
  const sortedParticipants = [...leaderboard].sort((a, b) => {
    const scoreA = getScoreForRound(a, selectedRound);
    const scoreB = getScoreForRound(b, selectedRound);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return (a.totalTimeSeconds || 0) - (b.totalTimeSeconds || 0);
  });

  // Assign round-specific ranks
  let currentRank = 1;
  const rankedParticipants = sortedParticipants.map((p, idx) => {
    const currentScore = getScoreForRound(p, selectedRound);
    if (idx > 0) {
      const prevScore = getScoreForRound(sortedParticipants[idx - 1], selectedRound);
      if (currentScore < prevScore) {
        currentRank = idx + 1;
      }
    }
    return {
      ...p,
      roundRank: currentRank,
      roundScore: currentScore
    };
  });

  // Find logged-in user in the ranked list
  const myEntry = rankedParticipants.find(
    p => currentTeamId && (p.teamId?.toUpperCase() === currentTeamId.toUpperCase() || p.teamMongoId === currentTeamId)
  );

  const roundName =
    selectedRound === 1
      ? 'Round 1: Fastest Finger First'
      : selectedRound === 2
      ? 'Round 2: Guess the Defect'
      : 'Round 3: Quality MSQ';

  const roundColor =
    selectedRound === 1
      ? 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300'
      : selectedRound === 2
      ? 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300'
      : 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300';

  const roundBadgeColor =
    selectedRound === 1
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : selectedRound === 2
      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
      : 'bg-purple-500/20 text-purple-300 border-purple-500/40';

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border ${roundBadgeColor}`}>
              <Sparkles className="w-3 h-3 inline mr-1" />
              Round Score Breakdown
            </span>
            {completedRounds.includes(selectedRound) && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Round Finished
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {title || `${roundName} Scores`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual points earned by each participant in this round.
          </p>
        </div>

        {/* Round Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          {[1, 2, 3].map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRound(r)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                selectedRound === r
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Round {r}
            </button>
          ))}
        </div>
      </div>

      {/* Logged-in User's Personal Performance Highlight */}
      {myEntry && (
        <div className={`p-5 rounded-2xl bg-gradient-to-r border ${roundColor} flex flex-wrap items-center justify-between gap-4 animate-fade-in`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center font-black text-lg text-white shadow-inner">
              #{myEntry.roundRank}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Your Round {selectedRound} Result
              </span>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{myEntry.teamName}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-800">
                  {myEntry.teamId}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Round {selectedRound} Score</span>
              <span
                className={`font-mono text-2xl font-black ${
                  myEntry.roundScore > 0
                    ? 'text-emerald-400'
                    : myEntry.roundScore < 0
                    ? 'text-red-400'
                    : 'text-slate-300'
                }`}
              >
                {myEntry.roundScore > 0 ? `+${myEntry.roundScore}` : myEntry.roundScore} PTS
              </span>
            </div>

            <div className="border-l border-white/10 pl-4 text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Total</span>
              <span className="font-mono text-2xl font-black text-amber-300">
                {myEntry.totalScore} PTS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Participants Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-3 pb-1">
          <span>Participant</span>
          <div className="flex items-center gap-6">
            <span>Round {selectedRound} Pts</span>
            <span className="w-16 text-right">Cumulative</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Loading round scores...</div>
        ) : rankedParticipants.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No participant scores recorded yet.</div>
        ) : (
          rankedParticipants.map(participant => {
            const isMe =
              currentTeamId &&
              (participant.teamId?.toUpperCase() === currentTeamId.toUpperCase() ||
                participant.teamMongoId === currentTeamId);

            return (
              <div
                key={participant.teamId}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  isMe
                    ? 'bg-indigo-950/40 border-indigo-500/60 text-white shadow-md shadow-indigo-600/10 ring-1 ring-indigo-500/40'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                {/* Left: Rank & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black shrink-0 text-xs ${
                      participant.roundRank === 1
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                        : participant.roundRank === 2
                        ? 'bg-slate-300 text-slate-950 font-black'
                        : participant.roundRank === 3
                        ? 'bg-amber-700 text-white font-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {participant.roundRank}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white truncate">{participant.teamName}</span>
                      {isMe && (
                        <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-indigo-500 text-white shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 block">{participant.teamId}</span>
                  </div>
                </div>

                {/* Right: Round Score & Overall Total */}
                <div className="flex items-center gap-6 shrink-0">
                  <span
                    className={`font-mono text-sm font-black px-2.5 py-0.5 rounded-xl border ${
                      participant.roundScore > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : participant.roundScore < 0
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {participant.roundScore > 0 ? `+${participant.roundScore}` : participant.roundScore} PTS
                  </span>

                  <span className="w-16 font-mono text-xs font-bold text-amber-400 text-right">
                    {participant.totalScore} PTS
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
