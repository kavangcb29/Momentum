import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  type BannerAdOptions,
  type AdOptions,
  type RewardAdOptions,
  type AdMobRewardItem,
} from '@capacitor-community/admob';

// Google Official Test Ad Unit IDs (Safe for testing & development)
export const ADMOB_TEST_IDS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

class AdMobManager {
  private isInitialized = false;
  private isBannerShowing = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (Capacitor.isNativePlatform()) {
      try {
        await AdMob.initialize({
          testingDevices: ['EMULATOR'],
          initializeForTesting: true,
        });
        this.isInitialized = true;
        console.log('[AdMob] Initialized on Native Platform');
      } catch (err) {
        console.warn('[AdMob] Initialization failed or delayed:', err);
      }
    } else {
      console.log('[AdMob] Running in Web Browser mode - using simulated ads');
      this.isInitialized = true;
    }
  }

  // Check if ads should be displayed (returns false if developer disabled them)
  public areAdsEnabled(): boolean {
    const devBypass = localStorage.getItem('momentum_dev_disable_ads') === 'true';
    return !devBypass;
  }

  // 1. Bottom Banner Ad
  public async showBanner(): Promise<void> {
    if (!this.areAdsEnabled()) {
      await this.hideBanner();
      return;
    }

    if (this.isBannerShowing) return;

    if (Capacitor.isNativePlatform()) {
      try {
        const options: BannerAdOptions = {
          adId: ADMOB_TEST_IDS.BANNER,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: true,
        };
        await AdMob.showBanner(options);
        this.isBannerShowing = true;
      } catch (err) {
        console.warn('[AdMob] Show banner failed:', err);
      }
    } else {
      this.isBannerShowing = true;
      // Triggers custom event so simulated banner can render in browser
      window.dispatchEvent(new CustomEvent('momentum_admob_banner_show'));
    }
  }

  public async hideBanner(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await AdMob.hideBanner();
        this.isBannerShowing = false;
      } catch (err) {
        console.warn('[AdMob] Hide banner failed:', err);
      }
    } else {
      this.isBannerShowing = false;
      window.dispatchEvent(new CustomEvent('momentum_admob_banner_hide'));
    }
  }

  // 2. Interstitial Full-Screen Ad (Shown on goal achievements)
  public async showInterstitial(): Promise<boolean> {
    if (!this.areAdsEnabled()) {
      console.log('[AdMob] Interstitial skipped - Developer Ad-Free Mode active');
      return false;
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const options: AdOptions = {
          adId: ADMOB_TEST_IDS.INTERSTITIAL,
          isTesting: true,
        };
        await AdMob.prepareInterstitial(options);
        await AdMob.showInterstitial();
        return true;
      } catch (err) {
        console.warn('[AdMob] Interstitial failed:', err);
        return false;
      }
    } else {
      console.log('[AdMob Simulated] Interstitial Ad Displayed (Web Mock)');
      window.dispatchEvent(
        new CustomEvent('momentum_admob_interstitial_show', {
          detail: { title: 'Test Interstitial Ad', message: 'Triggered upon completing daily goals' },
        })
      );
      return true;
    }
  }

  // 3. Rewarded Video Ad (Watch to earn Streak Freeze / Shield)
  public async showRewarded(): Promise<AdMobRewardItem | null> {
    if (!this.areAdsEnabled()) {
      console.log('[AdMob] Rewarded ad bypassed for Developer');
      return { type: 'streak_shield', amount: 1 };
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const options: RewardAdOptions = {
          adId: ADMOB_TEST_IDS.REWARDED,
          isTesting: true,
        };
        await AdMob.prepareRewardVideoAd(options);
        const reward = await AdMob.showRewardVideoAd();
        return reward;
      } catch (err) {
        console.warn('[AdMob] Rewarded video failed:', err);
        return null;
      }
    } else {
      console.log('[AdMob Simulated] Rewarded Video Watched (Web Mock)');
      return new Promise((resolve) => {
        window.dispatchEvent(
          new CustomEvent('momentum_admob_rewarded_show', {
            detail: {
              title: 'Watch Ad for Streak Freeze',
              onComplete: () => resolve({ type: 'streak_shield', amount: 1 }),
              onCancel: () => resolve(null),
            },
          })
        );
      });
    }
  }
}

export const adMobManager = new AdMobManager();
