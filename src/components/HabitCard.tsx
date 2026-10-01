import React, { useState } from 'react';
import { Check, Trash2, ChevronDown, ChevronUp, ShieldAlert, Sparkles, BookOpen, Calendar } from 'lucide-react';
import type { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  isDone: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Recovery & Circadian': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  'Circadian Shield': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'Mindset & Focus': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'Environment Reset': { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  'Physical Hypertrophy': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'Nutrition & Bulk': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'Technical & Academics': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  'Knowledge Base': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  'Career Transition': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  'Interview Mastery': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  'Weekly Retrospective': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isDone,
  onToggle,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const catStyle = CATEGORY_STYLES[habit.category] || {
    bg: 'bg-slate-800/60',
    text: 'text-slate-300',
    border: 'border-slate-700/50',
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
      className={`group rounded-2xl border transition-all duration-200 overflow-hidden ${
        isDone
          ? 'bg-slate-900/40 border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.06)]'
          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
      }`}
    >
      {/* Main Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {/* Habit Icon */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all ${
              isDone
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/80 border border-slate-700/60 text-slate-300'
            }`}
          >
            {habit.icon || '⚡'}
          </div>

          {/* Title & Category */}
          <div className="min-w-0">
            <div
              className={`text-sm font-semibold truncate transition-all ${
                isDone ? 'line-through text-slate-400 opacity-80' : 'text-slate-100'
              }`}
            >
              {habit.name}
            </div>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-cyan-400">
                +{habit.points} pts
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
              >
                {habit.category}
              </span>
              {habit.scheduled_days && (
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-mono">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{habit.scheduled_days.join(', ')}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Expand Chevron & 1-Tap Checkmark Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasExtraDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
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
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
            title="Delete habit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* 1-Tap Completion Indicator */}
          <button
            type="button"
            onClick={handleToggleClick}
            className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-300 ${
              isDone
                ? 'bg-cyan-400 border-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/30 scale-105'
                : 'border-slate-700 bg-slate-950/60 hover:border-cyan-500/50'
            }`}
          >
            {isDone && <Check className="w-4 h-4 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Expandable Protocol Drawer */}
      {isExpanded && hasExtraDetails && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-slate-800/60 bg-slate-950/40 text-xs animate-fadeIn">
          {/* Strict Rule */}
          {habit.strict_rule && (
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Strict Execution Protocol</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{habit.strict_rule}</p>
            </div>
          )}

          {/* Minimum Resilient Fallback */}
          {habit.minimum_resilient && (
            <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Minimum Resilient Floor (Tough Days)</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{habit.minimum_resilient}</p>
            </div>
          )}

          {/* Scientific Rationale */}
          {habit.scientific_rationale && (
            <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Scientific Rationale & Mechanism</span>
              </div>
              <p className="text-slate-400 italic leading-relaxed font-sans">"{habit.scientific_rationale}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
