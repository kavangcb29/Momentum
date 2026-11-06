import React, { useState, useEffect } from 'react';
import { Play, Award, Sparkles, X, ExternalLink } from 'lucide-react';
import { LIVE_SPONSOR_ADS } from './PartnerBanner';

interface AdState {
  type: 'interstitial' | 'rewarded';
  title: string;
  message?: string;
  countdown: number;
  adIndex: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const PartnerAdModal: React.FC = () => {
  const [activeAd, setActiveAd] = useState<AdState | null>(null);

  useEffect(() => {
    const handleInterstitial = (e: Event) => {
      const customEvent = e as CustomEvent;
      const randIdx = Math.floor(Math.random() * LIVE_SPONSOR_ADS.length);
      setActiveAd({
        type: 'interstitial',
        title: customEvent.detail?.title || 'Daily Goal Complete • Milestone Sponsor',
        message:
          customEvent.detail?.message ||
          'Momentum Official Partner Showcase',
        countdown: 3,
        adIndex: randIdx,
      });
    };

    const handleRewarded = (e: Event) => {
      const customEvent = e as CustomEvent;
      const randIdx = Math.floor(Math.random() * LIVE_SPONSOR_ADS.length);
      setActiveAd({
        type: 'rewarded',
        title: customEvent.detail?.title || 'Sponsored Video • Streak Shield',
        message:
          customEvent.detail?.message ||
          'Watch this 5-second video to claim your Streak Freeze Shield!',
        countdown: 5,
        adIndex: randIdx,
        onComplete: customEvent.detail?.onComplete,
        onCancel: customEvent.detail?.onCancel,
      });
    };

    window.addEventListener('momentum_sponsor_interstitial_show', handleInterstitial);
    window.addEventListener('momentum_sponsor_rewarded_show', handleRewarded);
    window.addEventListener('momentum_admob_interstitial_show', handleInterstitial);
    window.addEventListener('momentum_admob_rewarded_show', handleRewarded);

    return () => {
      window.removeEventListener('momentum_sponsor_interstitial_show', handleInterstitial);
      window.removeEventListener('momentum_sponsor_rewarded_show', handleRewarded);
      window.removeEventListener('momentum_admob_interstitial_show', handleInterstitial);
      window.removeEventListener('momentum_admob_rewarded_show', handleRewarded);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!activeAd || activeAd.countdown <= 0) return;
    const timer = setTimeout(() => {
      setActiveAd((prev) => (prev ? { ...prev, countdown: prev.countdown - 1 } : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeAd]);

  if (!activeAd) return null;

  const currentSponsor = LIVE_SPONSOR_ADS[activeAd.adIndex] || LIVE_SPONSOR_ADS[0];

  const handleClose = () => {
    if (activeAd.type === 'rewarded') {
      if (activeAd.countdown <= 0) {
        activeAd.onComplete?.();
      } else {
        activeAd.onCancel?.();
      }
    }
    setActiveAd(null);
  };

  const isRewarded = activeAd.type === 'rewarded';
  const canClose = activeAd.countdown <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 text-white shadow-2xl relative flex flex-col items-center text-center space-y-4">
        {/* Top Badges */}
        <div className="w-full flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[10px] uppercase border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Live Sponsor Ad</span>
            </span>
            <span className="text-[11px] text-stone-400">{isRewarded ? 'Rewarded Video' : 'Interstitial'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              {!canClose ? `${activeAd.countdown}s remaining` : 'Reward Ready'}
            </span>
            {canClose && (
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Close ad"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Video / Creative Showcase */}
        <div className="w-full rounded-2xl bg-gradient-to-br from-stone-800 to-stone-950 border border-stone-700/60 flex flex-col items-center justify-center p-5 space-y-3 relative overflow-hidden">
          <div className="text-3xl p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 animate-pulse">
            {currentSponsor.icon}
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-black text-white">{currentSponsor.brand}</h4>
            <p className="text-xs font-semibold text-amber-400">{currentSponsor.tagline}</p>
            <p className="text-[11px] text-stone-400 leading-relaxed max-w-xs pt-1">
              {currentSponsor.description}
            </p>
          </div>

          <a
            href={currentSponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold border border-stone-700 transition-colors"
          >
            <span>Visit {currentSponsor.brand}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Action Button */}
        <div className="w-full pt-1">
          {canClose ? (
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{isRewarded ? 'Claim +1 Streak Shield Reward' : 'Close & Continue'}</span>
            </button>
          ) : (
            <div className="w-full py-3 rounded-2xl bg-stone-800 text-stone-400 text-xs font-semibold flex items-center justify-center gap-2">
              <Play className="w-3.5 h-3.5 fill-stone-400" />
              <span>Ad playing... please wait {activeAd.countdown}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
