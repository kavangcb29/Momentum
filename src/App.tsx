import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  getHabits,
  saveHabits,
  getLogs,
  saveDayLog,
  getSettings,
  saveSettings,
  getTodayDateString,
  calculateStreak,
} from './utils/storage';
import type { Habit, DayLog, WinterArcSettings } from './types';
import { Header, type AppTab } from './components/Header';
import { ScoreGauge } from './components/ScoreGauge';
import { HabitCard } from './components/HabitCard';
import { GeminiImportModal } from './components/GeminiImportModal';
import { AddHabitModal } from './components/AddHabitModal';
import { AnalyticsView } from './components/AnalyticsView';
import { ChallengesList } from './components/ChallengesList';
import { MemorableMomentCard } from './components/MemorableMomentCard';
import { ArcCountdownCard } from './components/ArcCountdownCard';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { DeveloperModal } from './components/DeveloperModal';
import { PartnerBanner } from './components/PartnerBanner';
import { PartnerAdModal } from './components/PartnerAdModal';
import { SponsoredRewardCard } from './components/SponsoredRewardCard';
import { soundManager } from './utils/audio';
import { monetizationManager } from './utils/monetization';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Share2,
  Check,
  Search,
  CheckCircle2,
  Shield,
} from 'lucide-react';

export function App() {
  const [todayDate] = useState<string>(getTodayDateString());
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [settings, setSettings] = useState<WinterArcSettings>(getSettings());
  const [activeTab, setActiveTab] = useState<AppTab>('daily');

  // Filter & Search states for daily checklist
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Theme & Sound & Layout states
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('momentum_dark_mode');
    if (saved !== null) return saved === 'true';
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.isSoundMuted());
  const [layoutMode, setLayoutMode] = useState<'mobile' | 'dashboard'>(() => {
    const saved = localStorage.getItem('momentum_layout_mode');
    if (saved === 'mobile' || saved === 'dashboard') return saved;
    return typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'dashboard' : 'mobile';
  });

  // Modal states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const prevCompletedPointsRef = useRef<number>(0);

  // Initialize data and Monetization
  useEffect(() => {
    setHabits(getHabits());
    setLogs(getLogs());
    setSettings(getSettings());
    monetizationManager.initialize();
  }, []);

  // Sync dark mode class on document and body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#0c0a09');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#F9F8F5');
    }
    localStorage.setItem('momentum_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Current selected day log
  const currentLog: DayLog = logs[selectedDate] || {
    date: selectedDate,
    completedHabitIds: [],
    totalPoints: 0,
    targetPoints: settings.dailyTargetPoints,
    memorableMoment: '',
    isRestDay: false,
  };

  // Streak
  const streak = calculateStreak(logs, settings.dailyTargetPoints, settings.streakThresholdPercent);

  // Check for goal completion to trigger interstitial ad
  useEffect(() => {
    const currentPts = currentLog.totalPoints;
    const target = settings.dailyTargetPoints;
    if (currentPts >= target && target > 0 && prevCompletedPointsRef.current < target) {
      // Trigger Interstitial Ad (automatically bypassed if developer mode active)
      setTimeout(() => {
        monetizationManager.showInterstitial();
      }, 1200);
    }
    prevCompletedPointsRef.current = currentPts;
  }, [currentLog.totalPoints, settings.dailyTargetPoints]);

  // Toggle habit for selected date
  const handleToggleHabit = useCallback((habitId: string) => {
    const isCompleted = currentLog.completedHabitIds.includes(habitId);
    const updatedIds = isCompleted
      ? currentLog.completedHabitIds.filter((id) => id !== habitId)
      : [...currentLog.completedHabitIds, habitId];

    // Recalculate total points
    const newTotalPoints = habits
      .filter((h) => updatedIds.includes(h.id))
      .reduce((sum, h) => sum + h.points, 0);

    const updatedLog: DayLog = {
      ...currentLog,
      completedHabitIds: updatedIds,
      totalPoints: newTotalPoints,
    };

    const newLogs = { ...logs, [selectedDate]: updatedLog };
    setLogs(newLogs);
    saveDayLog(updatedLog);
  }, [currentLog, habits, logs, selectedDate]);

  // Toggle Rest Day with Rewarded Ad option
  const handleToggleRestDay = async () => {
    const nextRestState = !currentLog.isRestDay;

    // If activating rest day and ads are enabled, trigger Rewarded Video Ad
    if (nextRestState && monetizationManager.areAdsEnabled()) {
      const reward = await monetizationManager.showRewarded();
      if (!reward) return; // User skipped rewarded video
    }

    const updatedLog: DayLog = {
      ...currentLog,
      isRestDay: nextRestState,
    };
    const newLogs = { ...logs, [selectedDate]: updatedLog };
    setLogs(newLogs);
    saveDayLog(updatedLog);
  };

  // Save memorable moment for selected date
  const handleSaveMemorableMoment = (momentText: string) => {
    const updatedLog: DayLog = {
      ...currentLog,
      memorableMoment: momentText,
    };

    const newLogs = { ...logs, [selectedDate]: updatedLog };
    setLogs(newLogs);
    saveDayLog(updatedLog);
  };

  // Add a new habit
  const handleAddHabit = (newHabit: Habit) => {
    const updated = [newHabit, ...habits];
    setHabits(updated);
    saveHabits(updated);

    const newTarget = updated.reduce((sum, h) => sum + h.points, 0);
    const updatedSettings = { ...settings, dailyTargetPoints: newTarget };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  // Delete a habit
  const handleDeleteHabit = (habitId: string) => {
    const updated = habits.filter((h) => h.id !== habitId);
    setHabits(updated);
    saveHabits(updated);

    if (currentLog.completedHabitIds.includes(habitId)) {
      handleToggleHabit(habitId);
    }
  };

  // Import habits and optional logs from Gemini parser
  const handleImportHabits = (importedHabits: Habit[], importedLogs?: Record<string, DayLog>) => {
    setHabits(importedHabits);
    saveHabits(importedHabits);

    if (importedLogs && Object.keys(importedLogs).length > 0) {
      const mergedLogs = { ...logs, ...importedLogs };
      setLogs(mergedLogs);
      localStorage.setItem('momentum_logs_v1', JSON.stringify(mergedLogs));
    }

    const totalPoints = importedHabits.reduce((acc, h) => acc + h.points, 0);
    const updatedSettings = { ...settings, dailyTargetPoints: totalPoints };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  // Date shifting (Yesterday / Tomorrow)
  const shiftDate = useCallback((deltaDays: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + deltaDays);
    const nextDate = d.toISOString().split('T')[0];
    setSelectedDate(nextDate);
  }, [selectedDate]);

  const isToday = selectedDate === todayDate;

  // Toggle dark mode
  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // Toggle audio sound
  const handleToggleSound = useCallback(() => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Toggle layout mode
  const handleToggleLayoutMode = useCallback(() => {
    setLayoutMode((prev) => {
      const next = prev === 'dashboard' ? 'mobile' : 'dashboard';
      localStorage.setItem('momentum_layout_mode', next);
      return next;
    });
  }, []);

  // Update Data callback for Developer Console
  const handleUpdateData = (newHabits: Habit[], newLogs: Record<string, DayLog>, newSettings: WinterArcSettings) => {
    setHabits(newHabits);
    setLogs(newLogs);
    setSettings(newSettings);
  };

  // Categories list for filters
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(habits.map((h) => h.category)))];
  }, [habits]);

  // Filtered habits for daily checklist
  const filteredDailyHabits = useMemo(() => {
    return habits.filter((h) => {
      const matchesCat = selectedCategory === 'All' || h.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [habits, selectedCategory, searchQuery]);

  // Global Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Developer Console trigger: Ctrl + Shift + D
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsDevModalOpen((prev) => !prev);
        return;
      }

      // Don't intercept when user is typing in form inputs or modals
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      // Escape closes modals
      if (e.key === 'Escape') {
        setIsImportOpen(false);
        setIsAddOpen(false);
        setIsShortcutsOpen(false);
        setIsDevModalOpen(false);
        return;
      }

      // Hotkey: ? -> Open Shortcuts modal
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      // Hotkey: S -> Toggle sound
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleToggleSound();
        return;
      }

      // Hotkey: D -> Toggle dark theme
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleToggleDarkMode();
        return;
      }

      // Hotkey: V -> Toggle Layout Mode
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handleToggleLayoutMode();
        return;
      }

      // Hotkey: N -> New habit modal
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsAddOpen(true);
        return;
      }

      // Hotkey: I -> Import modal
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setIsImportOpen(true);
        return;
      }

      // Hotkey: T -> Today
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setSelectedDate(todayDate);
        return;
      }

      // Hotkeys: ArrowLeft / J -> Previous Day
      if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        shiftDate(-1);
        return;
      }

      // Hotkeys: ArrowRight / K -> Next Day
      if (e.key === 'ArrowRight' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        shiftDate(1);
        return;
      }

      // Numeric keys 1-9 to toggle habit by position
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 9 && activeTab === 'daily') {
        const targetHabit = filteredDailyHabits[num - 1];
        if (targetHabit) {
          e.preventDefault();
          handleToggleHabit(targetHabit.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    todayDate,
    shiftDate,
    handleToggleHabit,
    handleToggleSound,
    handleToggleDarkMode,
    handleToggleLayoutMode,
    filteredDailyHabits,
    activeTab,
  ]);

  // Calculate weekly summary (past 7 days completed total)
  const past7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayDate + 'T00:00:00');
      d.setDate(d.getDate() - (6 - i));
      const dStr = d.toISOString().split('T')[0];
      const log = logs[dStr];
      const completedCount = log?.completedHabitIds.length || 0;
      const isTargetMet =
        (log?.totalPoints || 0) >= settings.dailyTargetPoints * 0.7 || log?.isRestDay;
      return {
        date: dStr,
        dayName: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
        completedCount,
        isTargetMet,
        isRestDay: log?.isRestDay,
        isCurrentSelected: dStr === selectedDate,
      };
    });
  }, [todayDate, logs, selectedDate, settings.dailyTargetPoints]);

  const handleShareStreak = () => {
    const shareText = `🔥 I am on a ${streak}-day streak with ${currentLog.totalPoints} points on Momentum! #WinterArc`;
    if (navigator.share) {
      navigator.share({ title: 'Momentum Streak', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const isFullDashboard = layoutMode === 'dashboard';

  return (
    <div className="min-h-screen bg-[#ECE7DF] dark:bg-stone-950 sm:p-4 flex items-center justify-center font-sans antialiased selection:bg-rose-200 dark:selection:bg-rose-900 transition-colors">
      {/* App Container (Phone Frame vs Wide Desktop Dashboard) */}
      <div
        className={`w-full ${
          isFullDashboard ? 'max-w-5xl' : 'max-w-[430px]'
        } bg-[#F9F8F5] dark:bg-stone-900 min-h-screen sm:min-h-[890px] sm:rounded-[48px] sm:shadow-2xl overflow-hidden flex flex-col justify-between border border-stone-200/50 dark:border-stone-800 transition-all duration-300`}
        style={{
          paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 12px), 16px)',
        }}
      >
        {/* Top Header */}
        <Header
          currentDate={todayDate}
          selectedDate={selectedDate}
          streak={streak}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenAdd={() => setIsAddOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSelectDate={setSelectedDate}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          layoutMode={layoutMode}
          onToggleLayoutMode={handleToggleLayoutMode}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenDevModal={() => setIsDevModalOpen(true)}
        />

        {/* Main Body per Active Tab */}
        <main className="w-full px-4 sm:px-6 flex-1 space-y-4 pt-4 pb-16 overflow-y-auto">
          {activeTab === 'daily' && (
            <div className="space-y-4 tab-content-enter">
              {/* Date Switcher Bar */}
              <div className="flex items-center justify-between px-1 text-xs text-stone-500 dark:text-stone-400">
                <button
                  onClick={() => shiftDate(-1)}
                  className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 p-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="Previous Day (← / J)"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    {selectedDate}
                  </span>
                  {currentLog.isRestDay && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Rest Day
                    </span>
                  )}
                  {!isToday && (
                    <button
                      onClick={() => setSelectedDate(todayDate)}
                      className="text-[10px] text-stone-900 dark:text-stone-100 underline font-bold"
                      title="Jump back to Today (T)"
                    >
                      (Today)
                    </button>
                  )}
                </div>

                <button
                  onClick={() => shiftDate(1)}
                  className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 p-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="Next Day (→ / K)"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Layout Split: 2-Column on Desktop Dashboard, 1-Column on Mobile */}
              <div
                className={
                  isFullDashboard
                    ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
                    : 'space-y-4'
                }
              >
                {/* Left/Main Column: Checklist & Reflection */}
                <div
                  className={
                    isFullDashboard ? 'lg:col-span-7 space-y-4' : 'space-y-4'
                  }
                >
                  {/* Search and Category Filters */}
                  {habits.length > 4 && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Filter today's tasks..."
                          className="w-full bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl pl-8.5 pr-4 py-2 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-all shadow-xs"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar px-0.5">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                              selectedCategory === cat
                                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                                : 'bg-white dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Habit Checklist */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Daily Tasks ({currentLog.completedHabitIds.length}/{habits.length})</span>
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Keys 1–9 or tap to check
                      </span>
                    </div>

                    {habits.length === 0 ? (
                      <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 text-center space-y-3 shadow-card">
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          No challenges active for this protocol yet.
                        </p>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setIsImportOpen(true)}
                            className="px-4 py-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Import Notebook</span>
                          </button>
                        </div>
                      </div>
                    ) : filteredDailyHabits.length === 0 ? (
                      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">
                        No tasks match your filter.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredDailyHabits.map((habit, idx) => (
                          <HabitCard
                            key={habit.id}
                            habit={habit}
                            isDone={currentLog.completedHabitIds.includes(habit.id)}
                            onToggle={handleToggleHabit}
                            onDelete={handleDeleteHabit}
                            shortcutKey={idx + 1}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Memorable Moments & Reflection Card */}
                  <MemorableMomentCard
                    date={selectedDate}
                    isToday={isToday}
                    memorableMoment={currentLog.memorableMoment}
                    onSaveMoment={handleSaveMemorableMoment}
                  />
                </div>

                {/* Right / Side Column: Progress, Weekly, Arc, Share */}
                <div
                  className={
                    isFullDashboard ? 'lg:col-span-5 space-y-4' : 'space-y-4'
                  }
                >
                  {/* Score & Progress Ring */}
                  <ScoreGauge
                    earnedPoints={currentLog.totalPoints}
                    targetPoints={settings.dailyTargetPoints}
                    totalHabits={habits.length}
                    completedHabits={currentLog.completedHabitIds.length}
                  />

                  {/* Weekly Tracker Card */}
                  <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-card border border-stone-200/80 dark:border-stone-800 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[14px] font-bold text-stone-900 dark:text-stone-100">Last 7 Days Record</h3>
                      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                        {past7Days.filter((d) => d.isTargetMet).length} of 7 met
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 items-center text-center">
                      {past7Days.map((dItem) => (
                        <div key={dItem.date} className="flex flex-col items-center space-y-1.5">
                          <span
                            className={`text-[11px] font-medium ${
                              dItem.isCurrentSelected
                                ? 'text-stone-900 dark:text-stone-100 font-bold'
                                : 'text-stone-400'
                            }`}
                          >
                            {dItem.dayName}
                          </span>
                          <button
                            onClick={() => setSelectedDate(dItem.date)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              dItem.isTargetMet
                                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                                : 'bg-stone-200/80 dark:bg-stone-800 text-stone-400'
                            } ${
                              dItem.isCurrentSelected
                                ? 'ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2'
                                : ''
                            }`}
                            title={`${dItem.date}: ${dItem.completedCount} habits${
                              dItem.isRestDay ? ' (Rest Day)' : ''
                            }`}
                          >
                            {dItem.isTargetMet ? (
                              <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : null}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Winter Arc 90-Day Sprint & Stoic Mindset Card */}
                  <ArcCountdownCard
                    selectedDate={selectedDate}
                    settings={settings}
                    isRestDay={currentLog.isRestDay}
                    onToggleRestDay={handleToggleRestDay}
                  />

                  {/* Dedicated Sponsored Partner & Streak Shield Card (Placed apart) */}
                  <SponsoredRewardCard />

                  {/* Share Streak Button */}
                  <div className="pt-1">
                    <button
                      onClick={handleShareStreak}
                      className="w-full bg-[#18181B] dark:bg-stone-100 dark:text-stone-900 hover:bg-black dark:hover:bg-white active:scale-[0.98] transition-all text-white font-medium py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 shadow-lg"
                      type="button"
                    >
                      <span className="text-sm font-semibold tracking-wide">
                        {copiedShare ? 'Copied Streak Text!' : 'Share your streak'}
                      </span>
                      {copiedShare ? (
                        <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <ChallengesList
              habits={habits}
              onOpenAdd={() => setIsAddOpen(true)}
              onDeleteHabit={handleDeleteHabit}
            />
          )}

          {activeTab === 'progress' && (
            <AnalyticsView
              logs={logs}
              habits={habits}
              settings={settings}
              streak={streak}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setActiveTab('daily');
              }}
              selectedDate={selectedDate}
            />
          )}
        </main>

        {/* Sponsor Banner Slot */}
        <PartnerBanner />

        {/* Modals */}
        <GeminiImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportHabits={handleImportHabits}
        />

        <AddHabitModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAddHabit={handleAddHabit}
        />

        <KeyboardShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        <DeveloperModal
          isOpen={isDevModalOpen}
          onClose={() => setIsDevModalOpen(false)}
          streak={streak}
          onUpdateData={handleUpdateData}
        />

        <PartnerAdModal />
      </div>
    </div>
  );
}

export default App;
