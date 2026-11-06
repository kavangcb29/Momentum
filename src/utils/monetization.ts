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

// Google Official Test Ad Unit IDs (Used for safe development & testing)
export const AD_UNIT_IDS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

class MonetizationManager {
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
        console.log('[Monetization] Google AdMob SDK initialized on Android native');
      } catch (err) {
        console.warn('[Monetization] Native initialization deferred:', err);
      }
    } else {
      console.log('[Monetization] Browser environment detected - preview simulation enabled');
      this.isInitialized = true;
    }
  }

  // Check if ads should be displayed (returns false if creator enabled Ad-Free VIP mode)
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
          adId: AD_UNIT_IDS.BANNER,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: true,
        };
        await AdMob.showBanner(options);
        this.isBannerShowing = true;
      } catch (err) {
        console.warn('[Monetization] Native banner failed:', err);
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
      } catch (err) {
        console.warn('[Monetization] Hide banner failed:', err);
      }
    } else {
      this.isBannerShowing = false;
      window.dispatchEvent(new CustomEvent('momentum_sponsor_banner_hide'));
    }
  }

  // 2. Interstitial Full-Screen Ad
  public async showInterstitial(): Promise<boolean> {
    if (!this.areAdsEnabled()) {
      console.log('[Monetization] Interstitial skipped - Creator VIP Ad-Free active');
      return false;
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const options: AdOptions = {
          adId: AD_UNIT_IDS.INTERSTITIAL,
          isTesting: true,
        };
        await AdMob.prepareInterstitial(options);
        await AdMob.showInterstitial();
        return true;
      } catch (err) {
        console.warn('[Monetization] Native interstitial error:', err);
        return false;
      }
    } else {
      console.log('[Monetization] Launching simulated interstitial modal');
      window.dispatchEvent(
        new CustomEvent('momentum_sponsor_interstitial_show', {
          detail: {
            title: 'Goal Achieved! • Milestone Sponsor',
            message: 'In the compiled Android APK, this displays a full-screen Google AdMob interstitial ad.',
          },
        })
      );
      return true;
    }
  }

  // 3. Rewarded Video Ad (Watch to earn Streak Shield / Freeze)
  public async showRewarded(): Promise<AdMobRewardItem | null> {
    if (!this.areAdsEnabled()) {
      console.log('[Monetization] Rewarded ad bypassed for Creator');
      return { type: 'streak_shield', amount: 1 };
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const options: RewardAdOptions = {
          adId: AD_UNIT_IDS.REWARDED,
          isTesting: true,
        };
        await AdMob.prepareRewardVideoAd(options);
        const reward = await AdMob.showRewardVideoAd();
        return reward;
      } catch (err) {
        console.warn('[Monetization] Native rewarded video failed:', err);
        return null;
      }
    } else {
      console.log('[Monetization] Launching simulated rewarded video');
      return new Promise((resolve) => {
        window.dispatchEvent(
          new CustomEvent('momentum_sponsor_rewarded_show', {
            detail: {
              title: 'Sponsored Reward • Streak Shield',
              message: 'Watch this 5-second simulated video to earn a Streak Freeze Shield!',
              onComplete: () => resolve({ type: 'streak_shield', amount: 1 }),
              onCancel: () => resolve(null),
            },
          })
        );
      });
    }
  }
}

export const monetizationManager = new MonetizationManager();
