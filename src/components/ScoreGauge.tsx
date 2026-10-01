import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Target, Zap } from 'lucide-react';

interface ScoreGaugeProps {
  earnedPoints: number;
  targetPoints: number;
  totalHabits: number;
  completedHabits: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  earnedPoints,
  targetPoints,
  totalHabits,
  completedHabits,
}) => {
  const prevEarnedRef = useRef(earnedPoints);
  const percent = Math.min(100, Math.round((earnedPoints / Math.max(1, targetPoints)) * 100));
  const isGoalAchieved = earnedPoints >= targetPoints && targetPoints > 0;

  useEffect(() => {
    // Fire celebratory confetti when crossing 100%
    if (earnedPoints >= targetPoints && prevEarnedRef.current < targetPoints && targetPoints > 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.3 },
        colors: ['#38BDF8', '#818CF8', '#34D399', '#F59E0B'],
      });
    }
    prevEarnedRef.current = earnedPoints;
  }, [earnedPoints, targetPoints]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 border border-slate-800 p-4 shadow-xl">
      {/* Ambient background glow */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-700 ${
        isGoalAchieved ? 'bg-emerald-500/20' : 'bg-cyan-500/10'
      }`}></div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>DAILY POINTS TARGET</span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">
              {earnedPoints}
            </span>
            <span className="text-xs font-mono text-slate-400">
              / {targetPoints} pts
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-slate-300">
            <Zap className={`w-3.5 h-3.5 ${isGoalAchieved ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span>
              {completedHabits} of {totalHabits} completed ({percent}%)
            </span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`transition-all duration-500 ease-out ${
                isGoalAchieved ? 'text-emerald-400' : 'text-cyan-400'
              }`}
              strokeDasharray={`${percent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-black font-mono text-slate-200">
            {percent}%
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isGoalAchieved
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
              : 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500'
          }`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};
