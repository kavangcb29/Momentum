# 📱 Google Play Store Submission & Assets Guide

This guide contains everything required to prepare your store assets, configure Google Play Console, and release **Momentum** on the Google Play Store.

---

## 1. App Store Listing Metadata

### App Title (Max 30 characters)
```text
Momentum: Habit & Protocol
```

### Short Description (Max 80 characters)
```text
Build unshakeable daily momentum with strict protocols and habit mastery.
```

### Full Description (Max 4,000 characters)
```text
Transform your daily routines into non-negotiable discipline with Momentum — the minimalist, high-impact habit protocol tracker designed for high performers.

Whether you are executing a Winter Arc, prepping for technical career milestones, or optimizing sleep and hypertrophy splits, Momentum provides the structure, visual feedback, and psychological accountability you need.

⚡ KEY FEATURES

• 5 Core Non-Negotiables: Start instantly with a scientifically grounded blueprint:
  1. 11:00 PM Digital Sunset & 8-Hour Sleep Floor
  2. 4-Day Gym Split with Double Progression
  3. Clean Bulk & 80g Protein Floor
  4. 90-Minute Daily Study Sprint (SQL, Portfolio, Coursework)
  5. Daily Career Points System (Applications & Networking)

• Scientific Habit Rationale: Understand *why* each habit matters with detailed physiological and neurological breakdowns.

• Minimum Resilient Fallbacks: Protect your streak even on your hardest days with designated low-barrier safety nets.

• Gemini Notebook & AI Markdown Importer: Seamlessly paste your customized routine, Markdown checklists, or notes directly into the app.

• 100% Privacy & Offline-First: All logs, streaks, and personal data stay strictly on your device. Zero mandatory cloud logins.

• Streak Freeze & Shield: Earn resilience shields through rewarded milestones or rest day credits.

Stop relying on fleeting motivation. Build systematic, daily momentum.
```

---

## 2. Graphic Asset Specifications

Prepare the following images before creating your store listing:

| Asset | Dimensions | Format | Requirements |
|---|---|---|---|
| **App Icon** | 512 x 512 px | 32-bit PNG | Transparent or solid background, max 1024 KB. |
| **Feature Graphic** | 1024 x 500 px | PNG or JPEG | High-resolution banner displayed at top of store listing. No alpha transparency. |
| **Phone Screenshots** | Min 2, max 8 | PNG or JPEG | 16:9 or 9:16 aspect ratio (e.g. 1080 x 1920 px or 1080 x 2400 px). Recommended: Daily tracker tab, Challenges tab, Gemini importer modal, and Dark mode view. |

---

## 3. Google Play Console Content Rating & Category

- **Category:** Productivity (Secondary: Health & Fitness)
- **Target Audience:** Age 18 and older (or General Audience)
- **Content Rating Questionnaire:**
  - Violence: No
  - Sexuality / Adult Content: No
  - Profanity: No
  - Controlled Substances: No
  - Miscellaneous: Does the app collect location? No. Does it allow users to interact/chat? No.
  - Expected Result: **PEGI 3 / Everyone** (Cleanest rating)

---

## 4. Google Play Data Safety Form

Because Momentum uses **Google AdMob**, you must declare AdMob's data collection in the Google Play Data Safety section:

1. **Does your app collect or share any of the required user data types?**  
   👉 Select **Yes**.
2. **Is all of the user data collected by your app encrypted in transit?**  
   👉 Select **Yes** (HTTPS network calls by AdMob SDK).
3. **Data Types to declare:**
   - **Device or other IDs** (Advertising ID / GAID):
     - Collected: **Yes**
     - Shared: **Yes** (Shared with Google AdMob for advertising/analytics)
     - Ephemeral processing: **No**
     - Is this data required for your app, or can users choose whether it's collected? 👉 **Users can reset/opt out via Android Google settings**.
   - **App activity & Performance** (Ad impressions, crash diagnostics):
     - Collected for **Analytics** and **Advertising / Marketing**.

---

## 5. Google AdMob Production IDs (Before Final Play Store Release)

During development and testing, Momentum uses **Google's official Test Ad IDs**.  
Before releasing your app to real users on Google Play:

1. Sign in to your [Google AdMob Console](https://admob.google.com/).
2. Create an Android App entry for `Momentum`.
3. Create three Ad Units:
   - **Banner Ad Unit**
   - **Interstitial Ad Unit**
   - **Rewarded Ad Unit**
4. Update the IDs in:
   - `android/app/src/main/AndroidManifest.xml` (Replace `ca-app-pub-3940256099942544~3347511713` with your real AdMob App ID).
   - `src/utils/admob.ts` (Replace the test IDs in `ADMOB_TEST_IDS` with your real Ad Unit IDs).

---

## 6. Play Store Submission Roadmap (Reminder Checklist)

When you are ready to publish:
- [ ] Create a Google Play Developer Account ($25 one-time registration fee at [play.google.com/console](https://play.google.com/console)).
- [ ] Generate an Android Keystore file (`release-keystore.jks`) for app signing.
- [ ] Build production Android App Bundle (`.aab`) via Cloud CI (GitHub Actions) or local Gradle.
- [ ] Fill in Store Presence (Title, Short/Full Description, Icon, Feature Graphic, Screenshots).
- [ ] Link Privacy Policy: `https://github.com/kavangcb29/Momentum/blob/main/docs/PRIVACY_POLICY.md`.
- [ ] Complete Content Rating & Data Safety forms.
- [ ] Submit for Closed Testing / Production Review!
