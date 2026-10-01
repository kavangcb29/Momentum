import React from 'react';
import { Flame, Sparkles, Plus, BarChart2, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentDate: string;
  selectedDate: string;
  streak: number;
  onOpenImport: () => void;
  onOpenAdd: () => void;
  activeTab: 'today' | 'analytics';
  setActiveTab: (tab: 'today' | 'analytics') => void;
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

  return (
    <header className="sticky top-0 z-30 bg-[#070A11]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* App Title & Date */}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] font-black tracking-widest uppercase text-cyan-400">
              WINTER ARC
            </span>
          </div>
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            MOMENTUM
            <span className="text-xs font-normal text-slate-400">
              • {isToday ? 'Today' : formatDateLabel(selectedDate)}
            </span>
          </h1>
        </div>

        {/* Action Controls & Streak */}
        <div className="flex items-center gap-2">
          {/* Streak Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streak}d</span>
          </div>

          {/* Gemini Smart Import Button */}
          <button
            onClick={onOpenImport}
            className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center gap-1 text-xs font-semibold"
            title="Import from Gemini Notebook"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Quick Add Habit Button */}
          <button
            onClick={onOpenAdd}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            title="Add Habit"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto mt-2 flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-800/80 text-xs">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'today'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Daily Tracker</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'analytics'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Arc Analytics</span>
        </button>
      </div>
    </header>
  );
};
