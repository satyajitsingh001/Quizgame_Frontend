import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { Timer } from '../common/Timer';
import { Round1Sequence } from '../rounds/Round1Sequence';
import { Round2DefectMatch } from '../rounds/Round2DefectMatch';
import { Round3MSQ } from '../rounds/Round3MSQ';
import { AnswerRevealCard } from '../rounds/AnswerRevealCard';
import { AnswerRevealModal } from '../common/AnswerRevealModal';
import { Users, Clock, Trophy, RefreshCw, Radio, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeamLobby: React.FC = () => {
  const { team } = useAuth();
  const {
    gameState,
    currentQuestion,
    remainingSeconds,
    isSubmitted,
    submissionResponse,
    teamScores,
    revealedQuestion,
    fetchGameState,
    checkMySubmissionStatus,
    isFetchingState
  } = useGame();

  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());
  const [isRevealModalOpen, setIsRevealModalOpen] = useState<boolean>(false);
  const lastRevealedIdRef = useRef<string | null>(null);
  const isInitialMount = useRef<boolean>(true);

  const isQuestionActive =
    gameState?.questionStatus === 'ACTIVE' || gameState?.questionStatus === 'PAUSED';
  const isQuestionVisible =
    (gameState?.questionStatus === 'ACTIVE' ||
      gameState?.questionStatus === 'PAUSED' ||
      gameState?.questionStatus === 'ENDED') &&
    currentQuestion !== null;
  const isQuestionRevealed = gameState?.questionStatus === 'REVEALED';

  // Check if this team actually submitted this question (not unattempted or timed out)
  const hasUserSubmitted = Boolean(
    isSubmitted &&
    submissionResponse &&
    submissionResponse.answerData !== null &&
    !submissionResponse.isTimeout
  );

  // Automatically pop up modal ONLY during a LIVE answer reveal if this team submitted,
  // NEVER on browser screen refresh or if already viewed/dismissed.
  useEffect(() => {
    if (!isQuestionRevealed || !revealedQuestion || !hasUserSubmitted) {
      if (!isQuestionRevealed) {
        lastRevealedIdRef.current = null;
      }
      setIsRevealModalOpen(false);
      return;
    }

    const modalSeenKey = `pp_reveal_modal_seen_${revealedQuestion._id}`;
    const alreadySeen = sessionStorage.getItem(modalSeenKey) === 'true';

    // On screen refresh / page reload: prevent modal from popping up automatically
    if (isInitialMount.current) {
      isInitialMount.current = false;
      sessionStorage.setItem(modalSeenKey, 'true');
      lastRevealedIdRef.current = revealedQuestion._id;
      return;
    }

    // Live transition to reveal: trigger modal once if not already seen/closed
    if (!alreadySeen && lastRevealedIdRef.current !== revealedQuestion._id) {
      lastRevealedIdRef.current = revealedQuestion._id;
      sessionStorage.setItem(modalSeenKey, 'true');
      setIsRevealModalOpen(true);
    }
  }, [isQuestionRevealed, revealedQuestion?._id, hasUserSubmitted]);

  const handleCloseRevealModal = () => {
    setIsRevealModalOpen(false);
    if (revealedQuestion?._id) {
      sessionStorage.setItem(`pp_reveal_modal_seen_${revealedQuestion._id}`, 'true');
    }
  };

  // When answer is revealed, immediately refresh scores to reflect new points
  useEffect(() => {
    if (isQuestionRevealed) {
      checkMySubmissionStatus();
    }
  }, [isQuestionRevealed]);

  // Real-time automatic polling:
  // - Polls every 2 seconds when waiting for question, waiting for reveal, or after submitting.
  // - When Quizmaster starts a question, participant's screen updates automatically with NO manual refresh.
  useEffect(() => {
    const shouldPoll = !isQuestionActive || isSubmitted || gameState?.questionStatus === 'ENDED';
    if (shouldPoll) {
      const interval = setInterval(async () => {
        await fetchGameState();
        await checkMySubmissionStatus();
        setLastRefreshedAt(new Date().toLocaleTimeString());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isQuestionActive, isSubmitted, gameState?.questionStatus]);

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
              <span className="text-xs font-semibold text-slate-400">| Participant Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{team.teamName}</h1>
          </div>
        </div>

        {/* Points Secured & Live State controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Team Secured Points Display */}
          <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/30 text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400">
                Points Secured
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-black text-amber-300">
                {teamScores?.totalScore ?? 0}
              </span>
              <span className="text-[11px] text-slate-400 font-bold">PTS</span>
              <div className="hidden sm:flex items-center gap-1.5 ml-2 text-[10px] font-mono text-slate-400 border-l border-slate-700 pl-2">
                <span>R1: <strong className="text-white">{teamScores?.round1Score ?? 0}</strong></span>
                <span>•</span>
                <span>R2: <strong className="text-white">{teamScores?.round2Score ?? 0}</strong></span>
                <span>•</span>
                <span>R3: <strong className="text-white">{teamScores?.round3Score ?? 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Live Timer or State pill */}
          {isQuestionActive ? (
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
                  {gameState?.questionStatus === 'REVEALED'
                    ? 'Answer Revealed • Stand By'
                    : gameState?.questionStatus === 'ENDED'
                    ? 'Submissions Locked • Awaiting Reveal'
                    : gameState?.status === 'RUNNING'
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

      {/* Live Auto-Sync Status Bar */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Auto-sync active — questions and answers appear automatically</span>
        </span>
        <span className="text-[11px] text-slate-500 font-mono">Synced: {lastRefreshedAt}</span>
      </div>

      {/* Main Gameplay Container */}
      <div className="space-y-6">
        {/* State 1: Question is REVEALED AND user submitted this question */}
        {isQuestionRevealed && hasUserSubmitted ? (
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-6 animate-slide-in-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Question #{revealedQuestion?.questionNumber || gameState?.currentQuestionNumber || ''} Answer Revealed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Official Solution Released
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                The Quizmaster has evaluated submissions and revealed the official answer key. Please stand by — your screen will automatically load the next question as soon as the Quizmaster starts it!
              </p>
            </div>

            {/* Points Secured Breakdown on this Question & Total */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-1">
              <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-1">
                  Points on this Question
                </span>
                <span
                  className={`font-mono text-2xl font-black ${
                    (submissionResponse?.scoreResult?.totalScore ?? 0) > 0
                      ? 'text-emerald-400'
                      : (submissionResponse?.scoreResult?.totalScore ?? 0) < 0
                      ? 'text-red-400'
                      : 'text-slate-300'
                  }`}
                >
                  {(submissionResponse?.scoreResult?.totalScore ?? 0) > 0
                    ? `+${submissionResponse?.scoreResult?.totalScore}`
                    : (submissionResponse?.scoreResult?.totalScore ?? 0)}{' '}
                  PTS
                </span>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-amber-500/30 text-center">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400 block mb-1">
                  Total Secured Score
                </span>
                <span className="font-mono text-2xl font-black text-amber-300">
                  {teamScores?.totalScore ?? 0} PTS
                </span>
              </div>
            </div>

            {/* Modal Trigger Button */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRevealModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>View Solution &amp; Answer Modal</span>
              </button>
            </div>

            {/* Auto-Sync Live Status Banner */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Auto-syncing live • Waiting for Quizmaster to start next question...</span>
            </div>
          </div>
        ) : isQuestionVisible && currentQuestion ? (
          /* State 2: Question is VISIBLE (ACTIVE, PAUSED, or ENDED - remains visible until revealed) */
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
      {/* Official Answer & Solution Reveal Modal */}
      <AnswerRevealModal
        isOpen={isRevealModalOpen}
        onClose={handleCloseRevealModal}
        question={revealedQuestion}
        submissionResponse={submissionResponse}
        totalTeamScore={teamScores?.totalScore}
        isAdmin={false}
      />
    </div>
  );
};
