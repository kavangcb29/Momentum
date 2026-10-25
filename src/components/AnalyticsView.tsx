import React, { useState } from 'react';
import type { DayLog, Habit, WinterArcSettings } from '../types';
import { TrendingUp, Calendar, Download, Bookmark, BookOpen, ChevronRight } from 'lucide-react';
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
  const days: { dateStr: string; dayNum: number; points: number; percent: number }[] = [];
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
    <div className="space-y-4 tab-content-enter">
      {/* Subtab Toggle */}
      <div className="flex items-center justify-between bg-stone-100 p-1 rounded-2xl">
        <div className="flex items-center gap-1 flex-1">
          <button
            onClick={() => setSubTab('analytics')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'analytics'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Metrics & Heatmap</span>
          </button>

          <button
            onClick={() => setSubTab('journal')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'journal'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Memories ({memorableLogs.length})</span>
          </button>
        </div>

        {/* Excel Export */}
        <button
          onClick={() => exportToExcelCSV(logs, habits, settings)}
          className="ml-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-all"
          title="Download Excel / CSV spreadsheet"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {subTab === 'analytics' ? (
        <>
          {/* Hero Streak Card */}
          <section className="bg-streak-gradient rounded-3xl p-6 flex flex-col items-center text-center shadow-soft">
            {/* Mascots */}
            <div className="w-full flex items-center justify-center space-x-2 my-2 animate-float">
              {/* Orange Cloud Blob */}
              <div className="w-11 h-9 -mb-3 scale-95 transition-transform hover:scale-105">
                <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 32C6.02944 32 2 27.9706 2 23C2 18.5 5.5 14.5 10 14.1C11.5 8.5 16.5 4 22.5 4C29.5 4 35 9.5 35 16.5C39 17.5 42 21 42 25.5C42 30 38.5 32 34 32H11Z" fill="#FBAA7A" />
                  <ellipse cx="17" cy="18" rx="1.5" ry="2" fill="#292524" />
                  <ellipse cx="27" cy="18" rx="1.5" ry="2" fill="#292524" />
                  <path d="M20 22C21 23.5 23 23.5 24 22" stroke="#292524" strokeLinecap="round" strokeWidth="1.5" />
                  <circle cx="14" cy="21" r="2" fill="#F472B6" fillOpacity="0.4" />
                  <circle cx="30" cy="21" r="2" fill="#F472B6" fillOpacity="0.4" />
                </svg>
              </div>

              {/* Pink Clover (Center) */}
              <div className="w-16 h-16 z-10 transition-transform hover:scale-105">
                <svg className="w-full h-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="14" width="48" height="36" rx="18" fill="#F9A8D4" />
                  <rect x="14" y="8" width="36" height="48" rx="18" fill="#F9A8D4" />
                  <ellipse cx="26" cy="30" rx="2.5" ry="3.5" fill="#1C1917" />
                  <ellipse cx="38" cy="30" rx="2.5" ry="3.5" fill="#1C1917" />
                  <path d="M29.5 36C31 38 33 38 34.5 36" stroke="#1C1917" strokeLinecap="round" strokeWidth="2" />
                  <circle cx="21" cy="34" r="3.2" fill="#FB7185" fillOpacity="0.5" />
                  <circle cx="43" cy="34" r="3.2" fill="#FB7185" fillOpacity="0.5" />
                </svg>
              </div>

              {/* Periwinkle Bean */}
              <div className="w-10 h-10 -mb-2 scale-90 transition-transform hover:scale-105">
                <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="36" height="42" rx="18" fill="#A5B4FC" />
                  <ellipse cx="15" cy="22" rx="1.5" ry="2" fill="#1E1B4B" />
                  <ellipse cx="25" cy="22" rx="1.5" ry="2" fill="#1E1B4B" />
                  <path d="M18 26C19 27.5 21 27.5 22 26" stroke="#1E1B4B" strokeLinecap="round" strokeWidth="1.5" />
                  <circle cx="12" cy="25" r="2" fill="#818CF8" fillOpacity="0.6" />
                  <circle cx="28" cy="25" r="2" fill="#818CF8" fillOpacity="0.6" />
                </svg>
              </div>
            </div>

            <div className="mt-2 flex flex-col items-center">
              <span className="text-[56px] font-bold leading-none tracking-tight text-stone-900">{streak}</span>
              <span className="text-base font-semibold text-stone-700 mt-1">days in a row</span>
            </div>
            <p className="text-xs text-stone-500 mt-3 px-4 leading-relaxed">
              Complete your daily targets to keep your streak growing. Best so far: {bestDay} pts in a single day.
            </p>
          </section>

          {/* Overview Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            <article className="bg-white rounded-3xl p-5 shadow-card border border-stone-100 flex flex-col justify-between min-h-[96px]">
              <p className="text-3xl font-bold tracking-tight text-stone-900">{totalDaysLogged}</p>
              <p className="text-xs font-normal text-stone-500 mt-1">active days</p>
            </article>
            <article className="bg-white rounded-3xl p-5 shadow-card border border-stone-100 flex flex-col justify-between min-h-[96px]">
              <p className="text-3xl font-bold tracking-tight text-stone-900">{totalPointsAllTime}</p>
              <p className="text-xs font-normal text-stone-500 mt-1">total points</p>
            </article>
            <article className="bg-white rounded-3xl p-5 shadow-card border border-stone-100 flex flex-col justify-between min-h-[96px]">
              <p className="text-3xl font-bold tracking-tight text-stone-900">{habits.length}</p>
              <p className="text-xs font-normal text-stone-500 mt-1">active habits</p>
            </article>
            <article className="bg-white rounded-3xl p-5 shadow-card border border-stone-100 flex flex-col justify-between min-h-[96px]">
              <p className="text-3xl font-bold tracking-tight text-stone-900">{bestDay}</p>
              <p className="text-xs font-normal text-stone-500 mt-1">best day score</p>
            </article>
          </div>

          {/* 7-Day Dots Row */}
          <section className="bg-white rounded-3xl p-5 shadow-card border border-stone-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-stone-900">Last 7 days</h2>
              <span className="text-xs font-semibold text-stone-500">
                {days.slice(-7).filter(d => d.percent >= 70).length} of 7
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-center text-center">
              {days.slice(-7).map((item) => {
                const d = new Date(item.dateStr + 'T00:00:00');
                const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
                const isSelected = item.dateStr === selectedDate;
                const met = item.percent >= 70;

                return (
                  <div key={item.dateStr} className="flex flex-col items-center space-y-2">
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-stone-900 font-semibold' : 'text-stone-400'}`}>
                      {dayLetter}
                    </span>
                    <button
                      onClick={() => onSelectDate(item.dateStr)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        met
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-200/80'
                      } ${isSelected ? 'ring-2 ring-stone-400 ring-offset-2' : ''}`}
                    >
                      {met && (
                        <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 35-Day Heatmap */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                <Calendar className="w-4 h-4 text-stone-500" />
                <span>Monthly Heatmap</span>
              </div>
              <span className="text-[10px] font-medium text-stone-400">
                {totalDaysLogged} Active Days
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <div key={idx} className="text-[10px] font-bold text-stone-400 pb-1">
                  {d}
                </div>
              ))}

              {days.map((item) => {
                const isSelected = item.dateStr === selectedDate;
                let bgClass = 'bg-stone-100 text-stone-400';
                if (item.percent >= 80) bgClass = 'bg-stone-900 text-white font-bold';
                else if (item.percent >= 50) bgClass = 'bg-stone-500 text-white font-medium';
                else if (item.percent > 0) bgClass = 'bg-stone-300 text-stone-700';

                return (
                  <button
                    key={item.dateStr}
                    onClick={() => onSelectDate(item.dateStr)}
                    className={`h-9 rounded-xl flex flex-col items-center justify-center transition-all ${bgClass} ${
                      isSelected ? 'ring-2 ring-rose-400 ring-offset-2 scale-105' : 'hover:opacity-80'
                    }`}
                    title={`${item.dateStr}: ${item.points} pts (${item.percent}%)`}
                  >
                    <span className="text-[11px] leading-none">{item.dayNum}</span>
                    {item.points > 0 && (
                      <span className="text-[8px] leading-none mt-0.5 opacity-80">
                        {item.points}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
              <span>Less active</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-stone-100"></span>
                <span className="w-3 h-3 rounded-md bg-stone-300"></span>
                <span className="w-3 h-3 rounded-md bg-stone-500"></span>
                <span className="w-3 h-3 rounded-md bg-stone-900"></span>
              </div>
              <span>Goal reached</span>
            </div>
          </div>
        </>
      ) : (
        /* Memory Journal Timeline */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-violet-500" />
              <span>Memorable Moments Timeline</span>
            </h4>
            <span className="text-xs text-stone-400">
              {memorableLogs.length} memories
            </span>
          </div>

          {memorableLogs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-dashed border-stone-200 text-center space-y-2 shadow-card">
              <p className="text-xs text-stone-500">
                No memorable moments recorded yet.
              </p>
              <p className="text-[11px] text-stone-400">
                Write daily highlights on the Daily tab to build your reflection archive.
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
                    className="p-4 rounded-3xl bg-white border border-stone-100 hover:border-violet-200 transition-all cursor-pointer space-y-2 group shadow-card"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-600 flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 fill-violet-100 text-violet-500" />
                        <span>{formattedDate}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-stone-500">
                          {log.totalPoints} pts
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-violet-400 transition-colors" />
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed italic bg-stone-50 p-3 rounded-2xl border border-stone-100">
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
