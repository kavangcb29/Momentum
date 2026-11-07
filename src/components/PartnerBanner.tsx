import React, { useState, useEffect } from 'react';
import { ExternalLink, X, ChevronRight, Sparkles } from 'lucide-react';
import { monetizationManager } from '../utils/monetization';
import { LIVE_SPONSOR_ADS } from '../constants/sponsors';

export const PartnerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adSenseError, setAdSenseError] = useState(false);

  const adsenseClientId = monetizationManager.getAdSensePublisherId();

  // Initialize and rotate ads
  useEffect(() => {
    // Attempt native AdMob banner on Android
    monetizationManager.showBanner();

    // Rotate sponsor ads every 10 seconds
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % LIVE_SPONSOR_ADS.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Try to load Google AdSense in webview if client ID is configured
  useEffect(() => {
    if (adsenseClientId && !adSenseError && typeof window !== 'undefined') {
      try {
        const win = window as unknown as { adsbygoogle?: unknown[] };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      } catch (err) {
        console.warn('[AdSense] AdSense push error, falling back to live sponsor:', err);
        setAdSenseError(true);
      }
    }
  }, [adsenseClientId, adSenseError]);

  if (!isVisible || !monetizationManager.areAdsEnabled()) return null;

  const currentAd = LIVE_SPONSOR_ADS[currentAdIndex];

  const handleNextAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentAdIndex((prev) => (prev + 1) % LIVE_SPONSOR_ADS.length);
  };

  return (
    <div
      className="w-full max-w-[440px] mx-auto pt-1.5 px-3 select-none flex-shrink-0"
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
              <span>{adsenseClientId ? 'Google & Partner Ad' : currentAd.badge}</span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              Ad {currentAdIndex + 1}/{LIVE_SPONSOR_ADS.length}
            </span>
            {adsenseClientId && (
              <span className="text-[9px] text-indigo-500 font-mono hidden sm:inline-block">
                • {adsenseClientId.slice(0, 14)}...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleNextAd}
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-0.5 active-tactile"
              title="Next Live Ad"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-lg text-stone-300 hover:text-stone-500 dark:hover:text-stone-400 active-tactile"
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
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 font-bold text-[11px] flex items-center gap-1 shadow-xs active-tactile flex-shrink-0"
          >
            <span>{currentAd.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* AdSense Live Tag Slot (when in web/browser and client ID present) */}
        {adsenseClientId && !adSenseError && (
          <div className="w-full flex justify-center overflow-hidden max-h-[50px] mt-1 pt-1 border-t border-stone-200/50 dark:border-stone-700/50">
            <ins
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '320px', height: '50px' }}
              data-ad-client={adsenseClientId}
              data-ad-slot="8426763199"
              data-ad-format="horizontal"
              data-full-width-responsive="false"
            />
          </div>
        )}
      </div>
    </div>
  );
};
