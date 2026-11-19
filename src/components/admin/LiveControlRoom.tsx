import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  CheckCircle2,
  Lock,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Radio
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useGame } from '../../context/GameContext';
import { Question, Team } from '../../types';
import { Timer } from '../common/Timer';

export const LiveControlRoom: React.FC = () => {
  const { gameState, fetchGameState, remainingSeconds } = useGame();
  const [selectedRound, setSelectedRound] = useState<number>(gameState?.currentRound || 1);
  const [selectedQuestionNum, setSelectedQuestionNum] = useState<number>(gameState?.currentQuestionNumber || 1);
  const [currentQuestionData, setCurrentQuestionData] = useState<Question | null>(null);

  const [approvedTeams, setApprovedTeams] = useState<Team[]>([]);
  const [liveSubmissions, setLiveSubmissions] = useState<any[]>([]);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load approved teams
  const loadTeams = async () => {
    try {
      const res = await api.getAllTeams();
      if (res.success && res.teams) {
        setApprovedTeams(res.teams.filter((t: Team) => t.status === 'approved'));
      }
    } catch {
      // ignore
    }
  };

  // Load question data for selected round & question
  const loadQuestionData = async (round: number, qNum: number) => {
    try {
      const res = await api.getQuestions(round);
      if (res.success && res.questions) {
        const found = res.questions.find((q: Question) => q.questionNumber === qNum);
        setCurrentQuestionData(found || null);
      }
    } catch {
      // ignore
    }
  };

  // Load submissions for current active question
  const loadSubmissions = async (questionId?: string) => {
    if (!questionId) {
      setLiveSubmissions([]);
      return;
    }
    try {
      const res = await api.getQuestionSubmissions(questionId);
      if (res.success && res.submissions) {
        setLiveSubmissions(res.submissions);
      }
    } catch {
      // ignore
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchGameState();
    await loadTeams();
    if (currentQuestionData?._id) {
      await loadSubmissions(currentQuestionData._id);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (gameState?.currentRound) {
      setSelectedRound(gameState.currentRound);
    }
    if (gameState?.currentQuestionNumber) {
      setSelectedQuestionNum(gameState.currentQuestionNumber);
    }
  }, [gameState?.currentRound, gameState?.currentQuestionNumber]);

  useEffect(() => {
    loadQuestionData(selectedRound, selectedQuestionNum);
  }, [selectedRound, selectedQuestionNum]);

  useEffect(() => {
    if (currentQuestionData?._id) {
      loadSubmissions(currentQuestionData._id);
    }
  }, [currentQuestionData?._id, gameState?.questionStatus]);

  // Actions
  const handleStartQuestion = async () => {
    if (!currentQuestionData) {
      setActionMessage(`Question ${selectedQuestionNum} for Round ${selectedRound} has not been created yet in Question Bank!`);
      return;
    }

    setIsActionLoading(true);
    setActionMessage('');
    try {
      if (gameState?.currentRound !== selectedRound) {
        await api.activateRound(selectedRound);
      }
      const res = await api.startQuestion(selectedQuestionNum);
      if (res.success) {
        setLiveSubmissions([]);
        await fetchGameState();
        setActionMessage(`Question ${selectedQuestionNum} started! Clock is running.`);
      } else {
        setActionMessage(res.message || 'Error starting question.');
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePauseQuestion = async () => {
    setIsActionLoading(true);
    try {
      await api.pauseQuestion();
      await fetchGameState();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResumeQuestion = async () => {
    setIsActionLoading(true);
    try {
      await api.resumeQuestion();
      await fetchGameState();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEndQuestion = async () => {
    setIsActionLoading(true);
    try {
      await api.endQuestion();
      await fetchGameState();
      setActionMessage('Submissions locked early by Quizmaster.');
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRevealAnswer = async () => {
    setIsActionLoading(true);
    try {
      const res = await api.revealAnswer();
      if (res.success) {
        await fetchGameState();
        if (currentQuestionData?._id) {
          await loadSubmissions(currentQuestionData._id);
        }
        setActionMessage('Answers evaluated and revealed to all participants!');
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (selectedQuestionNum < 5) {
      setSelectedQuestionNum(prev => prev + 1);
    } else if (selectedRound < 3) {
      setSelectedRound(prev => prev + 1);
      setSelectedQuestionNum(1);
    }
  };

  const handleResetCompetition = async () => {
    setIsActionLoading(true);
    try {
      await api.resetCompetition();
      setIsResetConfirmOpen(false);
      await fetchGameState();
      setLiveSubmissions([]);
      setActionMessage('Competition has been completely reset.');
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const isCurrentActive =
    gameState?.currentRound === selectedRound &&
    gameState?.currentQuestionNumber === selectedQuestionNum &&
    gameState?.questionStatus === 'ACTIVE';

  const isCurrentPaused =
    gameState?.currentRound === selectedRound &&
    gameState?.currentQuestionNumber === selectedQuestionNum &&
    gameState?.questionStatus === 'PAUSED';

  const isCurrentRevealed =
    gameState?.currentRound === selectedRound &&
    gameState?.currentQuestionNumber === selectedQuestionNum &&
    gameState?.questionStatus === 'REVEALED';

  const submissionPercentage =
    approvedTeams.length > 0
      ? Math.round((liveSubmissions.length / approvedTeams.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Quizmaster Action Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Quizmaster Engine
            </span>
            <span className="text-xs text-slate-400">Manual Refresh Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Live Competition Control Room</h1>
        </div>

        {/* Refresh & Reset Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Submissions &amp; State</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Competition</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-indigo-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Round Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { round: 1, title: 'Round 1: Fastest Finger First', desc: 'Sequence Ordering' },
          { round: 2, title: 'Round 2: Guess the Defect', desc: 'Defect Image Matching' },
          { round: 3, title: 'Round 3: Quality MSQ', desc: 'Captain Multiple Select' }
        ].map(r => {
          const isSelected = selectedRound === r.round;
          const isLiveRound = gameState?.currentRound === r.round;

          return (
            <button
              key={r.round}
              type="button"
              onClick={() => setSelectedRound(r.round)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase text-slate-400">Round {r.round}</span>
                {isLiveRound && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Radio className="w-3 h-3 text-emerald-400" /> ACTIVE
                  </span>
                )}
              </div>
              <p className="text-sm font-extrabold text-white">{r.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Question Selector Pills */}
      <div className="flex items-center gap-2 flex-wrap bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3">
          Select Question:
        </span>
        {[1, 2, 3, 4, 5].map(qNum => {
          const isSelected = selectedQuestionNum === qNum;
          const isActiveQ =
            gameState?.currentRound === selectedRound && gameState?.currentQuestionNumber === qNum;

          return (
            <button
              key={qNum}
              type="button"
              onClick={() => setSelectedQuestionNum(qNum)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isActiveQ && <Radio className="w-3 h-3 text-emerald-400" />}
              <span>Q{qNum}</span>
            </button>
          );
        })}
      </div>

      {/* Active Control & Question Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Detail & Actions */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          {!currentQuestionData ? (
            <div className="p-8 text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Round {selectedRound} Question {selectedQuestionNum} Has Not Been Added Yet
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No questions exist for this slot because all questions must be created manually.
                </p>
              </div>
              <Link
                to="/admin/questions"
                className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                + Add Question in Question Bank
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Round {selectedRound} : Question {selectedQuestionNum}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-2 leading-snug">
                    {currentQuestionData.prompt}
                  </h2>
                </div>
              </div>

              {/* R1 Preview */}
              {currentQuestionData.round1Activities && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Activities to Sequence:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {currentQuestionData.round1Activities.map(a => (
                      <div key={a.id} className="p-2 rounded bg-slate-950 text-slate-300">
                        <strong className="text-indigo-400">[{a.id}]</strong> {a.text}
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold mt-1">
                    Official Key: {currentQuestionData.round1CorrectOrder?.join(' ➔ ')}
                  </div>
                </div>
              )}

              {/* R2 Preview */}
              {currentQuestionData.round === 2 && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Defect Image &amp; Mapping:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {currentQuestionData.round2Defects?.map(d => (
                      <div key={d.id} className="p-2 rounded bg-slate-950 text-slate-300">
                        <span className="text-cyan-400 font-bold">{d.label}:</span> {d.correctTerm}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* R3 Preview */}
              {currentQuestionData.round3Options && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">MSQ Options:</span>
                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    {currentQuestionData.round3Options.map(opt => {
                      const isCorrect = currentQuestionData.round3CorrectOptions?.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          className={`p-2 rounded flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-950 text-slate-300'
                          }`}
                        >
                          <span>
                            <strong className="text-indigo-400">[{opt.id}]</strong> {opt.text}
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                              CORRECT KEY
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Control Buttons */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
                  Quizmaster Commands:
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {!isCurrentActive && !isCurrentPaused && !isCurrentRevealed && (
                    <button
                      type="button"
                      onClick={handleStartQuestion}
                      disabled={isActionLoading}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Q{selectedQuestionNum} ({currentQuestionData.timerSeconds}s Timer)</span>
                    </button>
                  )}

                  {isCurrentActive && (
                    <>
                      <button
                        type="button"
                        onClick={handlePauseQuestion}
                        disabled={isActionLoading}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Pause Timer</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleEndQuestion}
                        disabled={isActionLoading}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Lock Submissions</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRevealAnswer}
                        disabled={isActionLoading}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Reveal Answer &amp; Score</span>
                      </button>
                    </>
                  )}

                  {isCurrentPaused && (
                    <>
                      <button
                        type="button"
                        onClick={handleResumeQuestion}
                        disabled={isActionLoading}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Resume Timer</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRevealAnswer}
                        disabled={isActionLoading}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Reveal Answer &amp; Score</span>
                      </button>
                    </>
                  )}

                  {(isCurrentRevealed || gameState?.questionStatus === 'ENDED') && (
                    <>
                      {!isCurrentRevealed && (
                        <button
                          type="button"
                          onClick={handleRevealAnswer}
                          disabled={isActionLoading}
                          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Reveal Answer &amp; Score</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Col: Live Timer & Submissions Matrix */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="text-center">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block mb-2">
              Server-Derived Timer
            </span>
            <Timer
              remainingSeconds={
                gameState?.currentQuestionNumber === selectedQuestionNum ? remainingSeconds : 0
              }
              totalDuration={currentQuestionData?.timerSeconds || 30}
              isPaused={isCurrentPaused}
            />
          </div>

          {/* Submission Gauge */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Team Submissions</span>
              <span className="text-xs font-mono font-extrabold text-amber-400">
                {liveSubmissions.length} / {approvedTeams.length} ({submissionPercentage}%)
              </span>
            </div>

            <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${submissionPercentage}%` }}
              />
            </div>
          </div>

          {/* Submissions Team Status List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Team Responses:
              </span>
              <button
                type="button"
                onClick={handleManualRefresh}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {approvedTeams.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No registered teams yet.</p>
              ) : (
                approvedTeams.map(t => {
                  const sub = liveSubmissions.find(
                    s => s.teamId?.teamId === t.teamId || s.teamId === t.teamId || s.teamId?._id === t._id
                  );

                  return (
                    <div
                      key={t._id}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        sub
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">{t.teamId}</span>
                        <span className="font-semibold text-white">{t.teamName}</span>
                      </div>

                      <div>
                        {sub ? (
                          <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{sub.submissionTimeSeconds ?? '—'}s</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Thinking...</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-red-500/40 max-w-md w-full space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Reset Competition State?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear all submitted responses, reset scores in the Score Ledger, and return the competition to NOT STARTED. Registered teams and question bank will NOT be deleted.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetCompetition}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30"
              >
                Yes, Reset Competition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
