import React, { useState } from 'react';
import { Check, Trash2, ChevronDown, ChevronUp, ShieldAlert, Sparkles, BookOpen, Calendar } from 'lucide-react';
import type { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  isDone: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// Warm pastel category pill colors
const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Recovery & Circadian':  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200' },
  'Circadian Shield':      { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  'Mindset & Focus':       { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
  'Environment Reset':     { bg: 'bg-teal-50',    text: 'text-teal-600',    border: 'border-teal-200' },
  'Physical Hypertrophy':  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  'Nutrition & Bulk':      { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  'Technical & Academics': { bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200' },
  'Knowledge Base':        { bg: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-200' },
  'Career Transition':     { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200' },
  'Interview Mastery':     { bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-200' },
  'Weekly Retrospective':  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isDone,
  onToggle,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const catStyle = CATEGORY_STYLES[habit.category] || {
    bg: 'bg-stone-50',
    text: 'text-stone-500',
    border: 'border-stone-200',
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(isDone ? 20 : 35);
    }
    onToggle(habit.id);
  };

  const hasExtraDetails = Boolean(habit.strict_rule || habit.minimum_resilient || habit.scientific_rationale);

  return (
    <div
      className={`group rounded-3xl border transition-all duration-200 overflow-hidden ${
        isDone
          ? 'bg-white/60 border-stone-200 shadow-card'
          : 'bg-white border-stone-200/70 shadow-card hover:shadow-soft'
      }`}
    >
      {/* Main Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {/* Habit Icon */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base flex-shrink-0 transition-all ${
              isDone
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-stone-100 border border-stone-200'
            }`}
          >
            {habit.icon || '⚡'}
          </div>

          {/* Title & Category */}
          <div className="min-w-0">
            <div
              className={`text-sm font-semibold truncate transition-all ${
                isDone ? 'line-through text-stone-400' : 'text-stone-800'
              }`}
            >
              {habit.name}
            </div>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] font-bold text-stone-500">
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
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
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
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50"
            title="Delete habit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Completion Checkmark */}
          <button
            type="button"
            onClick={handleToggleClick}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              isDone
                ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                : 'border-stone-300 bg-white hover:border-stone-400'
            }`}
          >
            {isDone && <Check className="w-4 h-4 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Expandable Protocol Drawer */}
      {isExpanded && hasExtraDetails && (
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-stone-100 bg-stone-50/50 text-xs animate-fadeIn">
          {/* Strict Rule */}
          {habit.strict_rule && (
            <div className="p-3 rounded-2xl bg-white border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-700 font-bold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Strict Execution Protocol</span>
              </div>
              <p className="text-stone-600 leading-relaxed">{habit.strict_rule}</p>
            </div>
          )}

          {/* Minimum Resilient Fallback */}
          {habit.minimum_resilient && (
            <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Minimum Resilient Floor</span>
              </div>
              <p className="text-stone-600 leading-relaxed">{habit.minimum_resilient}</p>
            </div>
          )}

          {/* Scientific Rationale */}
          {habit.scientific_rationale && (
            <div className="p-3 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-1">
              <div className="flex items-center gap-1.5 text-violet-700 font-bold text-[11px] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Scientific Rationale</span>
              </div>
              <p className="text-stone-500 italic leading-relaxed">"{habit.scientific_rationale}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
