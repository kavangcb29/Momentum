import React, { useState, useEffect } from 'react';
import { ExternalLink, X, ChevronRight, Sparkles } from 'lucide-react';
import { monetizationManager } from '../utils/monetization';
import { LIVE_SPONSOR_ADS } from '../constants/sponsors';

export const PartnerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Initialize and rotate ads
  useEffect(() => {
    // Attempt native AdMob banner
    monetizationManager.showBanner();

    // Rotate sponsor ads every 10 seconds
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % LIVE_SPONSOR_ADS.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !monetizationManager.areAdsEnabled()) return null;

  const currentAd = LIVE_SPONSOR_ADS[currentAdIndex];

  const handleNextAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentAdIndex((prev) => (prev + 1) % LIVE_SPONSOR_ADS.length);
  };

  return (
    <div
      className="w-full max-w-[440px] mx-auto pt-2 px-3 transition-all"
      style={{
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 8px), 12px)',
      }}
    >
      <div
        className={`relative bg-gradient-to-r ${currentAd.accentColor} bg-white dark:bg-stone-850 border border-stone-200/90 dark:border-stone-700/80 rounded-2xl p-3 flex flex-col gap-2 shadow-xs text-xs animate-fadeIn overflow-hidden`}
      >
        {/* Top meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${currentAd.badgeBg} ${currentAd.badgeText} flex items-center gap-1`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{currentAd.badge}</span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              Ad {currentAdIndex + 1}/{LIVE_SPONSOR_ADS.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleNextAd}
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-0.5"
              title="Next Live Ad"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-lg text-stone-300 hover:text-stone-500 dark:hover:text-stone-400"
              title="Hide Banner for this Session"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ad Content */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-lg flex-shrink-0">
              {currentAd.icon}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs truncate">
                {currentAd.brand}
              </h4>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium truncate">
                {currentAd.tagline}
              </p>
            </div>
          </div>

          {/* Call to action button */}
          <a
            href={currentAd.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all flex-shrink-0"
          >
            <span>{currentAd.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
