import React, { useState, useEffect } from 'react';
import { Play, Award, Sparkles, X } from 'lucide-react';

interface AdState {
  type: 'interstitial' | 'rewarded';
  title: string;
  message?: string;
  countdown: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const PartnerAdModal: React.FC = () => {
  const [activeAd, setActiveAd] = useState<AdState | null>(null);

  useEffect(() => {
    const handleInterstitial = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveAd({
        type: 'interstitial',
        title: customEvent.detail?.title || 'Daily Goal Achievement Ad',
        message:
          customEvent.detail?.message ||
          'In the compiled Android APK, this displays a full-screen Google AdMob interstitial ad.',
        countdown: 3,
      });
    };

    const handleRewarded = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveAd({
        type: 'rewarded',
        title: customEvent.detail?.title || 'Sponsored Reward • Streak Shield',
        message:
          customEvent.detail?.message ||
          'Watch this 5-second simulated video to claim your Streak Freeze Shield!',
        countdown: 5,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 text-white shadow-2xl relative flex flex-col items-center text-center space-y-4">
        {/* Top Badges */}
        <div className="w-full flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[10px] uppercase border border-amber-500/30">
              AdMob Live Preview
            </span>
            <span>{isRewarded ? 'Rewarded Video' : 'Interstitial'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              {!canClose ? `${activeAd.countdown}s` : 'Ready'}
            </span>
            {canClose && (
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Video / Ad Graphic Box */}
        <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-950 border border-stone-700/60 flex flex-col items-center justify-center p-4 space-y-2 relative overflow-hidden">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            {isRewarded ? <Play className="w-6 h-6 fill-amber-400" /> : <Sparkles className="w-6 h-6 text-amber-400" />}
          </div>
          <h4 className="text-sm font-bold text-stone-100">{activeAd.title}</h4>
          <p className="text-[11px] text-stone-400 leading-relaxed max-w-xs">
            {activeAd.message}
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full pt-1">
          {canClose ? (
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{isRewarded ? 'Claim 1 Streak Shield Reward' : 'Close & Continue'}</span>
            </button>
          ) : (
            <div className="w-full py-2.5 rounded-2xl bg-stone-800 text-stone-400 text-xs font-semibold">
              Ad playing... please wait {activeAd.countdown}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
