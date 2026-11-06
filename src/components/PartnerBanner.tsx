import React, { useState, useEffect } from 'react';
import { ExternalLink, X, ChevronRight, Sparkles } from 'lucide-react';
import { monetizationManager } from '../utils/monetization';

interface SponsorAd {
  id: string;
  brand: string;
  badge: string;
  tagline: string;
  description: string;
  cta: string;
  url: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  icon: string;
}

export const LIVE_SPONSOR_ADS: SponsorAd[] = [
  {
    id: 'whoop',
    brand: 'WHOOP 4.0',
    badge: 'Recovery Partner',
    tagline: 'Track Sleep Debt & HRV Recovery',
    description: 'Optimize your 8-hour sleep floor with clinical-grade biometric monitoring.',
    cta: 'Get Free Device',
    url: 'https://www.whoop.com',
    badgeBg: 'bg-rose-500/15 border-rose-500/30',
    badgeText: 'text-rose-600 dark:text-rose-400',
    accentColor: 'from-rose-500/10 via-transparent to-transparent',
    icon: '⚡',
  },
  {
    id: 'ag1',
    brand: 'AG1 Nutrition',
    badge: 'Fuel Sponsor',
    tagline: '75 Vitamins & Clean Micronutrients',
    description: 'Support gut health, immunity, and sustained energy for your Winter Arc.',
    cta: 'Claim Welcome Kit',
    url: 'https://drinkag1.com',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    accentColor: 'from-emerald-500/10 via-transparent to-transparent',
    icon: '🟩',
  },
  {
    id: 'gymshark',
    brand: 'Gymshark',
    badge: 'Training Sponsor',
    tagline: 'Engineered for 4-Day Double Progression',
    description: 'High-performance gym apparel built for heavy compound lifting splits.',
    cta: 'Shop Splits',
    url: 'https://www.gymshark.com',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-600 dark:text-amber-400',
    accentColor: 'from-amber-500/10 via-transparent to-transparent',
    icon: '🔥',
  },
  {
    id: 'myfitnesspal',
    brand: 'MyFitnessPal',
    badge: 'Nutrition & Macros',
    tagline: 'Hit Your 80g Protein Floor Daily',
    description: 'Instant barcode scanning for 14M+ whole foods to lock in clean surplus.',
    cta: 'Track Macros Free',
    url: 'https://www.myfitnesspal.com',
    badgeBg: 'bg-blue-500/15 border-blue-500/30',
    badgeText: 'text-blue-600 dark:text-blue-400',
    accentColor: 'from-blue-500/10 via-transparent to-transparent',
    icon: '📊',
  },
  {
    id: 'audible',
    brand: 'Audible by Amazon',
    badge: 'Deep Work Audio',
    tagline: 'Listen to Atomic Habits & Deep Work',
    description: 'Convert cardio, commutes, and downtime into deliberate learning sprints.',
    cta: 'Try 30 Days Free',
    url: 'https://www.audible.com',
    badgeBg: 'bg-purple-500/15 border-purple-500/30',
    badgeText: 'text-purple-600 dark:text-purple-400',
    accentColor: 'from-purple-500/10 via-transparent to-transparent',
    icon: '🎧',
  },
];

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
