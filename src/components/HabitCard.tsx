import React, { useState } from 'react';
import { Check, Trash2, ChevronDown, ChevronUp, ShieldAlert, Sparkles, BookOpen, Calendar } from 'lucide-react';
import type { Habit } from '../types';
import { soundManager } from '../utils/audio';

interface HabitCardProps {
  habit: Habit;
  isDone: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  shortcutKey?: number;
}

// Warm pastel category pill colors (light + dark mode variants)
const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Recovery & Circadian':  { bg: 'bg-indigo-50 dark:bg-indigo-950/40',  text: 'text-indigo-600 dark:text-indigo-400',  border: 'border-indigo-200 dark:border-indigo-800' },
  'Circadian Shield':      { bg: 'bg-blue-50 dark:bg-blue-950/40',    text: 'text-blue-600 dark:text-blue-400',    border: 'border-blue-200 dark:border-blue-800' },
  'Mindset & Focus':       { bg: 'bg-purple-50 dark:bg-purple-950/40',  text: 'text-purple-600 dark:text-purple-400',  border: 'border-purple-200 dark:border-purple-800' },
  'Environment Reset':     { bg: 'bg-teal-50 dark:bg-teal-950/40',    text: 'text-teal-600 dark:text-teal-400',    border: 'border-teal-200 dark:border-teal-800' },
  'Physical Hypertrophy':  { bg: 'bg-amber-50 dark:bg-amber-950/40',   text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-800' },
  'Nutrition & Bulk':      { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  'Technical & Academics': { bg: 'bg-cyan-50 dark:bg-cyan-950/40',    text: 'text-cyan-600 dark:text-cyan-400',    border: 'border-cyan-200 dark:border-cyan-800' },
  'Knowledge Base':        { bg: 'bg-sky-50 dark:bg-sky-950/40',     text: 'text-sky-600 dark:text-sky-400',     border: 'border-sky-200 dark:border-sky-800' },
  'Career Transition':     { bg: 'bg-rose-50 dark:bg-rose-950/40',    text: 'text-rose-600 dark:text-rose-400',    border: 'border-rose-200 dark:border-rose-800' },
  'Interview Mastery':     { bg: 'bg-violet-50 dark:bg-violet-950/40',  text: 'text-violet-600 dark:text-violet-400',  border: 'border-violet-200 dark:border-violet-800' },
  'Weekly Retrospective':  { bg: 'bg-yellow-50 dark:bg-yellow-950/40',  text: 'text-yellow-700 dark:text-yellow-400',  border: 'border-yellow-200 dark:border-yellow-800' },
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isDone,
  onToggle,
  onDelete,
  shortcutKey,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const catStyle = CATEGORY_STYLES[habit.category] || {
    bg: 'bg-stone-50 dark:bg-stone-800',
    text: 'text-stone-500 dark:text-stone-400',
    border: 'border-stone-200 dark:border-stone-700',
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(isDone ? 20 : 35);
    }
    if (!isDone) {
      soundManager.playCheck();
    } else {
      soundManager.playUncheck();
    }
    onToggle(habit.id);
  };

  const hasExtraDetails = Boolean(habit.strict_rule || habit.minimum_resilient || habit.scientific_rationale);

  return (
    <div
      className={`group rounded-3xl border transition-colors duration-150 overflow-hidden select-none active:scale-[0.995] ${
        isDone
          ? 'bg-white/60 dark:bg-stone-900/50 border-stone-200/80 dark:border-stone-800/80 shadow-card'
          : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-soft dark:hover:border-stone-700'
      }`}
    >
      {/* Main Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {/* Habit Icon */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base flex-shrink-0 transition-colors duration-150 ${
              isDone
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800'
                : 'bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700'
            }`}
            style={!isDone && habit.color ? { backgroundColor: `${habit.color}25`, borderColor: `${habit.color}70` } : undefined}
          >
            {habit.icon || '⚡'}
          </div>

          {/* Title & Category */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {shortcutKey !== undefined && shortcutKey <= 9 && (
                <span className="hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-400 font-bold">
                  {shortcutKey}
                </span>
              )}
              <div
                className={`text-sm font-semibold truncate transition-colors duration-150 ${
                  isDone
                    ? 'line-through text-stone-400 dark:text-stone-500'
                    : 'text-stone-800 dark:text-stone-100'
                }`}
              >
                {habit.name}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                +{habit.points} pts
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-lg font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
              >
                {habit.category}
              </span>
              {habit.scheduled_days && (
                <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{habit.scheduled_days.join(', ')}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasExtraDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="View rules & science"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(habit.id);
            }}
            className="opacity-40 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 active-tactile"
            title="Delete habit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Completion Checkmark */}
          <button
            type="button"
            onClick={handleToggleClick}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform duration-100 active:scale-90 ${
              isDone
                ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-white dark:text-stone-900 shadow-sm'
                : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-stone-500'
            }`}
          >
            {isDone && <Check className="w-4 h-4 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Expandable Protocol Drawer */}
      {isExpanded && hasExtraDetails && (
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-xs animate-fadeIn">
          {/* Strict Rule */}
          {habit.strict_rule && (
            <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-bold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Strict Execution Protocol</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">{habit.strict_rule}</p>
            </div>
          )}

          {/* Minimum Resilient Fallback */}
          {habit.minimum_resilient && (
            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Minimum Resilient Floor</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{habit.minimum_resilient}</p>
            </div>
          )}

          {/* Scientific Rationale */}
          {habit.scientific_rationale && (
            <div className="p-3 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-400 font-bold text-[11px] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Scientific Rationale</span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 italic leading-relaxed">"{habit.scientific_rationale}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
