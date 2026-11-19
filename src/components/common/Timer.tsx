import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  remainingSeconds: number;
  totalDuration: number;
  isPaused?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ remainingSeconds, totalDuration, isPaused = false }) => {
  const percentage = Math.max(0, Math.min(100, (remainingSeconds / (totalDuration || 30)) * 100));

  // Determine urgency color
  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
  let barColor = 'bg-emerald-500';

  if (remainingSeconds <= 5) {
    colorClass = 'text-red-400 border-red-500/50 bg-red-950/40 pulse-timer shadow-lg shadow-red-500/30';
    barColor = 'bg-red-500';
  } else if (remainingSeconds <= totalDuration / 2) {
    colorClass = 'text-amber-400 border-amber-500/40 bg-amber-950/20';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border ${colorClass} transition-all duration-300`}>
        {remainingSeconds <= 5 ? (
          <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
        ) : (
          <Clock className={`w-5 h-5 ${isPaused ? 'text-amber-400' : 'text-slate-400'}`} />
        )}
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight">
            {remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">sec</span>
        </div>
        {isPaused && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 ml-1">
            PAUSED
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-linear rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
