import React, { useState, useEffect } from 'react';
import { Eye, Maximize2, CheckCircle2, Lock, AlertCircle, ArrowLeft, ArrowRight, ArrowLeftRight, MoveHorizontal } from 'lucide-react';
import { Question, Round2Defect } from '../../types';
import { api, getFullImageUrl } from '../../services/api';
import { useGame } from '../../context/GameContext';

interface Round2DefectMatchProps {
  question: Question;
  isSubmitted: boolean;
  onSubmitted: () => void;
}

interface ImageSlotItem {
  id: string; // 'A', 'B', 'C', 'D'
  imageUrl: string;
  originalTerm?: string;
}

export const Round2DefectMatch: React.FC<Round2DefectMatchProps> = ({ question, isSubmitted, onSubmitted }) => {
  const { remainingSeconds, gameState, submissionResponse } = useGame();
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Target slots in fixed order (Zone 1, Zone 2, Zone 3, Zone 4)
  const defects: Round2Defect[] = question.round2Defects || [];

  // The 4 image items currently slotted into target zones [0..3]
  const [slottedImages, setSlottedImages] = useState<ImageSlotItem[]>([]);
  // Click-to-swap selection state
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // Initialize images matching consistent round2InitialOrder when question loads
  useEffect(() => {
    if (defects.length > 0) {
      const letters = ['A', 'B', 'C', 'D'];
      const imageDict: Record<string, ImageSlotItem> = {};

      // 1. Map from round2Images if present
      if (question.round2Images && question.round2Images.length > 0) {
        question.round2Images.forEach(img => {
          if (img.imageUrl) {
            imageDict[img.id] = { id: img.id, imageUrl: img.imageUrl };
          }
        });
      }

      // 2. Map defects and letters as fallbacks
      defects.forEach((d, idx) => {
        const letter = letters[idx] || String(idx + 1);
        const imgUrl =
          imageDict[letter]?.imageUrl ||
          d.imageUrl ||
          question.round2ImageUrl ||
          '';

        if (!imageDict[letter]) {
          imageDict[letter] = { id: letter, imageUrl: imgUrl, originalTerm: d.correctTerm };
        }
        if (!imageDict[d.id]) {
          imageDict[d.id] = { id: letter, imageUrl: imgUrl, originalTerm: d.correctTerm };
        }
      });

      // 3. Resolve initial order matching the admin live control scrambled presentation
      let initialOrder = question.round2InitialOrder;
      if (!initialOrder || initialOrder.length !== defects.length) {
        initialOrder = letters.slice(0, defects.length);
      }

      const ordered = initialOrder.map((imgId, idx) => {
        const fallbackLetter = letters[idx] || 'A';
        const item =
          imageDict[imgId] ||
          imageDict[fallbackLetter] || {
            id: imgId,
            imageUrl: defects[idx]?.imageUrl || question.round2ImageUrl || ''
          };
        return item;
      });

      setSlottedImages(ordered);
    }
  }, [question._id, question.round2InitialOrder, question.round2Images, question.round2Defects]);

  // Swap function between two slot positions
  const swapSlots = (idxA: number, idxB: number) => {
    if (isSubmitted || idxA === idxB || idxA < 0 || idxB < 0 || idxA >= slottedImages.length || idxB >= slottedImages.length) {
      return;
    }
    setSlottedImages(prev => {
      const copy = [...prev];
      const temp = copy[idxA];
      copy[idxA] = copy[idxB];
      copy[idxB] = temp;
      return copy;
    });
    setSelectedSlotIndex(null);
  };

  // Click slot to select or swap
  const handleSlotClick = (index: number) => {
    if (isSubmitted) return;
    if (selectedSlotIndex === null) {
      setSelectedSlotIndex(index);
    } else if (selectedSlotIndex === index) {
      setSelectedSlotIndex(null);
    } else {
      swapSlots(selectedSlotIndex, index);
    }
  };

  // Move left / right helpers
  const moveLeft = (index: number) => {
    if (index > 0) swapSlots(index, index - 1);
  };

  const moveRight = (index: number) => {
    if (index < slottedImages.length - 1) swapSlots(index, index + 1);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isSubmitted) return;
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (isSubmitted) return;
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr !== '') {
      const sourceIndex = Number(sourceIndexStr);
      if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
        swapSlots(sourceIndex, targetIndex);
      }
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting) return;
    setErrorMsg('');

    setIsSubmitting(true);
    // Instantly remove question view and switch to waiting screen on click
    onSubmitted();

    try {
      // Build submission payload: mapping each target defect zone to the placed image ID
      const mappingPayload: Record<string, string> = {};
      defects.forEach((defect, idx) => {
        const placedImage = slottedImages[idx];
        if (placedImage) {
          mappingPayload[defect.id] = placedImage.id;
        }
      });
      await api.submitAnswer(question._id, mappingPayload);
    } catch (err: any) {
      console.error('Submission error:', err);
    }
  };

  const isLocked = isSubmitted || gameState?.questionStatus !== 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Round 2 : Guess the Defect (Image Arrangement) — Question {question.questionNumber}</span>
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
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">Arrangement Submitted &amp; Locked!</p>
              <p className="text-xs text-slate-400">
                Submitted in {submissionResponse?.submissionTimeSeconds ?? '—'} seconds. Waiting for Quizmaster reveal...
              </p>
            </div>
          </div>
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
      )}

      {/* 4-Zone Drag & Drop Image Arrangement (Matches Live Control Room Layout) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            Live Participant View: Arrange the 4 Images into their Correct Named Zones:
          </span>
          <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <MoveHorizontal className="w-3.5 h-3.5" />
            Drag &amp; drop or tap cards to swap
          </span>
        </div>

        {/* 4 Slots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {defects.map((defect, slotIndex) => {
            const currentImage = slottedImages[slotIndex];
            const isSelectedForSwap = selectedSlotIndex === slotIndex;

            return (
              <div
                key={defect.id}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, slotIndex)}
                className={`rounded-2xl border transition-all p-3.5 space-y-3 bg-slate-900/90 flex flex-col justify-between shadow-lg ${
                  isSelectedForSwap
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-500/20 bg-slate-900'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Slot Target Header (Zone Label on left, Target Term on right) */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider">
                    {defect.label || `Zone #${slotIndex + 1}`}
                  </span>
                  <span className="text-xs font-black text-white px-2.5 py-0.5 rounded-md bg-indigo-500/25 border border-indigo-500/40 shadow-sm truncate max-w-[120px]">
                    {defect.correctTerm || 'Target'}
                  </span>
                </div>

                {/* Slotted Image Card (Draggable and Clickable) */}
                <div
                  draggable={!isLocked}
                  onDragStart={e => handleDragStart(e, slotIndex)}
                  onClick={() => handleSlotClick(slotIndex)}
                  className={`relative rounded-xl overflow-hidden bg-black/60 border cursor-grab active:cursor-grabbing p-1.5 group transition-all ${
                    isSelectedForSwap
                      ? 'border-cyan-400 bg-cyan-950/30'
                      : 'border-slate-700 hover:border-cyan-500/50'
                  }`}
                  title="Drag or click to select and swap"
                >
                  {currentImage?.imageUrl ? (
                    <div className="h-44 sm:h-48 flex items-center justify-center overflow-hidden rounded-lg bg-slate-950 relative">
                      <img
                        src={getFullImageUrl(currentImage.imageUrl)}
                        alt={`Slot ${slotIndex + 1} Image`}
                        className="w-full h-full object-contain pointer-events-none group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-cyan-300" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 sm:h-48 flex items-center justify-center text-xs text-slate-500 bg-slate-950 rounded-lg">
                      No image assigned
                    </div>
                  )}

                  {/* Zoom button on image */}
                  {currentImage?.imageUrl && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setZoomedImageUrl(currentImage.imageUrl);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900/80 backdrop-blur text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors shadow"
                      title="Zoom Image"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Swap badge overlay on hover */}
                  {!isLocked && (
                    <div className="mt-1 text-center">
                      <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 font-semibold transition-colors">
                        {isSelectedForSwap
                          ? '★ Selected — Click another to swap'
                          : currentImage?.id
                          ? `Image [${currentImage.id}] in Slot #${slotIndex + 1}`
                          : 'Click or Drag to Swap'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Move Left / Right Controls */}
                {!isLocked && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={slotIndex === 0}
                      onClick={() => moveLeft(slotIndex)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1 transition-colors border border-slate-700"
                      title="Move left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Left</span>
                    </button>
                    <button
                      type="button"
                      disabled={slotIndex === defects.length - 1}
                      onClick={() => moveRight(slotIndex)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1 transition-colors border border-slate-700"
                      title="Move right"
                    >
                      <span>Right</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomedImageUrl(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] overflow-auto rounded-2xl border border-slate-700 p-2 bg-slate-950"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" /> Image Inspection View
              </span>
              <button
                type="button"
                onClick={() => setZoomedImageUrl(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
              >
                ✕ Close
              </button>
            </div>
            <img
              src={getFullImageUrl(zoomedImageUrl)}
              alt="Zoomed"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

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
            className="w-full py-4 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-xl shadow-cyan-600/25 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <span>Submitting Arrangement...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-cyan-200" />
                <span>Submit Image Arrangement</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
