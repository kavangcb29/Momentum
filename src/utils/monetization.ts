import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  BannerAdPluginEvents,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  type BannerAdOptions,
  type AdOptions,
  type RewardAdOptions,
  type AdMobRewardItem,
} from '@capacitor-community/admob';

// Official Production Ad Unit IDs for Momentum (Connected to Kavan's AdSense/AdMob account)
export const PROD_AD_UNIT_IDS = {
  PUBLISHER_ID: 'pub-3571863616373313',
  ADSENSE_CLIENT: 'ca-pub-3571863616373313',
  APP_ID: 'ca-app-pub-3571863616373313~2718161000',
  BANNER: 'ca-app-pub-3571863616373313/8426763199',
  INTERSTITIAL: 'ca-app-pub-3571863616373313/4588599698',
  REWARDED: 'ca-app-pub-3571863616373313/4680099039',
};

// Google Official Test Ad Unit IDs (Safe for testing without policy strikes)
export const AD_UNIT_IDS = {
  APP: 'ca-app-pub-3940256099942544~3347511713',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

export interface NormalizedPublisherInfo {
  cleanDigits: string;
  adsenseClientId: string;
  admobPublisherId: string;
  defaultBannerId: string;
  defaultInterstitialId: string;
  defaultRewardedId: string;
}

/**
 * Normalizes any format of Google AdSense / AdMob ID:
 * e.g. "pub-3571863616373313", "ca-pub-3571863616373313", "ca-app-pub-3571863616373313~...", "3571863616373313"
 */
export function normalizePublisherId(raw: string): NormalizedPublisherInfo | null {
  if (!raw) return null;
  const digitsMatch = raw.match(/\d{12,18}/);
  if (!digitsMatch) return null;

  const digits = digitsMatch[0];
  const isOwner = digits === '3571863616373313';

  return {
    cleanDigits: digits,
    adsenseClientId: `ca-pub-${digits}`,
    admobPublisherId: `ca-app-pub-${digits}`,
    defaultBannerId: isOwner ? PROD_AD_UNIT_IDS.BANNER : `ca-app-pub-${digits}/6300978111`,
    defaultInterstitialId: isOwner ? PROD_AD_UNIT_IDS.INTERSTITIAL : `ca-app-pub-${digits}/1033173712`,
    defaultRewardedId: isOwner ? PROD_AD_UNIT_IDS.REWARDED : `ca-app-pub-${digits}/5224354917`,
  };
}

/**
 * Dynamically loads the official Google AdSense library for Web & WebView preview
 */
export function loadGoogleAdSenseTag(clientId: string): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('google-adsense-script');
  if (existing) {
    if (existing.getAttribute('data-client') === clientId) return;
    existing.remove();
  }

  try {
    const script = document.createElement('script');
    script.id = 'google-adsense-script';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-client', clientId);
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    document.head.appendChild(script);
    console.log(`[Monetization] Google AdSense SDK injected for ${clientId}`);
  } catch (e) {
    console.warn('[Monetization] Failed to inject Google AdSense script:', e);
  }
}

export interface AdStatusState {
  isNative: boolean;
  isInitialized: boolean;
  bannerLoaded: boolean;
  lastError: string | null;
  mode: 'test' | 'live' | 'simulation';
  adsenseClientId: string;
  hasCustomPublisherId: boolean;
}

class MonetizationManager {
  private isInitialized = false;
  private isInitializing = false;
  private isBannerShowing = false;
  private nativeBannerLoaded = false;
  private lastErrorMessage: string | null = null;

  public async initialize(): Promise<void> {
    await this.ensureInitialized();
  }

  public getAdSensePublisherId(): string {
    const stored = localStorage.getItem('momentum_adsense_pub_id');
    if (stored) return stored.trim();
    return PROD_AD_UNIT_IDS.ADSENSE_CLIENT;
  }

  public setAdSensePublisherId(rawId: string): NormalizedPublisherInfo | null {
    const normalized = normalizePublisherId(rawId);
    if (normalized) {
      localStorage.setItem('momentum_adsense_pub_id', normalized.adsenseClientId);
      localStorage.setItem('momentum_use_live_ads', 'true');

      if (!localStorage.getItem('momentum_custom_banner_id')) {
        localStorage.setItem('momentum_custom_banner_id', normalized.defaultBannerId);
      }
      if (!localStorage.getItem('momentum_custom_interstitial_id')) {
        localStorage.setItem('momentum_custom_interstitial_id', normalized.defaultInterstitialId);
      }
      if (!localStorage.getItem('momentum_custom_rewarded_id')) {
        localStorage.setItem('momentum_custom_rewarded_id', normalized.defaultRewardedId);
      }

      loadGoogleAdSenseTag(normalized.adsenseClientId);
      return normalized;
    }
    return null;
  }

  public clearCustomPublisherId(): void {
    localStorage.removeItem('momentum_adsense_pub_id');
    localStorage.removeItem('momentum_custom_banner_id');
    localStorage.removeItem('momentum_custom_interstitial_id');
    localStorage.removeItem('momentum_custom_rewarded_id');
    localStorage.setItem('momentum_use_live_ads', 'false');
  }

  public async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    if (this.isInitializing) return;

    this.isInitializing = true;

    // Load AdSense script for client ID
    const adsenseId = this.getAdSensePublisherId();
    loadGoogleAdSenseTag(adsenseId);

    if (Capacitor.isNativePlatform()) {
      try {
        const storedLive = localStorage.getItem('momentum_use_live_ads');
        const useLive = storedLive !== null ? storedLive === 'true' : true;

        await AdMob.initialize({
          initializeForTesting: !useLive,
        });
        this.isInitialized = true;
        this.setupListeners();
        console.log('[Monetization] Google AdMob SDK initialized on Android native for Momentum App');
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.lastErrorMessage = errMsg;
        console.warn('[Monetization] Native AdMob initialization note:', errMsg);
        this.isInitialized = true; // allow resilient fallback
      } finally {
        this.isInitializing = false;
      }
    } else {
      this.isInitialized = true;
      this.isInitializing = false;
      console.log('[Monetization] Web/WebView environment active with AdSense:', adsenseId);
    }
  }

  private setupListeners(): void {
    if (!Capacitor.isNativePlatform()) return;

    try {
      AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        console.log('[Monetization Event] Native Banner loaded successfully');
        this.nativeBannerLoaded = true;
        this.lastErrorMessage = null;
        window.dispatchEvent(new CustomEvent('momentum_native_banner_loaded'));
      });

      AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err: unknown) => {
        const msg = JSON.stringify(err);
        console.warn('[Monetization Event] Native Banner failed to load (No fill or network):', msg);
        this.nativeBannerLoaded = false;
        this.lastErrorMessage = msg;
        window.dispatchEvent(new CustomEvent('momentum_native_banner_failed', { detail: msg }));
      });

      AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        console.log('[Monetization Event] Native Interstitial loaded');
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (err: unknown) => {
        console.warn('[Monetization Event] Native Interstitial failed:', err);
      });

      AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        console.log('[Monetization Event] Native Rewarded Video loaded');
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (err: unknown) => {
        console.warn('[Monetization Event] Native Rewarded Video failed:', err);
      });
    } catch (e) {
      console.warn('[Monetization] Could not attach AdMob listeners:', e);
    }
  }

  // Check if ads should be displayed (returns false if developer enabled VIP Ad-Free mode)
  public areAdsEnabled(): boolean {
    const devBypass = localStorage.getItem('momentum_dev_disable_ads') === 'true';
    return !devBypass;
  }

  // Get active Ad Unit IDs (defaults to Live Production unless developer switches to Test Mode)
  public getActiveIds() {
    const storedLive = localStorage.getItem('momentum_use_live_ads');
    const useLive = storedLive !== null ? storedLive === 'true' : true;

    const adsenseId = this.getAdSensePublisherId();
    const customBanner = localStorage.getItem('momentum_custom_banner_id');
    const customInterstitial = localStorage.getItem('momentum_custom_interstitial_id');
    const customRewarded = localStorage.getItem('momentum_custom_rewarded_id');

    const bannerId = useLive
      ? (customBanner?.trim() || PROD_AD_UNIT_IDS.BANNER)
      : AD_UNIT_IDS.BANNER;

    const interstitialId = useLive
      ? (customInterstitial?.trim() || PROD_AD_UNIT_IDS.INTERSTITIAL)
      : AD_UNIT_IDS.INTERSTITIAL;

    const rewardedId = useLive
      ? (customRewarded?.trim() || PROD_AD_UNIT_IDS.REWARDED)
      : AD_UNIT_IDS.REWARDED;

    return {
      isLive: useLive,
      adsenseClientId: adsenseId,
      BANNER: bannerId,
      INTERSTITIAL: interstitialId,
      REWARDED: rewardedId,
    };
  }

  public getStatus(): AdStatusState {
    const active = this.getActiveIds();
    return {
      isNative: Capacitor.isNativePlatform(),
      isInitialized: this.isInitialized,
      bannerLoaded: this.nativeBannerLoaded,
      lastError: this.lastErrorMessage,
      mode: !Capacitor.isNativePlatform() ? 'simulation' : active.isLive ? 'live' : 'test',
      adsenseClientId: active.adsenseClientId,
      hasCustomPublisherId: Boolean(active.adsenseClientId),
    };
  }

  // 1. Bottom Banner Ad
  public async showBanner(): Promise<void> {
    if (!this.areAdsEnabled()) {
      await this.hideBanner();
      return;
    }

    if (this.isBannerShowing) return;

    await this.ensureInitialized();
    const ids = this.getActiveIds();

    if (Capacitor.isNativePlatform()) {
      try {
        const options: BannerAdOptions = {
          adId: ids.BANNER,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: !ids.isLive,
        };
        await AdMob.showBanner(options);
        this.isBannerShowing = true;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.lastErrorMessage = errMsg;
        console.warn('[Monetization] Native banner call note:', errMsg);
        // Fallback so in-app live rotating sponsor banner renders smoothly
        window.dispatchEvent(new CustomEvent('momentum_sponsor_banner_show'));
      }
    } else {
      this.isBannerShowing = true;
      window.dispatchEvent(new CustomEvent('momentum_sponsor_banner_show'));
    }
  }

  public async hideBanner(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await AdMob.hideBanner();
        this.isBannerShowing = false;
        this.nativeBannerLoaded = false;
      } catch (err) {
        console.warn('[Monetization] Hide banner note:', err);
      }
    }
    this.isBannerShowing = false;
    window.dispatchEvent(new CustomEvent('momentum_sponsor_banner_hide'));
  }

  // 2. Interstitial Full-Screen Ad
  public async showInterstitial(): Promise<boolean> {
    if (!this.areAdsEnabled()) {
      console.log('[Monetization] Interstitial skipped - Creator VIP active');
      return false;
    }

    await this.ensureInitialized();
    const ids = this.getActiveIds();

    if (Capacitor.isNativePlatform()) {
      try {
        const options: AdOptions = {
          adId: ids.INTERSTITIAL,
          isTesting: !ids.isLive,
        };
        await AdMob.prepareInterstitial(options);
        await AdMob.showInterstitial();
        return true;
      } catch (err) {
        console.warn('[Monetization] Native interstitial fallback to partner modal:', err);
        this.triggerInAppInterstitial();
        return true;
      }
    } else {
      this.triggerInAppInterstitial();
      return true;
    }
  }

  private triggerInAppInterstitial(): void {
    window.dispatchEvent(
      new CustomEvent('momentum_sponsor_interstitial_show', {
        detail: {
          title: 'Daily Goal Complete! • Partner Showcase',
          message: 'Fuel your Winter Arc with elite recovery, nutrition, and discipline tools.',
        },
      })
    );
  }

  // 3. Rewarded Video Ad
  public async showRewarded(): Promise<AdMobRewardItem | null> {
    if (!this.areAdsEnabled()) {
      console.log('[Monetization] Rewarded ad bypassed for Creator');
      return { type: 'streak_shield', amount: 1 };
    }

    await this.ensureInitialized();
    const ids = this.getActiveIds();

    if (Capacitor.isNativePlatform()) {
      try {
        const options: RewardAdOptions = {
          adId: ids.REWARDED,
          isTesting: !ids.isLive,
        };
        await AdMob.prepareRewardVideoAd(options);
        const reward = await AdMob.showRewardVideoAd();
        if (reward) return reward;
      } catch (err) {
        console.warn('[Monetization] Native rewarded video fallback to partner showcase:', err);
      }
    }

    // Interactive fallback video ad modal
    return new Promise((resolve) => {
      window.dispatchEvent(
        new CustomEvent('momentum_sponsor_rewarded_show', {
          detail: {
            title: 'Partner Showcase • Streak Freeze Shield',
            message: 'Watch this sponsored showcase to earn +1 Streak Freeze Shield!',
            onComplete: () => resolve({ type: 'streak_shield', amount: 1 }),
            onCancel: () => resolve(null),
          },
        })
      );
    });
  }
}

export const monetizationManager = new MonetizationManager();
