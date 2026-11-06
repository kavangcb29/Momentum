import React, { useState, useEffect } from 'react';
import { Shield, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { monetizationManager } from '../utils/monetization';
import { soundManager } from '../utils/audio';

interface SponsoredRewardCardProps {
  onShieldEarned?: () => void;
}

export const SponsoredRewardCard: React.FC<SponsoredRewardCardProps> = ({ onShieldEarned }) => {
  const [shields, setShields] = useState<number>(() => {
    return parseInt(localStorage.getItem('momentum_streak_shields') || '1', 10);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [justEarned, setJustEarned] = useState(false);

  useEffect(() => {
    localStorage.setItem('momentum_streak_shields', String(shields));
  }, [shields]);

  const handleWatchAd = async () => {
    setIsLoading(true);
    const reward = await monetizationManager.showRewarded();
    setIsLoading(false);

    if (reward) {
      const nextCount = shields + 1;
      setShields(nextCount);
      localStorage.setItem('momentum_streak_shields', String(nextCount));
      soundManager.playGoalReached();
      setJustEarned(true);
      onShieldEarned?.();
      setTimeout(() => setJustEarned(false), 3500);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-stone-900 dark:to-stone-900 border border-amber-500/25 dark:border-amber-900/50 p-4 transition-all shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Shield className="w-5 h-5 fill-amber-500/20 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Sponsored Bonus
              </span>
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Streak Freeze Shield
              </h4>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight">
              Watch a short test ad to earn a resilience shield and protect your streak.
            </p>
          </div>
        </div>

        {/* Current Shield Count Badge */}
        <div className="flex flex-col items-end">
          <div className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-black flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{shields} {shields === 1 ? 'Shield' : 'Shields'}</span>
          </div>
        </div>
      </div>

      {justEarned ? (
        <div className="mt-3 py-2 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Reward claimed! +1 Streak Shield credited to your account.</span>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between gap-2 pt-1 border-t border-amber-500/10 dark:border-amber-900/30">
          <span className="text-[10px] text-stone-400">
            AdMob Rewarded Video Unit
          </span>
          <button
            onClick={handleWatchAd}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
            <span>{isLoading ? 'Loading ad...' : 'Watch Ad (+1 Shield)'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
