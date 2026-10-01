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
import { Header } from './components/Header';
import { ScoreGauge } from './components/ScoreGauge';
import { HabitCard } from './components/HabitCard';
import { GeminiImportModal } from './components/GeminiImportModal';
import { AddHabitModal } from './components/AddHabitModal';
import { AnalyticsView } from './components/AnalyticsView';
import { MemorableMomentCard } from './components/MemorableMomentCard';
import { Sparkles, Plus, ArrowLeft, ArrowRight } from 'lucide-react';

export function App() {
  const [todayDate] = useState<string>(getTodayDateString());
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [settings, setSettings] = useState<WinterArcSettings>(getSettings());
  const [activeTab, setActiveTab] = useState<'today' | 'analytics'>('today');

  // Modal states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

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

    // Update target points if user wants to match total habit points
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

    // Also remove from current logs
    if (currentLog.completedHabitIds.includes(habitId)) {
      handleToggleHabit(habitId);
    }
  };

  // Import habits from Gemini parser
  const handleImportHabits = (importedHabits: Habit[]) => {
    setHabits(importedHabits);
    saveHabits(importedHabits);

    // Update daily target points to sum of imported habits
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

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col font-sans pb-16">
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

      {/* Main Content Area */}
      <main className="max-w-md w-full mx-auto p-4 flex-1 space-y-4">
        {activeTab === 'today' ? (
          <>
            {/* Date Switcher Bar */}
            <div className="flex items-center justify-between px-1 text-xs">
              <button
                onClick={() => shiftDate(-1)}
                className="flex items-center gap-1 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev Day</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-300">
                  {selectedDate}
                </span>
                {!isToday && (
                  <button
                    onClick={() => setSelectedDate(todayDate)}
                    className="text-[10px] text-cyan-400 hover:underline font-bold"
                  >
                    (Jump to Today)
                  </button>
                )}
              </div>

              <button
                onClick={() => shiftDate(1)}
                className="flex items-center gap-1 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <span>Next Day</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Score & Progress Ring */}
            <ScoreGauge
              earnedPoints={currentLog.totalPoints}
              targetPoints={settings.dailyTargetPoints}
              totalHabits={habits.length}
              completedHabits={currentLog.completedHabitIds.length}
            />

            {/* Habit Checklist (1-Tap Experience) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Today's Execution Checklist ({habits.length})
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  1-Tap to complete
                </span>
              </div>

              {habits.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    No habits active for this winter arc yet.
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setIsImportOpen(true)}
                      className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Import Gemini Notes</span>
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

            {/* Bottom Quick Importer / Add Banner */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => setIsImportOpen(true)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/20 text-cyan-300 hover:border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Sync Gemini Notes</span>
              </button>

              <button
                onClick={() => setIsAddOpen(true)}
                className="py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Habit</span>
              </button>
            </div>
          </>
        ) : (
          <AnalyticsView
            logs={logs}
            habits={habits}
            settings={settings}
            streak={streak}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setActiveTab('today');
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
  );
}

export default App;
