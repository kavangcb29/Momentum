# Momentum ⚡ • Winter Arc Habit & Points Tracker

> **Momentum** is a sleek, ultra-fast, minimalist 1-tap habit and daily points tracker designed for focus, discipline, and execution during your 90-day Winter Arc. Built with React 19, TypeScript, and Tailwind CSS.

---

## 🔥 Key Features

- **⚡ 1-Tap Zero-Friction Execution:** Complete habits instantly with native mobile haptic vibration feedback.
- **🎯 Dynamic Daily Score & Gauge:** Circular radial progress ring that calculates earned points vs target in real-time, complete with milestone confetti celebrations.
- **🔮 Gemini Notebook Smart Sync:** Import your daily checklists, bullet points, or structured JSON directly from your Gemini notebook. Auto-parses strict rules, resilient fallback floors, categories, and scientific rationales.
- **🔬 Built-in 11 Science-Backed Winter Arc Protocols:**
  - `Recovery & Circadian` • Rise < 8:00 AM & 8h Sleep (+15 pts)
  - `Circadian Shield` • No Phone After 11:00 PM (+10 pts)
  - `Mindset & Focus` • 5-Min Daily Meditation (+10 pts)
  - `Environment Reset` • Daily Workspace Clean (+10 pts)
  - `Physical Hypertrophy` • Gym & Double Progression (+20 pts)
  - `Nutrition & Bulk` • Macro Surplus & 130g Protein Floor (+20 pts)
  - `Technical & Academics` • 90-Min Study Sprint (+20 pts)
  - `Knowledge Base` • 15–30m Tech Reading (+10 pts)
  - `Career Transition` • Daily Career Points (+15 pts)
  - `Interview Mastery` • Weekly Mock Interview (+25 pts)
  - `Weekly Retrospective` • Sunday Reflection & Audit (+20 pts)
- **📖 Memorable Moments & Reflection Journal:** Capture daily highlights, wins, lessons learned, or gym PRs. Includes a continuous **Memory Vault Timeline** for month-end reviews.
- **📊 1-Click Excel / CSV Export:** Download formatted UTF-8 spreadsheets containing date-by-date habit completions, total points, streak statuses, and daily reflection logs for your archives.
- **📱 PWA & Mobile Ready:** 100% offline persistence with LocalStorage, optimized mobile viewport, and dark status bar integration.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Mobile Runtime:** Capacitor 8 (Android)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4 + Lucide Icons
- **Effects:** Canvas-Confetti & Mobile Vibration API
- **Persistence:** LocalStorage (Offline-First)

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

## 📱 Android App Setup (Capacitor)

The repository comes pre-configured with **Capacitor** to build and run as a native Android app:

```bash
# 1. Build web assets and sync to native Android project
npm run cap:sync

# 2. Open the project in Android Studio
npm run cap:open

# 3. Or build, sync, and open Android Studio in one command
npm run android
```

In **Android Studio**:
- Click the green **Run (▶)** button to launch on an emulator or USB-connected Android device.
- Or select **Build → Build Bundle(s) / APK(s) → Build APK(s)** to generate the standalone installable `.apk` file (`android/app/build/outputs/apk/debug/app-debug.apk`).

---

## 📄 License

MIT License © 2026 Momentum Team
