import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ExternalLink, X, ShieldAlert } from 'lucide-react';
import { monetizationManager } from '../utils/monetization';

export const PartnerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false);

  useEffect(() => {
    // Detect whether an ad blocker is installed
    const testAdElement = document.createElement('div');
    testAdElement.className = 'adsbox ad-placement advertisement banner-ad';
    testAdElement.style.position = 'absolute';
    testAdElement.style.left = '-9999px';
    document.body.appendChild(testAdElement);
    if (testAdElement.offsetHeight === 0) {
      setIsAdBlockDetected(true);
    }
    document.body.removeChild(testAdElement);

    if (!Capacitor.isNativePlatform()) {
      const handleShow = () => setIsVisible(true);
      const handleHide = () => setIsVisible(false);

      window.addEventListener('momentum_sponsor_banner_show', handleShow);
      window.addEventListener('momentum_sponsor_banner_hide', handleHide);
      window.addEventListener('momentum_admob_banner_show', handleShow);
      window.addEventListener('momentum_admob_banner_hide', handleHide);

      if (monetizationManager.areAdsEnabled()) {
        setIsVisible(true);
      }

      return () => {
        window.removeEventListener('momentum_sponsor_banner_show', handleShow);
        window.removeEventListener('momentum_sponsor_banner_hide', handleHide);
        window.removeEventListener('momentum_admob_banner_show', handleShow);
        window.removeEventListener('momentum_admob_banner_hide', handleHide);
      };
    } else {
      monetizationManager.showBanner();
    }
  }, []);

  if (!isVisible || Capacitor.isNativePlatform()) return null;

  return (
    <div
      className="w-full max-w-[440px] mx-auto pt-2 px-3"
      style={{
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 8px), 12px)',
      }}
    >
      <div className="relative bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100 dark:from-stone-800/90 dark:via-stone-850 dark:to-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-2.5 flex items-center justify-between shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            Sponsor
          </span>
          <div className="min-w-0">
            <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block text-[11px]">
              Google AdMob 320x50 Banner Slot
            </span>
            <span className="text-[10px] text-stone-400 truncate block">
              {isAdBlockDetected
                ? 'Browser ad-blocker detected • Resilient fallback active'
                : 'Native container active on compiled Android APK'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isAdBlockDetected && (
            <span
              className="p-1 text-amber-500"
              title="Browser ad-blocker active. Ads render fine in the compiled mobile APK."
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
          )}
          <a
            href="https://admob.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            title="Google AdMob Portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-lg text-stone-300 hover:text-stone-500 dark:hover:text-stone-400"
            title="Hide Preview Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
