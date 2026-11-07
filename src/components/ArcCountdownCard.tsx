import React from 'react';
import { Compass, Shield, Quote as QuoteIcon } from 'lucide-react';
import { getDailyQuote } from '../utils/quotes';
import type { WinterArcSettings } from '../types';

interface ArcCountdownCardProps {
  selectedDate: string;
  settings: WinterArcSettings;
  isRestDay?: boolean;
  onToggleRestDay?: () => void;
}

export const ArcCountdownCard: React.FC<ArcCountdownCardProps> = ({
  selectedDate,
  settings,
  isRestDay = false,
  onToggleRestDay,
}) => {
  const quote = getDailyQuote(selectedDate);

  // Calculate arc day progress (90 days total standard)
  const startDate = new Date(settings.startDate + 'T00:00:00');
  const currentDate = new Date(selectedDate + 'T00:00:00');
  const diffTime = currentDate.getTime() - startDate.getTime();
  const rawDayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const currentArcDay = Math.max(1, Math.min(90, rawDayNum));
  const arcPercent = Math.min(100, Math.round((currentArcDay / 90) * 100));
  const daysRemaining = Math.max(0, 90 - currentArcDay);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-4 select-none">
      {/* Top Arc Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                Winter Arc
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 font-semibold">
                90-Day Sprint
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Day {currentArcDay} of 90 • {daysRemaining} days left
            </p>
          </div>
        </div>

        {onToggleRestDay && (
          <button
            onClick={onToggleRestDay}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors active-tactile ${
              isRestDay
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
            title="Mark this day as a planned recovery day to preserve your momentum"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isRestDay ? 'Rest Active' : 'Rest Day'}</span>
          </button>
        )}
      </div>

      {/* Arc Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 dark:text-stone-400">
          <span>Sprint Completion</span>
          <span className="text-stone-900 dark:text-stone-100 font-bold">{arcPercent}%</span>
        </div>
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${arcPercent}%` }}
          />
        </div>
      </div>

      {/* Daily Stoic Mindset Quote */}
      <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            <QuoteIcon className="w-3 h-3 text-stone-400" />
            <span>Daily Mindset • {quote.tag}</span>
          </div>
          <span className="text-[10px] text-stone-400 font-medium">
            — {quote.author}
          </span>
        </div>
        <p className="text-xs text-stone-700 dark:text-stone-300 italic leading-relaxed">
          "{quote.text}"
        </p>
      </div>
    </div>
  );
};
