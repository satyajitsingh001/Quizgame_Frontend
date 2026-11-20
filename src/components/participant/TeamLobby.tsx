import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { Timer } from '../common/Timer';
import { Round1Sequence } from '../rounds/Round1Sequence';
import { Round2DefectMatch } from '../rounds/Round2DefectMatch';
import { Round3MSQ } from '../rounds/Round3MSQ';
import { Users, Clock, RefreshCw, Radio, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeamLobby: React.FC = () => {
  const { team } = useAuth();
  const {
    gameState,
    currentQuestion,
    remainingSeconds,
    isSubmitted,
    setIsSubmitted,
    fetchGameState,
    checkMySubmissionStatus,
    isFetchingState
  } = useGame();

  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());

  // Track questions submitted locally by ID so they disappear instantly on click
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem('pp_submitted_qids');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markQuestionSubmitted = (qId: string) => {
    setSubmittedQuestionIds(prev => {
      const next = new Set(prev).add(qId);
      try {
        sessionStorage.setItem('pp_submitted_qids', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    setIsSubmitted(true);
  };

  const isCurrentQSubmitted = Boolean(
    isSubmitted ||
    (currentQuestion?._id && submittedQuestionIds.has(currentQuestion._id))
  );

  const isQuestionActive = Boolean(
    (gameState?.questionStatus === 'ACTIVE' || gameState?.questionStatus === 'PAUSED') &&
    remainingSeconds > 0
  );

  const isTimeUp = Boolean(
    gameState?.questionStatus === 'ENDED' ||
    gameState?.questionStatus === 'REVEALED' ||
    ((gameState?.questionStatus === 'ACTIVE' || gameState?.questionStatus === 'PAUSED') &&
      remainingSeconds <= 0)
  );

  // Real-time automatic polling:
  // Polls every 2 seconds when waiting for question, after submitting, or when timer ended
  useEffect(() => {
    const shouldPoll =
      !isQuestionActive ||
      isCurrentQSubmitted ||
      isTimeUp ||
      gameState?.questionStatus === 'ENDED' ||
      gameState?.questionStatus === 'REVEALED';

    if (shouldPoll) {
      const interval = setInterval(async () => {
        await fetchGameState();
        await checkMySubmissionStatus();
        setLastRefreshedAt(new Date().toLocaleTimeString());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isQuestionActive, isCurrentQSubmitted, isTimeUp, gameState?.questionStatus]);

  // Immediate sync when timer expires to ensure server state is captured
  useEffect(() => {
    if (isTimeUp && gameState?.questionStatus === 'ACTIVE') {
      fetchGameState();
    }
  }, [isTimeUp]);

  if (!team) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <h2 className="text-xl font-bold text-white mb-2">Participant Authentication Required</h2>
        <p className="text-sm text-slate-400 mb-6">Please log in with your credentials.</p>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const handleManualRefresh = async () => {
    await fetchGameState();
    await checkMySubmissionStatus();
    setLastRefreshedAt(new Date().toLocaleTimeString());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Participant Header Card (Points Secured removed) */}
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
              <span className="text-xs font-semibold text-slate-400">| Participant Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{team.teamName}</h1>
          </div>
        </div>

        {/* Live Timer or State pill & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live Timer (shown only when question is active with time remaining and user has not yet submitted) */}
          {isQuestionActive && !isCurrentQSubmitted ? (
            <Timer
              remainingSeconds={remainingSeconds}
              totalDuration={gameState?.timerDuration || 30}
              isPaused={gameState?.questionStatus === 'PAUSED'}
            />
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className="text-xs font-extrabold text-slate-200">
                  {isCurrentQSubmitted
                    ? 'Submitted • Standing By'
                    : isTimeUp
                    ? "Time's Up • Standing By"
                    : gameState?.status === 'RUNNING' && gameState?.currentRound
                    ? `Round ${gameState.currentRound} In Progress`
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

      {/* Live Auto-Sync Status Bar */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Auto-sync active — questions appear automatically</span>
        </span>
        <span className="text-[11px] text-slate-500 font-mono">Synced: {lastRefreshedAt}</span>
      </div>

      {/* Main Gameplay Container */}
      <div className="space-y-6">
        {/* State 1: Active question that user has NOT submitted yet -> Display Question */}
        {isQuestionActive && currentQuestion && !isCurrentQSubmitted ? (
          <>
            {currentQuestion.round === 1 && (
              <Round1Sequence
                question={currentQuestion}
                isSubmitted={isCurrentQSubmitted}
                onSubmitted={() => markQuestionSubmitted(currentQuestion._id)}
              />
            )}
            {currentQuestion.round === 2 && (
              <Round2DefectMatch
                question={currentQuestion}
                isSubmitted={isCurrentQSubmitted}
                onSubmitted={() => markQuestionSubmitted(currentQuestion._id)}
              />
            )}
            {currentQuestion.round === 3 && (
              <Round3MSQ
                question={currentQuestion}
                isSubmitted={isCurrentQSubmitted}
                onSubmitted={() => markQuestionSubmitted(currentQuestion._id)}
              />
            )}
          </>
        ) : isCurrentQSubmitted ? (
          /* State 2: Question Submitted -> Simple clean waiting screen */
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-6 animate-slide-in-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Response Submitted!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Your response is locked in. Please wait while the Quizmaster proceeds to the next question.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Auto-sync active • Next question will appear automatically</span>
            </div>
          </div>
        ) : isTimeUp ? (
          /* State 3: Timer expired before submission -> Time's up waiting screen */
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-6 animate-slide-in-up">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Time's Up!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                The timer for this question has expired. Please wait while the Quizmaster proceeds to the next question.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Auto-sync active • Next question will appear automatically</span>
            </div>
          </div>
        ) : (
          /* State 4: Waiting Lounge between questions or rounds */
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                {gameState?.status === 'COMPLETED'
                  ? 'Competition Completed!'
                  : 'Standing By for Next Question...'}
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {gameState?.status === 'COMPLETED'
                  ? 'All technical rounds have concluded. Thank you for participating!'
                  : 'The Quizmaster controls the game. Your screen will automatically load when the next question starts.'}
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isFetchingState}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 inline-flex items-center gap-2.5 active:scale-95 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingState ? 'animate-spin' : ''}`} />
                <span>{isFetchingState ? 'Checking Server...' : 'Refresh Status'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
