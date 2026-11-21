import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  X,
  Eye,
  Check,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Question, SubmissionResponse } from '../../types';
import { getFullImageUrl } from '../../services/api';

interface AnswerRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  submissionResponse?: SubmissionResponse | null;
  totalTeamScore?: number;
  teamSubmissions?: any[];
  teamScoresMap?: Record<string, number>;
  isAdmin?: boolean;
  onNextQuestion?: () => void;
}

export const AnswerRevealModal: React.FC<AnswerRevealModalProps> = ({
  isOpen,
  onClose,
  question,
  submissionResponse,
  totalTeamScore,
  teamSubmissions = [],
  teamScoresMap = {},
  isAdmin = false,
  onNextQuestion
}) => {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomedImgSrc, setZoomedImgSrc] = useState<string | null>(null);

  // Score calculations for participants
  const scoreResult = submissionResponse?.scoreResult;
  const isCorrect = scoreResult?.isCorrect ?? false;
  const totalScore = scoreResult?.totalScore ?? 0;

  // Trigger celebration confetti on modal open
  useEffect(() => {
    if (isOpen && (isAdmin || isCorrect || totalScore > 0)) {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#10B981', '#6366F1', '#F59E0B', '#8B5CF6', '#EC4899']
      });
    }
  }, [isOpen, isAdmin, isCorrect, totalScore]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImageZoomed) {
          setIsImageZoomed(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isImageZoomed, onClose]);

  if (!isOpen || !question) return null;

  const getRoundName = (round: number) => {
    if (round === 1) return 'Round 1 : Fastest Finger First';
    if (round === 2) return 'Round 2 : Guess the Defect';
    if (round === 3) return 'Round 3 : Quality Multi-Select';
    return `Round ${round}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md animate-overlay-fade transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-indigo-950/50 overflow-hidden animate-modal-pop z-10 my-auto">
        
        {/* Top Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500" />

        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {getRoundName(question.round)}
                </span>
                <span className="text-xs font-bold text-amber-400">
                  Question #{question.questionNumber}
                </span>
                {isAdmin && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Quizmaster Master Key
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Official Answer &amp; Solution Reveal
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto max-h-[calc(92vh-140px)]">

          {/* User Score Banner (Participant View) */}
          {!isAdmin && submissionResponse && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border text-center animate-slide-in-up ${
                totalScore > 0
                  ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : totalScore < 0
                  ? 'bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-red-500/50 shadow-lg shadow-red-500/10'
                  : 'bg-slate-900/90 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 text-left">
                  {totalScore > 0 ? (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <Trophy className="w-6 h-6 text-emerald-400" />
                    </div>
                  ) : totalScore < 0 ? (
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {totalScore > 0
                        ? 'Great Job! Correct Answer'
                        : totalScore < 0
                        ? 'Incorrect Submission'
                        : 'Submission Evaluated'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {scoreResult?.explanation || 'Quizmaster has evaluated this question.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      This Question
                    </span>
                    <span
                      className={`font-mono text-lg font-black ${
                        totalScore > 0
                          ? 'text-emerald-400'
                          : totalScore < 0
                          ? 'text-red-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {totalScore > 0 ? `+${totalScore}` : totalScore} PTS
                    </span>
                  </div>

                  {totalTeamScore !== undefined && (
                    <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-amber-500/30 text-right">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">
                        Total Secured
                      </span>
                      <span className="font-mono text-lg font-black text-amber-300">
                        {totalTeamScore} PTS
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin Info Banner */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between flex-wrap gap-2 animate-slide-in-up">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-xs text-indigo-200 font-medium">
                  Answers evaluated and verified. The master solution is now revealed to all participants.
                </span>
              </div>
            </div>
          )}

          {/* Section 1: The Question */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>The Question</span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-white leading-snug">
              {question.prompt}
            </h3>

            {question.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                {question.description}
              </p>
            )}

            {/* Round 2 Target Zones & 4 Configured Images */}
            {question.round === 2 && (
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Round 2 Target Zones &amp; Configured Images:
                  </span>
                  <span className="text-[10px] text-slate-500">Click any image to enlarge</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(question.round2Defects && question.round2Defects.length > 0
                    ? question.round2Defects
                    : [{ id: '1', label: 'Zone #1', correctTerm: '' }, { id: '2', label: 'Zone #2', correctTerm: '' }, { id: '3', label: 'Zone #3', correctTerm: '' }, { id: '4', label: 'Zone #4', correctTerm: '' }]
                  ).map((d: any, idx: number) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const zoneLetter = letters[idx] || String(idx + 1);
                    const label = d.label || `Zone #${idx + 1}`;
                    const term = d.correctTerm || '';
                    const defaultDefectSvgs = ['/defect-casting.svg', '/defect-machining.svg', '/defect-paint.svg', '/defect-welding.svg'];
                    
                    const imgUrl =
                      d.imageUrl ||
                      question.round2Images?.find(i => i.id === zoneLetter)?.imageUrl ||
                      (idx === 0 ? question.round2ImageUrl : '') ||
                      defaultDefectSvgs[idx % defaultDefectSvgs.length];

                    return (
                      <div
                        key={d.id || idx}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-cyan-400 font-bold uppercase">{label}</span>
                          {term && (
                            <span className="font-semibold text-white bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[85px]" title={term}>
                              {term}
                            </span>
                          )}
                        </div>

                        <div
                          onClick={() => {
                            if (imgUrl) {
                              setZoomedImgSrc(imgUrl);
                              setIsImageZoomed(true);
                            }
                          }}
                          className="h-24 rounded-lg overflow-hidden border border-slate-800 bg-black/50 flex items-center justify-center cursor-pointer group relative"
                        >
                          <img
                            src={getFullImageUrl(imgUrl)}
                            alt={label}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
                          </div>
                        </div>

                        <div className="text-center text-[10px] text-slate-400 font-medium">
                          Image [{zoneLetter}]
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Official Correct Answer Key (Highlighted with Animation) */}
          <div className="p-5 sm:p-6 rounded-2xl border bg-slate-950/90 border-emerald-500/60 shadow-xl shadow-emerald-500/10 space-y-4 animate-answer-glow">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider">
                    Official Correct Answer Key
                  </h4>
                  <p className="text-[11px] text-slate-400">Verified Quality Engineering Solution</p>
                </div>
              </div>
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                100% Verified
              </span>
            </div>

            {/* --- ROUND 1 ANSWER: Sequence Order --- */}
            {question.round === 1 && question.round1CorrectOrder && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-300">
                  Correct Sequence from Start to Finish:
                </p>
                <div className="space-y-2">
                  {question.round1CorrectOrder.map((actId, index) => {
                    const act = question.round1Activities?.find(a => a.id === actId);
                    return (
                      <div
                        key={actId}
                        className="p-3 sm:p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center gap-3 transition-transform hover:scale-[1.01]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                          #{index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/20">
                              Step {actId}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-white">
                              {act?.text || `Activity ${actId}`}
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- ROUND 2 ANSWER: Defect Mappings --- */}
            {question.round === 2 && question.round2Defects && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-300">
                  Correct Defect Identification &amp; Mapping:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.round2Defects.map(d => {
                    const correctMatchingImg =
                      (d.correctImageId && question.round2Images?.find(i => i.id === d.correctImageId)?.imageUrl) ||
                      d.imageUrl ||
                      '';

                    return (
                      <div
                        key={d.id}
                        className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2 transition-transform hover:scale-[1.01]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            {d.label}
                          </span>
                          <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-lg border border-emerald-500/40 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            {d.correctTerm}
                          </span>
                        </div>

                        {correctMatchingImg ? (
                          <div className="h-24 rounded-lg overflow-hidden border border-slate-800 bg-black/50 flex items-center justify-center">
                            <img
                              src={getFullImageUrl(correctMatchingImg)}
                              alt={d.correctTerm}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : null}

                        <div className="text-center text-[10px] text-emerald-400 font-bold bg-emerald-500/10 py-0.5 rounded border border-emerald-500/20">
                          Correct Match: Image [{d.correctImageId || 'A'}]
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- ROUND 3 ANSWER: MSQ Options --- */}
            {question.round === 3 && question.round3Options && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-300">
                  Correct Options Breakdown:
                </p>
                <div className="space-y-2">
                  {question.round3Options.map(opt => {
                    const isCorrectOption = question.round3CorrectOptions?.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 sm:p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                          isCorrectOption
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                            isCorrectOption
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <span className={`text-xs sm:text-sm font-medium flex-1 ${isCorrectOption ? 'text-white font-semibold' : ''}`}>
                          {opt.text}
                        </span>
                        {isCorrectOption ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3 text-emerald-400" />
                            CORRECT
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded bg-slate-800/40 shrink-0">
                            INCORRECT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Section 3: Team-Wise Secured Points (Quizmaster Admin Presentation View) */}
          {isAdmin && teamSubmissions && teamSubmissions.length > 0 && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Team-Wise Points Secured (Question #{question.questionNumber})</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {teamSubmissions.length} Teams Recorded
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {teamSubmissions.map((sub: any, idx: number) => {
                  const teamName = sub.teamId?.teamName || sub.teamName || 'Unknown Team';
                  const teamIdStr = sub.teamId?.teamId || sub.teamId || `Team #${idx + 1}`;
                  const mongoId = sub.teamId?._id?.toString() || (typeof sub.teamId === 'string' ? sub.teamId : '');
                  const score = sub.scoreResult?.totalScore ?? sub.evaluation?.totalScore ?? 0;
                  const totalScore = (mongoId && teamScoresMap[mongoId] !== undefined)
                    ? teamScoresMap[mongoId]
                    : (teamScoresMap[teamIdStr] !== undefined ? teamScoresMap[teamIdStr] : undefined);

                  return (
                    <div
                      key={sub._id || idx}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded shrink-0">
                          {teamIdStr}
                        </span>
                        <span className="font-semibold text-white truncate">{teamName}</span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {sub.submissionTimeSeconds !== undefined && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {sub.submissionTimeSeconds}s
                          </span>
                        )}
                        <span
                          className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                            score > 0
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : score < 0
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {score > 0 ? `+${score}` : score} PTS
                        </span>
                        {totalScore !== undefined && (
                          <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                            Total: {totalScore} PTS
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/80 shrink-0">
          <p className="text-xs text-slate-400">
            {isAdmin
              ? 'Quizmaster can proceed to the next question when ready.'
              : 'Stand by for the Quizmaster to launch the next question.'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
            >
              Close
            </button>

            {isAdmin && onNextQuestion && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNextQuestion();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Inspection Image Full Zoom Modal */}
      {isImageZoomed && (zoomedImgSrc || question.round2ImageUrl) && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-overlay-fade"
          onClick={() => {
            setIsImageZoomed(false);
            setZoomedImgSrc(null);
          }}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] overflow-auto rounded-2xl border border-slate-700 p-2 bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getFullImageUrl(zoomedImgSrc || question.round2ImageUrl || '')}
              alt="Inspection Zoomed"
              className="w-full h-auto max-h-[85vh] object-contain mx-auto"
            />
            <button
              type="button"
              onClick={() => {
                setIsImageZoomed(false);
                setZoomedImgSrc(null);
              }}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
