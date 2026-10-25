import { useState, useEffect } from 'react';
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
import { Sparkles, ArrowLeft, ArrowRight, Share2, Check } from 'lucide-react';

export function App() {
  const [todayDate] = useState<string>(getTodayDateString());
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [settings, setSettings] = useState<WinterArcSettings>(getSettings());
  const [activeTab, setActiveTab] = useState<AppTab>('daily');

  // Modal states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Initialize
  useEffect(() => {
    setHabits(getHabits());
    setLogs(getLogs());
    setSettings(getSettings());
  }, []);

  // Current selected day log
  const currentLog: DayLog = logs[selectedDate] || {
    date: selectedDate,
    completedHabitIds: [],
    totalPoints: 0,
    targetPoints: settings.dailyTargetPoints,
    memorableMoment: '',
  };

  // Streak
  const streak = calculateStreak(logs, settings.dailyTargetPoints, settings.streakThresholdPercent);

  // Toggle habit for selected date
  const handleToggleHabit = (habitId: string) => {
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

  // Import habits from Gemini parser
  const handleImportHabits = (importedHabits: Habit[]) => {
    setHabits(importedHabits);
    saveHabits(importedHabits);

    const totalPoints = importedHabits.reduce((acc, h) => acc + h.points, 0);
    const updatedSettings = { ...settings, dailyTargetPoints: totalPoints };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  // Date shifting (Yesterday / Tomorrow)
  const shiftDate = (deltaDays: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + deltaDays);
    const nextDate = d.toISOString().split('T')[0];
    setSelectedDate(nextDate);
  };

  const isToday = selectedDate === todayDate;

  // Calculate weekly summary (past 7 days completed total)
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayDate + 'T00:00:00');
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const log = logs[dStr];
    const completedCount = log?.completedHabitIds.length || 0;
    const isTargetMet = (log?.totalPoints || 0) >= (settings.dailyTargetPoints * 0.7);
    return {
      date: dStr,
      dayName: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
      completedCount,
      isTargetMet,
      isCurrentSelected: dStr === selectedDate,
    };
  });

  const handleShareStreak = () => {
    const shareText = `🔥 I am on a ${streak}-day streak with ${currentLog.totalPoints} points on Momentum!`;
    if (navigator.share) {
      navigator.share({ title: 'Momentum Streak', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE7DF] sm:p-4 flex items-center justify-center font-sans antialiased selection:bg-rose-200">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-[430px] bg-[#F9F8F5] min-h-screen sm:min-h-[890px] sm:rounded-[48px] sm:shadow-2xl overflow-hidden flex flex-col justify-between border border-stone-200/50 pb-6">
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
        />

        {/* Main Body per Active Tab */}
        <main className="w-full px-4 sm:px-5 flex-1 space-y-4 pt-3 overflow-y-auto">
          {activeTab === 'daily' && (
            <div className="space-y-4 tab-content-enter">
              {/* Date Switcher Bar */}
              <div className="flex items-center justify-between px-1 text-xs text-stone-500">
                <button
                  onClick={() => shiftDate(-1)}
                  className="flex items-center gap-1 hover:text-stone-900 p-1 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-700">
                    {selectedDate}
                  </span>
                  {!isToday && (
                    <button
                      onClick={() => setSelectedDate(todayDate)}
                      className="text-[10px] text-stone-900 underline font-bold"
                    >
                      (Today)
                    </button>
                  )}
                </div>

                <button
                  onClick={() => shiftDate(1)}
                  className="flex items-center gap-1 hover:text-stone-900 p-1 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Weekly Tracker Card */}
              <section className="bg-white rounded-3xl p-5 shadow-card border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-bold text-stone-900">Last 7 Days Record</h3>
                  <span className="text-xs font-semibold text-stone-500">
                    {past7Days.filter((d) => d.isTargetMet).length} of 7 met
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-2 items-center text-center">
                  {past7Days.map((dItem) => (
                    <div key={dItem.date} className="flex flex-col items-center space-y-1.5">
                      <span className={`text-[11px] font-medium ${dItem.isCurrentSelected ? 'text-stone-900 font-bold' : 'text-stone-400'}`}>
                        {dItem.dayName}
                      </span>
                      <button
                        onClick={() => setSelectedDate(dItem.date)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          dItem.isTargetMet
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-stone-200/80 text-stone-400'
                        } ${dItem.isCurrentSelected ? 'ring-2 ring-stone-900 ring-offset-2' : ''}`}
                        title={`${dItem.date}: ${dItem.completedCount} habits`}
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

              {/* Score & Progress Ring */}
              <ScoreGauge
                earnedPoints={currentLog.totalPoints}
                targetPoints={settings.dailyTargetPoints}
                totalHabits={habits.length}
                completedHabits={currentLog.completedHabitIds.length}
              />

              {/* Habit Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Daily Tasks ({currentLog.completedHabitIds.length}/{habits.length})
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Tap circle to check off
                  </span>
                </div>

                {habits.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white border border-dashed border-stone-200 text-center space-y-3 shadow-card">
                    <p className="text-xs text-stone-500">
                      No challenges active for this protocol yet.
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setIsImportOpen(true)}
                        className="px-4 py-2 rounded-full bg-stone-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Import Notebook</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {habits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        isDone={currentLog.completedHabitIds.includes(habit.id)}
                        onToggle={handleToggleHabit}
                        onDelete={handleDeleteHabit}
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

              {/* Bottom Share Streak Button */}
              <div className="pt-2">
                <button
                  onClick={handleShareStreak}
                  className="w-full bg-[#18181B] hover:bg-black active:scale-[0.98] transition-all text-white font-medium py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 shadow-lg"
                  type="button"
                >
                  <span className="text-sm font-semibold tracking-wide">
                    {copiedShare ? 'Copied Streak Text!' : 'Share your streak'}
                  </span>
                  {copiedShare ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4 text-stone-300" />
                  )}
                </button>
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
      </div>
    </div>
  );
}

export default App;
