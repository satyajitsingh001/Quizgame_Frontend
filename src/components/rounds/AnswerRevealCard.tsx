import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, XCircle, Award, Sparkles } from 'lucide-react';
import { Question, SubmissionResponse } from '../../types';

interface AnswerRevealCardProps {
  question: Question;
  submissionResponse: SubmissionResponse | null;
  teamId?: string;
}

export const AnswerRevealCard: React.FC<AnswerRevealCardProps> = ({
  question,
  submissionResponse
}) => {
  const scoreResult = submissionResponse?.scoreResult;
  const isCorrect = scoreResult?.isCorrect ?? false;
  const totalScore = scoreResult?.totalScore ?? 0;

  // Fire celebratory confetti if team got positive score / correct
  useEffect(() => {
    if (isCorrect || totalScore > 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [isCorrect, totalScore]);

  return (
    <div className="space-y-6">
      {/* Result Hero Banner */}
      <div
        className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
          totalScore > 0
            ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-500/10'
            : totalScore < 0
            ? 'bg-gradient-to-b from-red-950/80 to-slate-900 border-red-500/40 shadow-xl shadow-red-500/10'
            : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700'
        }`}
      >
        <div className="flex justify-center mb-3">
          {totalScore > 0 ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
          ) : totalScore < 0 ? (
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Award className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>

        <h3 className="text-2xl font-black text-white">
          {totalScore > 0 ? 'Splendid Effort!' : totalScore < 0 ? 'Penalty Applied' : 'Round Complete'}
        </h3>
        <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
          {scoreResult?.explanation || 'Quizmaster has evaluated this question.'}
        </p>

        {/* Score Pill */}
        <div className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-xs uppercase font-bold text-slate-400">Score Earned:</span>
          <span
            className={`font-mono text-2xl font-extrabold ${
              totalScore > 0 ? 'text-emerald-400' : totalScore < 0 ? 'text-red-400' : 'text-slate-300'
            }`}
          >
            {totalScore > 0 ? `+${totalScore}` : totalScore} PTS
          </span>
        </div>
      </div>

      {/* Official Answer Breakdown Card */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-indigo-500/30">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Official Quality Master Key</span>
        </h4>

        {/* Round 1 Sequence Answer */}
        {question.round === 1 && question.round1CorrectOrder && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Correct Sequence from Start to Finish:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {question.round1CorrectOrder.map((actId, index) => {
                const act = question.round1Activities?.find(a => a.id === actId);
                return (
                  <div
                    key={actId}
                    className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center gap-3"
                  >
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-200">
                      [{actId}] {act?.text || actId}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Round 2 Defect Matches Answer */}
        {question.round === 2 && question.round2Defects && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Correct Defect Mappings:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.round2Defects.map(d => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-300">{d.label}:</span>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    {d.correctTerm}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Round 3 MSQ Answer */}
        {question.round === 3 && question.round3CorrectOptions && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Correct Option Combination:</p>
            <div className="grid grid-cols-1 gap-2">
              {question.round3Options?.map(opt => {
                const isCorrectOpt = question.round3CorrectOptions?.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      isCorrectOpt
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center ${
                        isCorrectOpt ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                    {isCorrectOpt && (
                      <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        CORRECT
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
