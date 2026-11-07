import React, { useRef } from 'react';
import {
  Flame,
  Sparkles,
  Plus,
  BarChart2,
  CheckCircle2,
  ListChecks,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  LayoutDashboard,
  Smartphone,
  Command,
  ShieldAlert,
} from 'lucide-react';

export type AppTab = 'daily' | 'challenges' | 'progress';

interface HeaderProps {
  currentDate: string;
  selectedDate: string;
  streak: number;
  onOpenImport: () => void;
  onOpenAdd: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onSelectDate: (date: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  layoutMode: 'mobile' | 'dashboard';
  onToggleLayoutMode: () => void;
  onOpenShortcuts: () => void;
  onOpenDevModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  selectedDate,
  streak,
  onOpenImport,
  onOpenAdd,
  activeTab,
  setActiveTab,
  isDarkMode,
  onToggleDarkMode,
  isMuted,
  onToggleSound,
  layoutMode,
  onToggleLayoutMode,
  onOpenShortcuts,
  onOpenDevModal,
}) => {
  const isToday = selectedDate === currentDate;
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDevAuth = localStorage.getItem('momentum_dev_authenticated') === 'true';

  const handleTitleClick = () => {
    if (isDevAuth) {
      onOpenDevModal();
      return;
    }

    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      onOpenDevModal();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2500);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const tabs: { key: AppTab; label: string; icon: React.ReactNode }[] = [
    { key: 'daily', label: 'Daily', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'challenges', label: 'Challenges', icon: <ListChecks className="w-4 h-4" /> },
    { key: 'progress', label: 'Progress', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <header
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 8px), 14px)',
        transform: 'translateZ(0)',
      }}
      className="sticky top-0 z-30 bg-[#F9F8F5] dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 px-4 pb-2.5 transition-colors select-none"
    >
      <div className={`mx-auto transition-all duration-300 ${layoutMode === 'dashboard' ? 'max-w-5xl' : 'max-w-md'}`}>
        {/* Top row: logo, date, actions */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTitleClick}
              className="text-left group cursor-pointer focus:outline-none"
              title="Momentum • Creator Easter Egg (tap 5x for Developer Mode)"
            >
              <h1 className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1.5 select-none">
                Momentum
                {isDevAuth && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 flex items-center gap-0.5">
                    <ShieldAlert className="w-2.5 h-2.5" /> Dev
                  </span>
                )}
                <span className="text-xs font-normal text-stone-400 dark:text-stone-500">
                  • {isToday ? 'Today' : formatDateLabel(selectedDate)}
                </span>
              </h1>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streak}d</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-full border transition-colors shadow-xs active-tactile ${
                isMuted
                  ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200'
              }`}
              title={isMuted ? 'Unmute Audio Chimes (S)' : 'Mute Audio Chimes (S)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-xs active-tactile"
              title={isDarkMode ? 'Switch to Warm Light Theme (D)' : 'Switch to Dark Theme (D)'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Desktop Dashboard / Mobile Phone view toggle */}
            <button
              onClick={onToggleLayoutMode}
              className="hidden sm:flex p-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-xs active-tactile"
              title={layoutMode === 'dashboard' ? 'Switch to Mobile Preview Frame (V)' : 'Switch to Desktop Dashboard View (V)'}
            >
              {layoutMode === 'dashboard' ? <Smartphone className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4 text-stone-800 dark:text-stone-200" />}
            </button>

            {/* Keyboard Shortcuts Guide */}
            <button
              onClick={onOpenShortcuts}
              className="hidden md:flex p-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors shadow-xs active-tactile"
              title="Keyboard Shortcuts (?)"
            >
              <Command className="w-4 h-4" />
            </button>

            {/* Import */}
            <button
              onClick={onOpenImport}
              className="p-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-xs active-tactile"
              title="Import from Gemini Notebook (I)"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>

            {/* Add Habit */}
            <button
              onClick={onOpenAdd}
              className="p-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-xs active-tactile"
              title="Add Habit (N)"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Three-Tab Navigation */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl text-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors duration-150 active-tactile ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
