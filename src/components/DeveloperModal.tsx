import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Check,
  Tv,
  Layers,
  Sparkles,
  Settings2,
  Radio,
  Globe,
  Trash2,
} from 'lucide-react';
import { monetizationManager, normalizePublisherId, PROD_AD_UNIT_IDS } from '../utils/monetization';
import { DEFAULT_HABITS, DEFAULT_SETTINGS, saveHabits, saveSettings } from '../utils/storage';
import type { Habit, DayLog, WinterArcSettings } from '../types';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak?: number;
  onUpdateData: (habits: Habit[], logs: Record<string, DayLog>, settings: WinterArcSettings) => void;
}

const DEFAULT_DEV_PASSCODE = '2909';

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
  onUpdateData,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('momentum_dev_authenticated') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dev settings states
  const [adsDisabled, setAdsDisabled] = useState<boolean>(() => {
    return localStorage.getItem('momentum_dev_disable_ads') === 'true';
  });
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Google AdSense / Publisher ID state
  const [rawPubInput, setRawPubInput] = useState<string>(() => {
    return localStorage.getItem('momentum_adsense_pub_id') || PROD_AD_UNIT_IDS.PUBLISHER_ID;
  });

  // Live AdMob Config state
  const [useLiveAds, setUseLiveAds] = useState<boolean>(() => {
    const saved = localStorage.getItem('momentum_use_live_ads');
    return saved !== null ? saved === 'true' : true;
  });
  const [customBanner, setCustomBanner] = useState<string>(() => {
    return localStorage.getItem('momentum_custom_banner_id') || PROD_AD_UNIT_IDS.BANNER;
  });
  const [customInterstitial, setCustomInterstitial] = useState<string>(() => {
    return localStorage.getItem('momentum_custom_interstitial_id') || PROD_AD_UNIT_IDS.INTERSTITIAL;
  });
  const [customRewarded, setCustomRewarded] = useState<string>(() => {
    return localStorage.getItem('momentum_custom_rewarded_id') || PROD_AD_UNIT_IDS.REWARDED;
  });

  const parsedInfo = normalizePublisherId(rawPubInput);
  const adStatus = monetizationManager.getStatus();

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setFeedbackMsg('');
      setPasscode('');
      setRawPubInput(localStorage.getItem('momentum_adsense_pub_id') || PROD_AD_UNIT_IDS.PUBLISHER_ID);
      setCustomBanner(localStorage.getItem('momentum_custom_banner_id') || PROD_AD_UNIT_IDS.BANNER);
      setCustomInterstitial(localStorage.getItem('momentum_custom_interstitial_id') || PROD_AD_UNIT_IDS.INTERSTITIAL);
      setCustomRewarded(localStorage.getItem('momentum_custom_rewarded_id') || PROD_AD_UNIT_IDS.REWARDED);
      const saved = localStorage.getItem('momentum_use_live_ads');
      setUseLiveAds(saved !== null ? saved === 'true' : true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem('momentum_dev_passcode') || DEFAULT_DEV_PASSCODE;
    if (passcode.trim() === storedPass) {
      setIsAuthenticated(true);
      localStorage.setItem('momentum_dev_authenticated', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Developer Passcode');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('momentum_dev_authenticated');
  };

  const handleToggleAds = () => {
    const next = !adsDisabled;
    setAdsDisabled(next);
    localStorage.setItem('momentum_dev_disable_ads', String(next));
    if (next) {
      monetizationManager.hideBanner();
      showFeedback('👑 Developer VIP: All ads permanently disabled for you.');
    } else {
      monetizationManager.showBanner();
      showFeedback('Ads enabled.');
    }
  };

  const handleToggleLiveAds = () => {
    const next = !useLiveAds;
    setUseLiveAds(next);
    localStorage.setItem('momentum_use_live_ads', String(next));
    showFeedback(next ? 'Switched to LIVE Production Ads mode.' : 'Switched to Google Test Ads mode.');
  };

  // Save Google AdSense Publisher ID and auto-populate ad units
  const handleApplyAdSenseId = () => {
    if (!rawPubInput.trim()) {
      showFeedback('Please enter your Google AdSense Publisher ID.');
      return;
    }

    const normalized = monetizationManager.setAdSensePublisherId(rawPubInput.trim());
    if (normalized) {
      setUseLiveAds(true);
      setCustomBanner(normalized.defaultBannerId);
      setCustomInterstitial(normalized.defaultInterstitialId);
      setCustomRewarded(normalized.defaultRewardedId);
      setRawPubInput(normalized.adsenseClientId);
      showFeedback(`✅ AdSense & AdMob linked to ${normalized.adsenseClientId}! Live mode activated.`);
      monetizationManager.showBanner();
    } else {
      setErrorMsg('Invalid format. Please enter pub-XXXXXXXXXXXXXXXX or ca-pub-XXXXXXXXXXXXXXXX');
    }
  };

  const handleClearAdSenseId = () => {
    monetizationManager.clearCustomPublisherId();
    setRawPubInput('');
    setCustomBanner('');
    setCustomInterstitial('');
    setCustomRewarded('');
    setUseLiveAds(false);
    showFeedback('Reset to default official Google test configuration.');
  };

  const handleSaveCustomIds = () => {
    localStorage.setItem('momentum_custom_banner_id', customBanner.trim());
    localStorage.setItem('momentum_custom_interstitial_id', customInterstitial.trim());
    localStorage.setItem('momentum_custom_rewarded_id', customRewarded.trim());
    showFeedback('Custom Ad Unit IDs saved successfully!');
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  // Test Ad triggers
  const handleTestBanner = async () => {
    showFeedback('Triggering Banner Ad...');
    await monetizationManager.showBanner();
  };

  const handleTestInterstitial = async () => {
    showFeedback('Launching Interstitial Ad...');
    await monetizationManager.showInterstitial();
  };

  const handleTestRewarded = async () => {
    showFeedback('Launching Rewarded Video...');
    const result = await monetizationManager.showRewarded();
    if (result) {
      showFeedback('Reward earned! Streak shield credited.');
    }
  };

  // Reset to default 5 Core Non-Negotiables
  const handleResetToCoreDefaults = () => {
    if (window.confirm('Reset all habits to the 5 Core Non-Negotiables (80g protein, 7 pts target)?')) {
      saveHabits(DEFAULT_HABITS);
      saveSettings(DEFAULT_SETTINGS);
      onUpdateData(DEFAULT_HABITS, {}, DEFAULT_SETTINGS);
      showFeedback('Reset to 5 Core Non-Negotiables complete!');
    }
  };

  // Full Database JSON Backup Export
  const handleExportFullJSON = () => {
    const backup = {
      habits: localStorage.getItem('momentum_habits_v5'),
      logs: localStorage.getItem('momentum_logs_v1'),
      settings: localStorage.getItem('momentum_settings_v2'),
      adsense: monetizationManager.getAdSensePublisherId(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Momentum_Developer_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showFeedback('Full database JSON downloaded.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                  Developer Console
                </h3>
                {isAuthenticated && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                Creator master controls & Google AdSense / AdMob config
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div className="mt-3 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Login Screen (if not authenticated) */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="py-6 space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Enter your developer PIN to unlock master controls, configure live Google AdSense IDs, and bypass ads.
              <div className="mt-1 text-[11px] text-stone-400">
                Default creator PIN: <span className="font-mono font-bold text-stone-700 dark:text-stone-300">2909</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Developer Master Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl pl-3.5 pr-10 py-2.5 text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium mt-1.5">{errorMsg}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active-tactile"
            >
              <KeyRound className="w-4 h-4" />
              <span>Authenticate as Developer</span>
            </button>
          </form>
        ) : (
          /* Authenticated Admin Controls */
          <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1 smooth-momentum-scroll">
            {/* Live Status Pill */}
            <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${adStatus.isNative ? 'text-emerald-500' : 'text-amber-500'}`} />
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px]">
                    {adStatus.isNative ? 'Native Android Environment' : 'Web & WebView Environment'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Mode: {useLiveAds ? '🔥 Live Production Google Ads' : '🧪 Google Official Sample Test Ads'}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                adStatus.hasCustomPublisherId
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
              }`}>
                {adStatus.hasCustomPublisherId ? 'Custom ID' : 'Test Mode'}
              </span>
            </div>

            {/* VIP Ad-Free Toggle */}
            <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Ad-Free Creator Mode</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Bypasses all banner, interstitial, and video ads
                  </p>
                </div>
                <button
                  onClick={handleToggleAds}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active-tactile ${
                    adsDisabled
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {adsDisabled ? 'Ads OFF (VIP)' : 'Ads ON'}
                </button>
              </div>
            </div>

            {/* Google AdSense Publisher ID Quick Config */}
            <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Google AdSense Publisher ID
                  </h4>
                </div>
                {parsedInfo && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
                    Valid ID
                  </span>
                )}
              </div>

              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                Paste your Google AdSense Publisher ID (e.g. <span className="font-mono font-semibold">pub-1234567890123456</span> or <span className="font-mono font-semibold">ca-pub-1234567890123456</span>). Momentum will automatically format and connect both web AdSense tags and native Android AdMob!
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  value={rawPubInput}
                  onChange={(e) => setRawPubInput(e.target.value)}
                  placeholder="pub-XXXXXXXXXXXXXXXX or ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full bg-white dark:bg-stone-900 border border-indigo-200 dark:border-indigo-800/80 rounded-xl px-3 py-2 font-mono text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-indigo-500"
                />

                {parsedInfo && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900/80 border border-indigo-100 dark:border-indigo-900/40 text-[11px] space-y-1 font-mono text-stone-600 dark:text-stone-300">
                    <div>Web Client: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{parsedInfo.adsenseClientId}</span></div>
                    <div>AdMob Pub: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{parsedInfo.admobPublisherId}</span></div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleApplyAdSenseId}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs active-tactile flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply & Activate Live Ads</span>
                  </button>
                  {monetizationManager.getAdSensePublisherId() && (
                    <button
                      onClick={handleClearAdSenseId}
                      className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 active-tactile"
                      title="Reset to default test IDs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed AdMob Unit IDs Accordion */}
            <div className="p-4 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-stone-500" />
                  <span>Custom AdMob Ad Unit IDs (Optional)</span>
                </h4>
                <button
                  onClick={handleToggleLiveAds}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all active-tactile ${
                    useLiveAds
                      ? 'bg-emerald-500 text-white'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {useLiveAds ? '● Live Production' : '○ Google Test'}
                </button>
              </div>

              <div className="space-y-2 text-[11px]">
                <div>
                  <label className="block text-stone-500 dark:text-stone-400 font-semibold mb-0.5">
                    Banner Ad Unit ID
                  </label>
                  <input
                    type="text"
                    value={customBanner}
                    onChange={(e) => setCustomBanner(e.target.value)}
                    placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 font-mono text-xs text-stone-800 dark:text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 dark:text-stone-400 font-semibold mb-0.5">
                    Interstitial Ad Unit ID
                  </label>
                  <input
                    type="text"
                    value={customInterstitial}
                    onChange={(e) => setCustomInterstitial(e.target.value)}
                    placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 font-mono text-xs text-stone-800 dark:text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 dark:text-stone-400 font-semibold mb-0.5">
                    Rewarded Video Ad Unit ID
                  </label>
                  <input
                    type="text"
                    value={customRewarded}
                    onChange={(e) => setCustomRewarded(e.target.value)}
                    placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 font-mono text-xs text-stone-800 dark:text-stone-200"
                  />
                </div>

                <button
                  onClick={handleSaveCustomIds}
                  className="w-full py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-xs shadow-xs active-tactile"
                >
                  Save Custom Unit IDs
                </button>
              </div>
            </div>

            {/* AdMob Monetization Test Triggers */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Instant Ad Triggers
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleTestBanner}
                  className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 text-left transition-all active-tactile"
                >
                  <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                    Banner
                  </div>
                  <p className="text-[9px] text-stone-400 mt-0.5">
                    Bottom 320x50
                  </p>
                </button>

                <button
                  onClick={handleTestInterstitial}
                  className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 text-left transition-all active-tactile"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                    <Layers className="w-3 h-3 text-indigo-500" />
                    <span>Interstitial</span>
                  </div>
                  <p className="text-[9px] text-stone-400 mt-0.5">
                    Full-screen
                  </p>
                </button>

                <button
                  onClick={handleTestRewarded}
                  className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 text-left transition-all active-tactile"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                    <Tv className="w-3 h-3 text-rose-500" />
                    <span>Rewarded</span>
                  </div>
                  <p className="text-[9px] text-stone-400 mt-0.5">
                    +1 Shield
                  </p>
                </button>
              </div>
            </div>

            {/* Data & Backup Tools */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Database & Protocols
              </span>
              <div className="space-y-2">
                <button
                  onClick={handleResetToCoreDefaults}
                  className="w-full p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center justify-between active-tactile"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                    Reset to 5 Core Non-Negotiables
                  </span>
                  <span className="text-[10px] text-stone-400">80g Protein</span>
                </button>

                <button
                  onClick={handleExportFullJSON}
                  className="w-full p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center justify-between active-tactile"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    Export Complete JSON Backup
                  </span>
                  <span className="text-[10px] text-stone-400">All local data</span>
                </button>
              </div>
            </div>

            {/* Admin Footer */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <button
                onClick={handleLogout}
                className="text-xs text-rose-500 hover:underline font-semibold"
              >
                Log Out
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold active-tactile"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
