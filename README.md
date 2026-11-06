# Momentum ⚡ • Winter Arc Habit & Points Tracker

> **Momentum** is a sleek, ultra-fast, minimalist 1-tap habit and daily points tracker designed for focus, discipline, and execution during your 90-day Winter Arc. Built with React 19, TypeScript, Tailwind CSS, Capacitor, and Google AdMob.

---

## 🔥 Key Features

- **⚡ 1-Tap Zero-Friction Execution:** Complete habits instantly with native mobile haptic vibration feedback.
- **🎯 Dynamic Daily Score & Radial Gauge:** Real-time circular progress ring and point calculation with milestone confetti celebrations.
- **🛡️ The 5 Core Non-Negotiables Protocol Standard:** Pre-loaded with strict execution rules, resilient fallback floors, and biological rationales:
  - `🦩 Circadian Shield & Sleep Recovery` • 11:00 PM Digital Sunset & 8h Sleep Floor (+1 pt)
  - `🔥 Physical Hypertrophy & Strength` • 4-Day Gym Split & Double Progression (+1 pt)
  - `🟩 Nutrition & Fuel` • Clean Bulk & 80g Protein Floor (+1 pt)
  - `🌊 Technical Skill & Academics` • 90-Min Daily Study Sprint (+1 pt)
  - `🎯 Career Transition & Pipeline` • Daily Career Points System (+3 pts)
  - 📖 **Full Protocol Specification:** See [docs/PROTOCOLS.md](docs/PROTOCOLS.md)
- **🔮 Gemini Notebook Smart Sync:** Import your checklists, bullet points, or structured JSON directly from your Gemini notebook. Auto-parses strict rules, resilient fallback floors, categories, hex colors, and scientific rationales.
- **💰 Google AdMob Monetization Built-In:**
  - **Banner Ads:** Unobtrusive bottom ad banner.
  - **Interstitial Ads:** Full-screen milestones celebration ads.
  - **Rewarded Video Ads:** Optional ad views to earn **Streak Freeze / Shield** protections.
  - **Web Simulation Mode:** Tests ad flows seamlessly inside the browser without needing native mobile devices.
- **👑 Secret Developer Mode & Creator VIP Console:**
  - **How to activate:** Tap the **"Momentum"** title 5 times rapidly or press `Ctrl + Shift + D`.
  - **Default Creator Passcode:** `2909`
  - **VIP Ad-Free Mode:** Completely bypasses all banner, interstitial, and video ads for you.
  - **Admin Sandboxing:** Manually trigger test interstitial and rewarded ads.
  - **Database Tools:** 1-click reset to the 5 Core Non-Negotiables and full JSON database export.
- **☁️ Cloud APK Builds (Zero Android Studio Needed):**
  - Automated GitHub Actions CI workflow compiles installable Android `.apk` binaries directly in the cloud. Perfect for laptops with limited RAM or disk space!
- **🔊 Web Audio Chimes:** Tactile harmonic audio feedback on completions synthesized via the Web Audio API (zero audio file dependencies).
- **🖥️ Responsive Dual-Mode Layout:** Full desktop dashboard workspace with keyboard shortcuts (`1`-`9`, `J`/`K`, `T`, `N`, `I`, `S`, `D`, `V`, `?`), plus 1-click toggle to mobile smartphone preview frame.
- **🌙 Dark & Warm Light Themes:** 1-click theme switcher with smooth transitions across all cards, drawers, and modal dialogs.
- **📖 Memorable Moments & Reflection Journal:** Capture daily highlights, wins, lessons learned, or gym PRs. Includes a continuous **Memory Vault Timeline** for month-end reviews.
- **📊 1-Click Excel / CSV Export:** Download formatted UTF-8 spreadsheets containing date-by-date habit completions, total points, streak statuses, and daily reflection logs.
- **📱 PWA & Android Native Ready:** 100% offline persistence with LocalStorage, optimized mobile viewport, and Capacitor 8 Android native wrapper.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Mobile Runtime:** Capacitor 8 (Android)
- **Monetization SDK:** `@capacitor-community/admob` (Google AdMob)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4 + Lucide Icons
- **Audio & Haptics:** Web Audio API & Mobile Vibration API
- **Effects:** Canvas-Confetti
- **Persistence:** LocalStorage (Offline-First)
- **CI/CD Cloud Builder:** GitHub Actions (Ubuntu 24.04 + JDK 21)

---

## 🚀 Quick Start (Web & Local Setup)

```bash
# 1. Clone the repository
git clone https://github.com/kavangcb29/Momentum.git
cd Momentum

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```

Open `http://localhost:5173/` or test on your mobile device over local Wi-Fi.

---

## ☁️ How to Build & Download the Android APK in the Cloud (No Android Studio Required!)

If your laptop has limited storage or cannot run Android Studio smoothly, you **do not need Android Studio**:

The automated build workflow is prepared in [`ci/build-apk.yml`](ci/build-apk.yml). To activate cloud builds on GitHub:
1. Open your repository: [github.com/kavangcb29/Momentum](https://github.com/kavangcb29/Momentum).
2. Click **Add file** → **Create new file** and name it `.github/workflows/build-apk.yml`.
3. Copy & paste the contents of [`ci/build-apk.yml`](ci/build-apk.yml) and click **Commit changes**.
4. GitHub Actions will automatically run on Ubuntu cloud runners, compile the native Android project, and upload `app-debug.apk`.
5. Under the **Actions** tab → click the latest workflow run → download **`Momentum-Debug-APK`**.
6. Transfer or download the APK directly to your phone to install and test with zero laptop resource usage!

---

## 💻 Local Android Studio Build (Optional)

If you have a machine with Android Studio installed and prefer local builds:

```bash
# 1. Build web assets and sync to native Android project
npm run cap:sync

# 2. Open the project in Android Studio
npm run cap:open
```

In **Android Studio**:
- Click the green **Run (▶)** button to launch on an emulator or USB-connected Android device.
- Or select **Build → Build Bundle(s) / APK(s) → Build APK(s)** to generate the standalone installable `.apk` file.

---

## 🏪 Google Play Store Release Preparation

When you are ready to publish Momentum to the Google Play Store:
- 📱 **Store Listing & Metadata Guide:** [docs/PLAY_STORE_LISTING.md](docs/PLAY_STORE_LISTING.md)
- 🔒 **Privacy Policy (Required for AdMob & Play Store):** [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md)
- 🛡️ **5 Core Non-Negotiables Protocol Guide:** [docs/PROTOCOLS.md](docs/PROTOCOLS.md)

---

## 📄 License

MIT License © 2026 Momentum Team
