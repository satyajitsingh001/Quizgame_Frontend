import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, CheckCircle2, Lock, Zap, Clock } from 'lucide-react';
import { Question, Round1Activity } from '../../types';
import { api } from '../../services/api';
import { useGame } from '../../context/GameContext';

interface Round1SequenceProps {
  question: Question;
  isSubmitted: boolean;
  onSubmitted: () => void;
}

export const Round1Sequence: React.FC<Round1SequenceProps> = ({ question, isSubmitted, onSubmitted }) => {
  const { remainingSeconds, gameState, submissionResponse, setIsSubmitted } = useGame();
  const [activities, setActivities] = useState<Round1Activity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Randomize initial activity order once question loads
  useEffect(() => {
    if (question.round1Activities) {
      // Deterministically or randomly shuffle
      const shuffled = [...question.round1Activities].sort(() => Math.random() - 0.5);
      setActivities(shuffled);
    }
  }, [question._id]);

  const moveUp = (index: number) => {
    if (index === 0 || isSubmitted) return;
    const updated = [...activities];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setActivities(updated);
  };

  const moveDown = (index: number) => {
    if (index === activities.length - 1 || isSubmitted) return;
    const updated = [...activities];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setActivities(updated);
  };

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting) return;
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const orderIds = activities.map(a => a.id);
      const res = await api.submitAnswer(question._id, orderIds);
      if (res.success) {
        setIsSubmitted(true);
        onSubmitted();
      } else {
        setIsSubmitting(false);
        setErrorMsg(res.message || 'Submission failed');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Network error submitting sequence');
    }
  };

  const isLocked = isSubmitted || gameState?.questionStatus !== 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Round 1 : Fastest Finger First — Question {question.questionNumber}</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {question.prompt}
        </h2>
        {question.description && (
          <p className="text-sm text-slate-400 mt-2">{question.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            🎯 +10 Base Points for Correct Sequence
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            ⚡ +5 Bonus Points for Fastest Correct within 15s
          </span>
        </div>
      </div>

      {/* Submission status banner if submitted */}
      {isSubmitted && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">Answer Submitted &amp; Locked!</p>
              <p className="text-xs text-slate-400">
                Submitted in {submissionResponse?.submissionTimeSeconds ?? '—'} seconds. Waiting for Quizmaster reveal...
              </p>
            </div>
          </div>
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
      )}

      {/* Interactive Sequence Cards */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Arrange into Correct Sequence (1st = First Step, 4th = Final Step):
        </p>

        {activities.map((act, index) => {
          const rankColors = [
            'bg-amber-500/20 text-amber-400 border-amber-500/30',
            'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
            'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            'bg-purple-500/20 text-purple-400 border-purple-500/30'
          ];

          return (
            <div
              key={act.id}
              className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                isLocked
                  ? 'bg-slate-900/40 border-slate-800 opacity-90'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-700/80 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                {/* Sequence Rank Indicator */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex flex-col items-center justify-center shrink-0 font-bold ${rankColors[index]}`}
                >
                  <span className="text-xs font-extrabold leading-none">{index + 1}</span>
                  <span className="text-[9px] uppercase tracking-tighter opacity-70">
                    {index === 0 ? 'ST' : index === 1 ? 'ND' : index === 2 ? 'RD' : 'TH'}
                  </span>
                </div>

                {/* Activity Text */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">[{act.id}]</span>
                    <span className="text-sm sm:text-base font-medium text-slate-200">{act.text}</span>
                  </div>
                </div>
              </div>

              {/* Up / Down Controls (Disabled if submitted) */}
              {!isLocked && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 sm:p-2.5 rounded-lg bg-slate-800 hover:bg-indigo-600 disabled:opacity-20 text-slate-300 hover:text-white transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === activities.length - 1}
                    className="p-2 sm:p-2.5 rounded-lg bg-slate-800 hover:bg-indigo-600 disabled:opacity-20 text-slate-300 hover:text-white transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Submit Button */}
      {!isLocked && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || remainingSeconds <= 0}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Submitting to Server...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Submit &amp; Lock Sequence</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            ⚠️ Submissions cannot be edited once confirmed. Timestamp is measured at the server.
          </p>
        </div>
      )}
    </div>
  );
};
