import React from 'react';
import { Flame, Sparkles, Plus, BarChart2, CheckCircle2, ListChecks } from 'lucide-react';

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
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  selectedDate,
  streak,
  onOpenImport,
  onOpenAdd,
  activeTab,
  setActiveTab,
}) => {
  const isToday = selectedDate === currentDate;

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
    <header className="sticky top-0 z-30 bg-[#F9F8F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 pt-3 pb-2">
      <div className="max-w-md mx-auto">
        {/* Top row: logo, date, actions */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-black tracking-tight text-stone-900 flex items-center gap-1.5">
              Momentum
              <span className="text-xs font-normal text-stone-400">
                • {isToday ? 'Today' : formatDateLabel(selectedDate)}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streak}d</span>
            </div>

            {/* Import */}
            <button
              onClick={onOpenImport}
              className="p-2 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all shadow-sm"
              title="Import from Gemini Notebook"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Add Habit */}
            <button
              onClick={onOpenAdd}
              className="p-2 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-sm"
              title="Add Habit"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Three-Tab Navigation */}
        <div className="flex items-center bg-stone-100 p-1 rounded-2xl text-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
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
