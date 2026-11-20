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
  Radio,
  Sparkles,
  Clock,
  Maximize2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getFullImageUrl } from '../../services/api';
import { useGame } from '../../context/GameContext';
import { Question, Team, CompetitionSettings, LeaderboardEntry } from '../../types';
import { Timer } from '../common/Timer';
import { AnswerRevealModal } from '../common/AnswerRevealModal';

export const LiveControlRoom: React.FC = () => {
  const { gameState, fetchGameState, remainingSeconds } = useGame();
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardEntry[]>([]);
  const [rightColTab, setRightColTab] = useState<'responses' | 'roundScores'>('responses');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'submitted' | 'not_submitted'>('all');
  const [selectedRound, setSelectedRound] = useState<number>(gameState?.currentRound || 1);
  const [selectedQuestionNum, setSelectedQuestionNum] = useState<number>(gameState?.currentQuestionNumber || 1);
  const [currentQuestionData, setCurrentQuestionData] = useState<Question | null>(null);
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);

  const [approvedTeams, setApprovedTeams] = useState<Team[]>([]);
  const [liveSubmissions, setLiveSubmissions] = useState<any[]>([]);
  const [teamScoresMap, setTeamScoresMap] = useState<Record<string, number>>({});
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isR2ImageZoomed, setIsR2ImageZoomed] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState<string | null>(null);

  // Load team cumulative scores across the competition
  const loadLeaderboardScores = async () => {
    try {
      const res = await api.getLeaderboard();
      if (res.success && res.leaderboard) {
        setLeaderboardList(res.leaderboard);
        const scoreMap: Record<string, number> = {};
        res.leaderboard.forEach((item: any) => {
          if (item.teamMongoId) scoreMap[item.teamMongoId] = item.totalScore;
          if (item.teamId) scoreMap[item.teamId] = item.totalScore;
        });
        setTeamScoresMap(prev => ({ ...prev, ...scoreMap }));
      }
    } catch {
      // ignore
    }
  };

  // Load approved teams
  const loadTeams = async () => {
    try {
      const res = await api.getAllTeams();
      if (res.success && res.teams) {
        setApprovedTeams(res.teams.filter((t: Team) => t.status === 'approved'));
      }
      await loadLeaderboardScores();
    } catch {
      // ignore
    }
  };

  // Load question data for selected round & question
  const loadQuestionData = async (round: number, qNum: number) => {
    try {
      const res = await api.getQuestions(round);
      if (res.success && res.questions) {
        setRoundQuestions(res.questions);
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
        if (res.teamScoresMap) {
          setTeamScoresMap(prev => ({ ...prev, ...res.teamScoresMap }));
        }
      }
      await loadLeaderboardScores();
    } catch {
      // ignore
    }
  };

  // Load competition settings to synchronize round timers & point rules
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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchGameState();
    await loadSettings();
    await loadTeams();
    await loadLeaderboardScores();
    if (currentQuestionData?._id) {
      await loadSubmissions(currentQuestionData._id);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadSettings();
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
        if (res.question) {
          setCurrentQuestionData(res.question);
        }
        await fetchGameState();
        if (currentQuestionData?._id || res.question?._id) {
          await loadSubmissions(res.question?._id || currentQuestionData?._id);
        }
        await loadLeaderboardScores();
        setActionMessage('Answers evaluated and revealed to all participants!');
        setIsRevealModalOpen(true);
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

  const isCurrentEnded =
    gameState?.currentRound === selectedRound &&
    gameState?.currentQuestionNumber === selectedQuestionNum &&
    gameState?.questionStatus === 'ENDED';

  const isCurrentRevealed =
    gameState?.currentRound === selectedRound &&
    gameState?.currentQuestionNumber === selectedQuestionNum &&
    gameState?.questionStatus === 'REVEALED';

  const isSelectedCompleted =
    isCurrentRevealed ||
    gameState?.completedQuestions?.some(
      cq => Number(cq.round) === Number(selectedRound) && Number(cq.questionNumber) === Number(selectedQuestionNum)
    ) ||
    liveSubmissions?.some(
      s => s.isEvaluated && Number(s.round) === Number(selectedRound) && Number(s.questionNumber) === Number(selectedQuestionNum)
    );

  const effectiveTimer = selectedRound === 1
    ? (settings?.round1Timer ?? currentQuestionData?.timerSeconds ?? 30)
    : selectedRound === 2
    ? (settings?.round2Timer ?? currentQuestionData?.timerSeconds ?? 15)
    : (settings?.round3Timer ?? currentQuestionData?.timerSeconds ?? 30);

  const submittedTeamIds = new Set(
    liveSubmissions.map(s => (s.teamId?.teamId || s.teamId?._id || s.teamId || '').toString())
  );

  const submittedCount = approvedTeams.filter(t =>
    submittedTeamIds.has(t.teamId) || submittedTeamIds.has(t._id.toString())
  ).length;

  const notSubmittedCount = Math.max(0, approvedTeams.length - submittedCount);

  const submissionPercentage =
    approvedTeams.length > 0
      ? Math.round((submittedCount / approvedTeams.length) * 100)
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
          {
            round: 1,
            title: 'Round 1: Fastest Finger First',
            desc: 'Sequence Ordering',
            timer: settings?.round1Timer ?? 30,
            points: settings?.round1Points ?? 10
          },
          {
            round: 2,
            title: 'Round 2: Guess the Defect',
            desc: 'Defect Image Matching',
            timer: settings?.round2Timer ?? 15,
            points: settings?.round2AllCorrectPoints ?? 10
          },
          {
            round: 3,
            title: 'Round 3: Quality MSQ',
            desc: 'Multiple Select Challenge',
            timer: settings?.round3Timer ?? 30,
            points: settings?.round3CorrectPoints ?? 20
          }
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
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-850 text-indigo-300 border border-indigo-500/30">
                    ⏱️ {r.timer}s · 🎯 {r.points} pts
                  </span>
                  {isLiveRound && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Radio className="w-3 h-3 text-emerald-400" /> ACTIVE
                    </span>
                  )}
                </div>
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
        {Array.from(new Set([
          ...[1, 2, 3, 4, 5],
          ...roundQuestions.map(q => q.questionNumber)
        ])).sort((a, b) => a - b).map(qNum => {
          const isSelected = selectedQuestionNum === qNum;
          const isActiveQ =
            gameState?.currentRound === selectedRound && gameState?.currentQuestionNumber === qNum;
          const isQCompleted =
            (gameState?.currentRound === selectedRound &&
              gameState?.currentQuestionNumber === qNum &&
              gameState?.questionStatus === 'REVEALED') ||
            gameState?.completedQuestions?.some(
              cq => Number(cq.round) === Number(selectedRound) && Number(cq.questionNumber) === Number(qNum)
            );

          return (
            <button
              key={qNum}
              type="button"
              onClick={() => setSelectedQuestionNum(qNum)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                  : isQCompleted
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isActiveQ && <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />}
              {isQCompleted && !isActiveQ && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              <span>Q{qNum}</span>
              {isQCompleted && (
                <span className="text-[9px] font-bold uppercase px-1 rounded bg-emerald-500/20 text-emerald-300">
                  Done
                </span>
              )}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      Round {selectedRound} : Question {selectedQuestionNum}
                    </span>
                    {isSelectedCompleted && (
                      <span className="text-xs uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        COMPLETED &amp; REVEALED
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white mt-2 leading-snug">
                    {currentQuestionData.prompt}
                  </h2>
                </div>
              </div>

              {/* Round 2 Question Presentation (Shows Scrambled Arrangement as seen by Participants) */}
              {currentQuestionData.round === 2 && (
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-4 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 text-cyan-400 uppercase tracking-wider">
                      <Eye className="w-4 h-4" />
                      Live Participant View: Scrambled Image Layout
                    </span>
                    <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Scrambled layout matching participant screen
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {currentQuestionData.round2Defects?.map((d, slotIdx) => {
                      // Determine the image placed into this slot initially
                      const initialImgId = currentQuestionData.round2InitialOrder?.[slotIdx];
                      const scrambledImgUrl =
                        (initialImgId && currentQuestionData.round2Images?.find(i => i.id === initialImgId)?.imageUrl) ||
                        d.imageUrl ||
                        currentQuestionData.round2ImageUrl ||
                        null;

                      return (
                        <div
                          key={d.id}
                          onClick={() => {
                            if (scrambledImgUrl) {
                              setZoomImageSrc(scrambledImgUrl);
                              setIsR2ImageZoomed(true);
                            }
                          }}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-cyan-400 font-bold uppercase">{d.label}</span>
                            <span className="font-black text-white bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 truncate max-w-[100px]">
                              {d.correctTerm}
                            </span>
                          </div>

                          {scrambledImgUrl ? (
                            <div className="h-28 rounded-lg overflow-hidden border border-slate-800 bg-black/50 flex items-center justify-center relative">
                              <img
                                src={getFullImageUrl(scrambledImgUrl)}
                                alt={`Slot ${slotIdx + 1} Image`}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-4 h-4 text-cyan-300" />
                              </div>
                            </div>
                          ) : (
                            <div className="h-28 rounded-lg bg-slate-950 text-slate-500 text-[10px] flex items-center justify-center">
                              No image
                            </div>
                          )}

                          <div className="text-center text-[10px] text-slate-400 font-medium">
                            {initialImgId ? `Image [${initialImgId}] in Slot #${slotIdx + 1}` : `Slot #${slotIdx + 1}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* If completed, show the official answer clearly below the question */}
              {isSelectedCompleted && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/50 shadow-xl shadow-emerald-950/30 space-y-3 animate-slide-in-up">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                        Official Correct Answer Key (Completed)
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>

                  {/* Round 1 Answer Order */}
                  {currentQuestionData.round === 1 && currentQuestionData.round1CorrectOrder && (
                    <div className="space-y-2">
                      <span className="text-xs text-slate-300 font-bold block">Correct Sequence Order:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {currentQuestionData.round1CorrectOrder.map((actId, idx) => {
                          const act = currentQuestionData.round1Activities?.find(a => a.id === actId);
                          return (
                            <div key={actId} className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                                #{idx + 1}
                              </span>
                              <span className="font-semibold text-white">
                                <strong className="text-emerald-300">[{actId}]</strong> {act?.text || actId}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Round 2 Answer Defects */}
                  {currentQuestionData.round === 2 && currentQuestionData.round2Defects && (
                    <div className="space-y-2">
                      <span className="text-xs text-slate-300 font-bold block">Correct Defect Mappings &amp; Official Images (Answer Key):</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        {currentQuestionData.round2Defects.map(d => {
                          const correctImgUrl =
                            d.imageUrl ||
                            (d.correctImageId && currentQuestionData.round2Images?.find(i => i.id === d.correctImageId)?.imageUrl) ||
                            null;

                          return (
                            <div key={d.id} className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-300">{d.label}</span>
                                <span className="font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 truncate max-w-[100px]">
                                  {d.correctTerm}
                                </span>
                              </div>
                              {correctImgUrl && (
                                <div className="h-20 rounded-lg overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center">
                                  <img
                                    src={getFullImageUrl(correctImgUrl)}
                                    alt={d.correctTerm}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Round 3 Answer MSQ */}
                  {currentQuestionData.round === 3 && currentQuestionData.round3Options && (
                    <div className="space-y-2">
                      <span className="text-xs text-slate-300 font-bold block">Correct Option Combination:</span>
                      <div className="space-y-1.5 text-xs">
                        {currentQuestionData.round3Options.map(opt => {
                          const isCorrect = currentQuestionData.round3CorrectOptions?.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-500/50 text-white font-semibold'
                                  : 'bg-slate-900/50 border-slate-800 text-slate-400 opacity-60'
                              }`}
                            >
                              <span>
                                <strong className="text-indigo-400 font-bold">[{opt.id}]</strong> {opt.text}
                              </span>
                              {isCorrect ? (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                                  CORRECT
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">INCORRECT</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* R1 Preview (if not completed) */}
              {!isSelectedCompleted && currentQuestionData.round1Activities && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Activities to Sequence:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {currentQuestionData.round1Activities.map(a => (
                      <div key={a.id} className="p-2 rounded bg-slate-950 text-slate-300">
                        <strong className="text-indigo-400">[{a.id}]</strong> {a.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* R2 Preview (if not completed) */}
              {!isSelectedCompleted && currentQuestionData.round === 2 && (
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

              {/* R3 Preview (if not completed) */}
              {!isSelectedCompleted && currentQuestionData.round3Options && (
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
                  {/* Condition 1: Question is already COMPLETED / REVEALED -> NO START BUTTON EVER */}
                  {isSelectedCompleted ? (
                    <>
                      <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-black shadow-lg shadow-emerald-950/30">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="block text-white font-extrabold text-xs">QUESTION COMPLETED</span>
                          <span className="text-[10px] text-emerald-400 font-semibold">Answer revealed &amp; evaluated. Cannot be started again.</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsRevealModalOpen(true)}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Open Reveal Modal</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : isCurrentActive ? (
                    /* Condition 2: Question is actively running */
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
                  ) : isCurrentPaused ? (
                    /* Condition 3: Question is paused */
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
                  ) : isCurrentEnded ? (
                    /* Condition 4: Question ended, awaiting reveal */
                    <button
                      type="button"
                      onClick={handleRevealAnswer}
                      disabled={isActionLoading}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Reveal Answer &amp; Score</span>
                    </button>
                  ) : (
                    /* Condition 5: Unstarted question -> Show Start button */
                    <button
                      type="button"
                      onClick={handleStartQuestion}
                      disabled={isActionLoading}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Q{selectedQuestionNum} ({effectiveTimer}s Timer)</span>
                    </button>
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
              Server-Derived Timer ({effectiveTimer}s)
            </span>
            <Timer
              remainingSeconds={
                gameState?.currentQuestionNumber === selectedQuestionNum ? remainingSeconds : 0
              }
              totalDuration={gameState?.timerDuration || effectiveTimer}
              isPaused={isCurrentPaused}
            />
          </div>

          {/* Submission Gauge & Detailed Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Submissions Status
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Registered: <strong className="text-white">{approvedTeams.length}</strong>
              </span>
            </div>

            {/* Submitted vs Not Submitted KPI Grid */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between px-3">
                <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submitted</span>
                </span>
                <span className="text-lg font-black text-emerald-300 font-mono">
                  {submittedCount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between px-3">
                <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Not Submitted</span>
                </span>
                <span className="text-lg font-black text-amber-300 font-mono">
                  {notSubmittedCount}
                </span>
              </div>
            </div>

            <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${submissionPercentage}%` }}
              />
            </div>
          </div>

          {/* Submissions & Round Scores Tab Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRightColTab('responses')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    rightColTab === 'responses'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Q{selectedQuestionNum} Live
                </button>
                <button
                  type="button"
                  onClick={() => setRightColTab('roundScores')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    rightColTab === 'roundScores'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Round {selectedRound} Scores
                </button>
              </div>

              <button
                type="button"
                onClick={handleManualRefresh}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {rightColTab === 'responses' ? (
              <div className="space-y-2">
                {/* Filter Pills: All / Submitted / Not Submitted */}
                <div className="flex items-center gap-1.5 pt-0.5 pb-1">
                  <button
                    type="button"
                    onClick={() => setSubmissionFilter('all')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      submissionFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({approvedTeams.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionFilter('submitted')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      submissionFilter === 'submitted'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Submitted ({submittedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionFilter('not_submitted')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      submissionFilter === 'not_submitted'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Not Submitted ({notSubmittedCount})
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {approvedTeams.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No registered teams yet.</p>
                  ) : (
                    approvedTeams
                      .filter(t => {
                        const isSub = Boolean(
                          liveSubmissions.find(
                            s => s.teamId?.teamId === t.teamId || s.teamId === t.teamId || s.teamId?._id === t._id
                          )
                        );
                        if (submissionFilter === 'submitted') return isSub;
                        if (submissionFilter === 'not_submitted') return !isSub;
                        return true;
                      })
                      .map(t => {
                        const sub = liveSubmissions.find(
                          s => s.teamId?.teamId === t.teamId || s.teamId === t.teamId || s.teamId?._id === t._id
                        );
                        const isEvaluated = isSelectedCompleted || isCurrentRevealed || sub?.isEvaluated;
                        const questionScore = sub?.scoreResult?.totalScore;
                        const teamTotalScore = teamScoresMap[t._id] ?? teamScoresMap[t.teamId] ?? 0;

                        return (
                          <div
                            key={t._id}
                            className={`py-2 px-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                              isEvaluated && questionScore !== undefined && questionScore > 0
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                : isEvaluated && questionScore !== undefined && questionScore < 0
                                ? 'bg-red-950/30 border-red-500/40 text-red-200'
                                : sub
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-900/40 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono font-bold text-slate-400 shrink-0">{t.teamId}</span>
                              <span className="font-semibold text-white truncate max-w-[120px]">{t.teamName}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isEvaluated ? (
                                <>
                                  {questionScore !== undefined ? (
                                    <span
                                      className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg border ${
                                        questionScore > 0
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                          : questionScore < 0
                                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                          : 'bg-slate-800 text-slate-400 border-slate-700'
                                      }`}
                                    >
                                      {questionScore > 0 ? `+${questionScore}` : questionScore} PTS
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-mono text-slate-500">0 PTS</span>
                                  )}
                                </>
                              ) : sub ? (
                                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Submitted ({sub.submissionTimeSeconds ?? '—'}s)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                                  <span>⏳ Not Submitted</span>
                                </span>
                              )}

                              <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                                Total: {teamTotalScore}
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            ) : (
              /* Round Scores Tab for Quizmaster */
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {leaderboardList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No scores recorded yet.</p>
                ) : (
                  [...leaderboardList]
                    .sort((a, b) => {
                      const sa = selectedRound === 1 ? a.round1Score : selectedRound === 2 ? a.round2Score : a.round3Score;
                      const sb = selectedRound === 1 ? b.round1Score : selectedRound === 2 ? b.round2Score : b.round3Score;
                      return (sb ?? 0) - (sa ?? 0);
                    })
                    .map((item, idx) => {
                      const rScore = selectedRound === 1 ? item.round1Score : selectedRound === 2 ? item.round2Score : item.round3Score;
                      return (
                        <div
                          key={item.teamId}
                          className="py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="font-mono font-bold text-slate-400 shrink-0">{item.teamId}</span>
                            <span className="font-semibold text-white truncate max-w-[120px]">{item.teamName}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg border ${
                                (rScore ?? 0) > 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : (rScore ?? 0) < 0
                                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {(rScore ?? 0) > 0 ? `+${rScore}` : rScore ?? 0} PTS
                            </span>
                            <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                              Total: {item.totalScore}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}
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
      {/* Official Answer & Solution Reveal Modal for Quizmaster */}
      <AnswerRevealModal
        isOpen={isRevealModalOpen}
        onClose={() => setIsRevealModalOpen(false)}
        question={currentQuestionData}
        teamSubmissions={liveSubmissions}
        teamScoresMap={teamScoresMap}
        isAdmin={true}
        onNextQuestion={handleNextQuestion}
      />

      {/* Zoom Modal for Round 2 Defect Image in Admin Live Control */}
      {isR2ImageZoomed && (zoomImageSrc || currentQuestionData?.round2ImageUrl) && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setIsR2ImageZoomed(false);
            setZoomImageSrc(null);
          }}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] overflow-auto rounded-3xl border border-slate-700 p-4 bg-slate-950 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                Defect Inspection View (Round 2 — Question {selectedQuestionNum})
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsR2ImageZoomed(false);
                  setZoomImageSrc(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
              >
                ✕ Close Zoom
              </button>
            </div>
            <img
              src={getFullImageUrl(zoomImageSrc || currentQuestionData?.round2ImageUrl)}
              alt="Zoomed Defect"
              className="w-full max-h-[78vh] object-contain rounded-2xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
