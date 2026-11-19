import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { Timer } from '../common/Timer';
import { Round1Sequence } from '../rounds/Round1Sequence';
import { Round2DefectMatch } from '../rounds/Round2DefectMatch';
import { Round3MSQ } from '../rounds/Round3MSQ';
import { AnswerRevealCard } from '../rounds/AnswerRevealCard';
import { Users, Clock, Trophy, RefreshCw, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeamLobby: React.FC = () => {
  const { team } = useAuth();
  const {
    gameState,
    currentQuestion,
    remainingSeconds,
    isSubmitted,
    submissionResponse,
    revealedQuestion,
    fetchGameState,
    checkMySubmissionStatus,
    isFetchingState
  } = useGame();

  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());

  if (!team) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <h2 className="text-xl font-bold text-white mb-2">Team Authentication Required</h2>
        <p className="text-sm text-slate-400 mb-6">Please log in with your Team credentials.</p>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white"
        >
          Go to Team Login
        </Link>
      </div>
    );
  }

  const handleManualRefresh = async () => {
    await fetchGameState();
    await checkMySubmissionStatus();
    setLastRefreshedAt(new Date().toLocaleTimeString());
  };

  const isQuestionActive =
    gameState?.questionStatus === 'ACTIVE' || gameState?.questionStatus === 'PAUSED';
  const isQuestionRevealed = gameState?.questionStatus === 'REVEALED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Team Header Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {team.teamId}
              </span>
              <span className="text-xs font-semibold text-slate-400">| Active Team Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{team.teamName}</h1>
            <p className="text-xs text-amber-400 font-medium mt-0.5">
              Nominated Captain: <span className="font-bold">{team.captainName}</span>
            </p>
          </div>
        </div>

        {/* Live Timer or State pill */}
        <div className="flex items-center gap-3">
          {isQuestionActive ? (
            <Timer
              remainingSeconds={remainingSeconds}
              totalDuration={gameState?.timerDuration || 30}
              isPaused={gameState?.questionStatus === 'PAUSED'}
            />
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800">
              <Radio className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className="text-xs font-extrabold text-slate-200">
                  {gameState?.status === 'RUNNING'
                    ? `Round ${gameState.currentRound || '—'} In Progress`
                    : gameState?.status === 'COMPLETED'
                    ? 'Competition Completed'
                    : 'Lobby Waiting Mode'}
                </span>
              </div>
            </div>
          )}

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isFetchingState}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            title="Check for active question or updates"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingState ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Manual refresh feedback bar */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-400">
        <span>Click <strong>Refresh Status</strong> to pull live changes from Quizmaster</span>
        <span className="text-[11px] text-slate-500 font-mono">Last refreshed: {lastRefreshedAt}</span>
      </div>

      {/* Main Gameplay Container */}
      <div className="space-y-6">
        {/* State 1: Question is REVEALED */}
        {isQuestionRevealed && revealedQuestion ? (
          <div className="space-y-4">
            <AnswerRevealCard
              question={revealedQuestion}
              submissionResponse={submissionResponse}
              teamId={team.teamId}
            />
            <div className="text-center">
              <button
                type="button"
                onClick={handleManualRefresh}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-300 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh for Next Question</span>
              </button>
            </div>
          </div>
        ) : isQuestionActive && currentQuestion ? (
          /* State 2: Question is ACTIVE */
          <>
            {currentQuestion.round === 1 && (
              <Round1Sequence
                question={currentQuestion}
                isSubmitted={isSubmitted}
                onSubmitted={checkMySubmissionStatus}
              />
            )}
            {currentQuestion.round === 2 && (
              <Round2DefectMatch
                question={currentQuestion}
                isSubmitted={isSubmitted}
                onSubmitted={checkMySubmissionStatus}
              />
            )}
            {currentQuestion.round === 3 && (
              <Round3MSQ
                question={currentQuestion}
                isSubmitted={isSubmitted}
                onSubmitted={checkMySubmissionStatus}
              />
            )}
          </>
        ) : (
          /* State 3: Waiting Lounge */
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                {gameState?.status === 'COMPLETED'
                  ? 'The Challenge is Concluded!'
                  : 'Standing By for Next Challenge...'}
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                {gameState?.status === 'COMPLETED'
                  ? 'All technical rounds have finished. Check out the final leaderboard!'
                  : 'The Quizmaster controls the game. When a new question starts, click Refresh Status above to load it.'}
              </p>
            </div>

            {/* Big Manual Refresh CTA Button */}
            <div>
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isFetchingState}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 inline-flex items-center gap-2.5 active:scale-95 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingState ? 'animate-spin' : ''}`} />
                <span>{isFetchingState ? 'Checking Server...' : 'Check If Question Started (Refresh)'}</span>
              </button>
            </div>

            {/* Team Roster Card */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left">
              <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Team Roster (5 Members)</span>
                <span className="text-indigo-400">Verified</span>
              </p>
              <div className="space-y-2">
                {team.members.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/60 border border-slate-850"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
                      <span className="text-sm font-medium text-slate-200">{member.name}</span>
                    </div>
                    {member.isCaptain && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Captain
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold text-xs transition-colors"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>View Competition Leaderboard</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
