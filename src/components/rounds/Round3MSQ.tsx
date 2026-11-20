import React, { useState } from 'react';
import { Award, CheckSquare, Square, CheckCircle2, Lock, AlertCircle, UserCheck } from 'lucide-react';
import { Question } from '../../types';
import { api } from '../../services/api';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

interface Round3MSQProps {
  question: Question;
  isSubmitted: boolean;
  onSubmitted: () => void;
}

export const Round3MSQ: React.FC<Round3MSQProps> = ({ question, isSubmitted, onSubmitted }) => {
  const { remainingSeconds, gameState, submissionResponse } = useGame();
  const { team } = useAuth();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const options = question.round3Options || [];

  const toggleOption = (id: string) => {
    if (isSubmitted) return;
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting) return;
    setErrorMsg('');

    if (selectedOptions.length === 0) {
      setErrorMsg('Please select at least one option before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitAnswer(question._id, selectedOptions);
      if (res.success) {
        onSubmitted();
      } else {
        setErrorMsg(res.message || 'Submission failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error submitting answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = isSubmitted || gameState?.questionStatus !== 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Active Participant Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-500/50 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-amber-500/30 text-amber-300">
                ROUND 3 : MSQ
              </span>
              <span className="text-xs text-slate-300">Multiple Select Challenge</span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">
              Participant: <span className="text-amber-300">{team?.teamName || 'Active Participant'}</span>
            </p>
          </div>
        </div>
        <Award className="w-6 h-6 text-amber-400 opacity-60" />
      </div>

      {/* Question Prompt */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Round 3 : Quality MSQ — Question {question.questionNumber}</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {question.prompt}
        </h2>
        {question.description && (
          <p className="text-sm text-slate-400 mt-2">{question.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            🎯 Exact Combination Correct: +20 Pts
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
            ⚠️ Wrong Combination: -10 Pts
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 font-medium">
            ⏱️ Unattempted / Timeout: -15 Pts
          </span>
        </div>
      </div>

      {/* Submission status banner if submitted */}
      {isSubmitted && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">MSQ Submitted &amp; Locked!</p>
              <p className="text-xs text-slate-400">
                Submitted in {submissionResponse?.submissionTimeSeconds ?? '—'} seconds. Waiting for Quizmaster reveal...
              </p>
            </div>
          </div>
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
      )}

      {/* MSQ Options List */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Select All Correct Options (One or More):
        </p>

        {options.map(opt => {
          const isSelected = selectedOptions.includes(opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleOption(opt.id)}
              disabled={isLocked}
              className={`w-full text-left p-4 rounded-xl border flex items-center gap-3.5 transition-all ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
              } disabled:cursor-not-allowed`}
            >
              <div className="shrink-0 text-indigo-400">
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600" />
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-1">
                <span
                  className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {opt.id}
                </span>
                <span className="text-sm sm:text-base font-medium leading-snug">{opt.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit Button */}
      {!isLocked && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || remainingSeconds <= 0}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Submitting to Server...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Submit &amp; Lock Answer</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            ⚠️ Exact combination required: selecting any incorrect option or missing a correct one applies penalty.
          </p>
        </div>
      )}
    </div>
  );
};
