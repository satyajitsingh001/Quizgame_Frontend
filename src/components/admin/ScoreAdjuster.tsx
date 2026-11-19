import React, { useState, useEffect } from 'react';
import { Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Team } from '../../types';

interface ScoreAdjusterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScoreAdjuster: React.FC<ScoreAdjusterProps> = ({ isOpen, onClose, onSuccess }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamMongoId, setSelectedTeamMongoId] = useState('');
  const [round, setRound] = useState<number>(1);
  const [adjustmentPoints, setAdjustmentPoints] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getAllTeams().then(res => {
        if (res.success && res.teams) {
          const approved = res.teams.filter((t: Team) => t.status === 'approved');
          setTeams(approved);
          if (approved.length > 0) setSelectedTeamMongoId(approved[0]._id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedTeamMongoId || !reason.trim() || adjustmentPoints === 0) {
      setErrorMsg('Please select a team, non-zero points adjustment (+ or -), and provide an audit reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.adjustScore({
        teamMongoId: selectedTeamMongoId,
        round,
        adjustmentPoints: Number(adjustmentPoints),
        reason: reason.trim()
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Score adjustment failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/40 max-w-lg w-full space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Manual Score Correction</h3>
              <p className="text-xs text-slate-400">Auditable score ledger adjustment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Select Team</label>
            <select
              value={selectedTeamMongoId}
              onChange={e => setSelectedTeamMongoId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none"
            >
              {teams.map(t => (
                <option key={t._id} value={t._id}>
                  {t.teamId} — {t.teamName} (Capt: {t.captainName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Round</label>
              <select
                value={round}
                onChange={e => setRound(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none"
              >
                <option value={1}>Round 1</option>
                <option value={2}>Round 2</option>
                <option value={3}>Round 3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Points (+ or -)
              </label>
              <input
                type="number"
                required
                value={adjustmentPoints}
                onChange={e => setAdjustmentPoints(Number(e.target.value))}
                placeholder="e.g. +5 or -10"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
              Audit Reason / Justification <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Approved technical dispute resolution for Question 2"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? 'Recording...' : 'Commit Adjustment to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
