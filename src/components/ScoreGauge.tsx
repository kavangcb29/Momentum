import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Target, Zap, Award } from 'lucide-react';
import { soundManager } from '../utils/audio';

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
    if (earnedPoints >= targetPoints && prevEarnedRef.current < targetPoints && targetPoints > 0) {
      soundManager.playGoalReached();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.35 },
        colors: ['#F9A8D4', '#A5B4FC', '#FDE6C8', '#34D399', '#FBBF24'],
      });
    }
    prevEarnedRef.current = earnedPoints;
  }, [earnedPoints, targetPoints]);

  return (
    <div className="bg-streak-gradient rounded-3xl p-5 shadow-soft relative overflow-hidden border border-stone-200/50 dark:border-stone-800 transition-colors select-none">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 font-medium">
            <Target className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
            <span className="tracking-wide uppercase font-bold text-[10px]">Daily Target</span>
            {isGoalAchieved && (
              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                <Award className="w-3 h-3" /> Met!
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              {earnedPoints}
            </span>
            <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">
              / {targetPoints} pts
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
            <Zap className={`w-3.5 h-3.5 ${isGoalAchieved ? 'text-emerald-600' : 'text-stone-600 dark:text-stone-400'}`} />
            <span>
              {completedHabits} of {totalHabits} completed ({percent}%)
            </span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-white/50 dark:text-stone-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`transition-[stroke-dasharray] duration-500 ease-out ${
                isGoalAchieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-100'
              }`}
              strokeDasharray={`${percent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-black text-stone-900 dark:text-stone-100">
            {percent}%
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-white/50 dark:bg-stone-800/60 h-2 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isGoalAchieved
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-stone-800 via-stone-700 to-stone-600'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
