import React, { useState } from 'react';
import type { DayLog, Habit, WinterArcSettings } from '../types';
import { Flame, Trophy, TrendingUp, Calendar, Zap, Download, Bookmark, BookOpen, ChevronRight } from 'lucide-react';
import { exportToExcelCSV } from '../utils/exportUtils';

interface AnalyticsViewProps {
  logs: Record<string, DayLog>;
  habits: Habit[];
  settings: WinterArcSettings;
  streak: number;
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  logs,
  habits,
  settings,
  streak,
  onSelectDate,
  selectedDate,
}) => {
  const [subTab, setSubTab] = useState<'analytics' | 'journal'>('analytics');

  // Generate last 35 days calendar grid
  const days: { dateStr: string; dayNum: number; points: number; percent: number; isFuture: boolean }[] = [];
  const today = new Date();

  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs[dateStr];
    const pts = log ? log.totalPoints : 0;
    const tgt = log ? log.targetPoints : settings.dailyTargetPoints;
    const pct = Math.min(100, Math.round((pts / Math.max(1, tgt)) * 100));

    days.push({
      dateStr,
      dayNum: d.getDate(),
      points: pts,
      percent: pct,
      isFuture: false,
    });
  }

  // Calculate stats
  const totalPointsAllTime = Object.values(logs).reduce((acc, l) => acc + l.totalPoints, 0);
  const totalDaysLogged = Object.values(logs).filter((l) => l.totalPoints > 0).length;
  const bestDay = Math.max(0, ...Object.values(logs).map((l) => l.totalPoints));

  // Extract all logged memorable moments sorted latest first
  const memorableLogs = Object.values(logs)
    .filter((l) => l.memorableMoment && l.memorableMoment.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      {/* Subtab Toggle: Analytics vs Memory Journal */}
      <div className="flex items-center justify-between bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 flex-1">
          <button
            onClick={() => setSubTab('analytics')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'analytics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Metrics & Heatmap</span>
          </button>

          <button
            onClick={() => setSubTab('journal')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'journal'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Memories Vault ({memorableLogs.length})</span>
          </button>
        </div>

        {/* 1-Click Excel Export */}
        <button
          onClick={() => exportToExcelCSV(logs, habits, settings)}
          className="ml-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
          title="Download Excel / CSV spreadsheet"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel</span>
        </button>
      </div>

      {subTab === 'analytics' ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="flex items-center justify-center text-amber-400 mb-1">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="text-xl font-black font-mono text-white">{streak}</div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Day Streak
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="flex items-center justify-center text-cyan-400 mb-1">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-xl font-black font-mono text-white">{totalPointsAllTime}</div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Total Pts
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="flex items-center justify-center text-emerald-400 mb-1">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-xl font-black font-mono text-white">{bestDay}</div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Best Score
              </div>
            </div>
          </div>

          {/* Consistency Heatmap */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Winter Arc Heatmap (35 Days)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {totalDaysLogged} Active Days
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <div key={idx} className="text-[10px] font-bold text-slate-500 pb-1">
                  {d}
                </div>
              ))}

              {days.map((item) => {
                const isSelected = item.dateStr === selectedDate;
                let bgClass = 'bg-slate-950 border-slate-800 text-slate-500';
                if (item.percent >= 80) bgClass = 'bg-cyan-400 text-slate-950 font-bold border-cyan-400';
                else if (item.percent >= 50) bgClass = 'bg-cyan-700 text-white font-medium border-cyan-600';
                else if (item.percent > 0) bgClass = 'bg-cyan-950/80 text-cyan-400 border-cyan-800';

                return (
                  <button
                    key={item.dateStr}
                    onClick={() => onSelectDate(item.dateStr)}
                    className={`h-9 rounded-xl border flex flex-col items-center justify-center transition-all ${bgClass} ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'hover:opacity-80'
                    }`}
                    title={`${item.dateStr}: ${item.points} pts (${item.percent}%)`}
                  >
                    <span className="text-[11px] leading-none">{item.dayNum}</span>
                    {item.points > 0 && (
                      <span className="text-[8px] font-mono leading-none mt-0.5 opacity-80">
                        {item.points}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Less active</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-slate-950 border border-slate-800"></span>
                <span className="w-3 h-3 rounded-md bg-cyan-950 border border-cyan-800"></span>
                <span className="w-3 h-3 rounded-md bg-cyan-700 border border-cyan-600"></span>
                <span className="w-3 h-3 rounded-md bg-cyan-400"></span>
              </div>
              <span>Goal reached</span>
            </div>
          </div>

          {/* Habit Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Active Arc Focus Habits ({habits.length})</span>
            </h4>
            <div className="space-y-1.5">
              {habits.map((h) => (
                <div
                  key={h.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span>{h.icon}</span>
                    <span className="text-slate-200 font-medium">{h.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800">
                      {h.category}
                    </span>
                    <span className="font-mono font-bold text-cyan-400">
                      +{h.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Memory Journal Timeline */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Memorable Moments Timeline</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              {memorableLogs.length} memories logged
            </span>
          </div>

          {memorableLogs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">
                No memorable moments recorded yet.
              </p>
              <p className="text-[11px] text-slate-500">
                Write daily highlights on the tracker tab to build your month-end reflection archive.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {memorableLogs.map((log) => {
                const d = new Date(log.date + 'T00:00:00');
                const formattedDate = d.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short',
                });

                return (
                  <div
                    key={log.date}
                    onClick={() => onSelectDate(log.date)}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-purple-500/40 transition-all cursor-pointer space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 fill-purple-400/20 text-purple-400" />
                        <span>{formattedDate} ({log.date})</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-cyan-400">
                          {log.totalPoints} pts
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 transition-colors" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                      "{log.memorableMoment}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
