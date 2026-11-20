import React, { useState } from 'react';
import { Eye, Maximize2, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { Question } from '../../types';
import { api, getFullImageUrl } from '../../services/api';
import { useGame } from '../../context/GameContext';

interface Round2DefectMatchProps {
  question: Question;
  isSubmitted: boolean;
  onSubmitted: () => void;
}

export const Round2DefectMatch: React.FC<Round2DefectMatchProps> = ({ question, isSubmitted, onSubmitted }) => {
  const { remainingSeconds, gameState, submissionResponse, setIsSubmitted } = useGame();
  const [selectedMatches, setSelectedMatches] = useState<Record<string, string>>({});
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const defects = question.round2Defects || [];
  const termOptions = question.round2TermOptions || [];

  const handleSelectTerm = (defectId: string, term: string) => {
    if (isSubmitted) return;
    setSelectedMatches(prev => ({
      ...prev,
      [defectId]: term
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting) return;
    setErrorMsg('');

    // Ensure all 4 defects are assigned
    const unselected = defects.filter(d => !selectedMatches[d.id]);
    if (unselected.length > 0) {
      setErrorMsg(`Please match all defect zones before submitting (${unselected.length} remaining).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitAnswer(question._id, selectedMatches);
      if (res.success) {
        setIsSubmitted(true);
        onSubmitted();
      } else {
        setIsSubmitting(false);
        setErrorMsg(res.message || 'Submission failed');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Network error submitting answer');
    }
  };

  const isLocked = isSubmitted || gameState?.questionStatus !== 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Round 2 : Guess the Defect — Question {question.questionNumber}</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {question.prompt}
        </h2>
        {question.description && (
          <p className="text-sm text-slate-400 mt-2">{question.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            🎯 All Matches Correct: +10 Pts
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            ⚡ 3 Correct Matches: +5 Pts
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
            ⚠️ Fewer than 3 Correct: -5 Pts
          </span>
        </div>
      </div>

      {/* Submission status banner if submitted */}
      {isSubmitted && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">Defect Matches Submitted &amp; Locked!</p>
              <p className="text-xs text-slate-400">
                Submitted in {submissionResponse?.submissionTimeSeconds ?? '—'} seconds. Waiting for Quizmaster reveal...
              </p>
            </div>
          </div>
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
      )}

      {/* Image Inspection Card */}
      {question.round2ImageUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group">
          <img
            src={getFullImageUrl(question.round2ImageUrl)}
            alt="Defect Inspection"
            className="w-full h-auto max-h-[380px] object-contain mx-auto cursor-pointer"
            onClick={() => setIsZoomOpen(true)}
          />
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Click to Zoom</span>
          </button>
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomOpen && question.round2ImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-auto rounded-2xl border border-slate-700 p-2 bg-slate-950">
            <img
              src={getFullImageUrl(question.round2ImageUrl)}
              alt="Zoomed Defect"
              className="w-full h-auto object-contain rounded-xl"
            />
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-slate-900/90 text-white font-bold text-sm border border-slate-700 hover:bg-slate-800"
            >
              ✕ Close Zoom
            </button>
          </div>
        </div>
      )}

      {/* Defect Matching Grid */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Match Each Inspected Zone to its Defect Term:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defects.map(defect => {
            const currentSelection = selectedMatches[defect.id] || '';

            return (
              <div
                key={defect.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {defect.label}
                  </span>
                  {currentSelection && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                    </span>
                  )}
                </div>

                {/* Term Select Dropdown */}
                <div>
                  <select
                    value={currentSelection}
                    onChange={e => handleSelectTerm(defect.id, e.target.value)}
                    disabled={isLocked}
                    className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                  >
                    <option value="">-- Choose Defect Classification --</option>
                    {termOptions.map(term => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
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
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/25 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Submitting to Server...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Submit &amp; Lock Defect Matches</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            ⚠️ 15s speed round! Complete all 4 matches before timer elapses.
          </p>
        </div>
      )}
    </div>
  );
};
