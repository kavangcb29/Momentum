import React, { useState } from 'react';
import type { Habit } from '../types';
import { Plus, ChevronDown, ChevronUp, Sparkles, ShieldAlert, BookOpen, Trash2 } from 'lucide-react';

interface ChallengesListProps {
  habits: Habit[];
  onOpenAdd: () => void;
  onDeleteHabit: (habitId: string) => void;
}

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

export const ChallengesList: React.FC<ChallengesListProps> = ({
  habits,
  onOpenAdd,
  onDeleteHabit,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Group habits by category
  const categories = ['All', ...Array.from(new Set(habits.map((h) => h.category)))];

  const filteredHabits = selectedCategory === 'All'
    ? habits
    : habits.filter((h) => h.category === selectedCategory);

  const totalPoints = habits.reduce((acc, h) => acc + h.points, 0);

  return (
    <div className="space-y-4 tab-content-enter">
      {/* Header Banner */}
      <section className="bg-streak-gradient rounded-3xl p-6 shadow-soft relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Curated Protocols
            </span>
            <h2 className="text-2xl font-black text-stone-900 mt-0.5">
              Challenges & Rules
            </h2>
          </div>
          <button
            onClick={onOpenAdd}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-800 hover:scale-105 active:scale-95 transition-all"
            title="Add New Challenge"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-white/60">
            <span className="text-[11px] text-stone-500 font-medium">Total Challenges</span>
            <div className="text-xl font-black text-stone-900">{habits.length}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-white/60">
            <span className="text-[11px] text-stone-500 font-medium">Daily Max Points</span>
            <div className="text-xl font-black text-stone-900">{totalPoints} pts</div>
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar px-0.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenge Cards List */}
      <div className="space-y-2.5">
        {filteredHabits.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-dashed border-stone-200 text-center space-y-2 shadow-card">
            <p className="text-xs text-stone-500">No challenges found for this category.</p>
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const isExpanded = expandedId === habit.id;
            const catStyle = CATEGORY_STYLES[habit.category] || {
              bg: 'bg-stone-50',
              text: 'text-stone-600',
              border: 'border-stone-200',
            };
            const hasExtraDetails = Boolean(habit.strict_rule || habit.minimum_resilient || habit.scientific_rationale);

            return (
              <div
                key={habit.id}
                className="bg-white rounded-3xl border border-stone-200/70 shadow-card overflow-hidden transition-all duration-200 hover:shadow-soft"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : habit.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-lg flex-shrink-0">
                      {habit.icon || '⚡'}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-stone-900 truncate">
                        {habit.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {habit.category}
                        </span>
                        <span className="text-[11px] font-semibold text-stone-500">
                          +{habit.points} pts
                        </span>
                        {habit.frequency && (
                          <span className="text-[10px] text-stone-400 font-medium">
                            • {habit.frequency.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHabit(habit.id);
                      }}
                      className="p-1.5 rounded-xl text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete Challenge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {hasExtraDetails && (
                      <div className="p-1 text-stone-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && hasExtraDetails && (
                  <div className="px-4 pb-4 pt-1 space-y-2 border-t border-stone-100 bg-stone-50/50 text-xs animate-fadeIn">
                    {habit.strict_rule && (
                      <div className="p-3 rounded-2xl bg-white border border-stone-200/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-stone-800 font-bold text-[11px] uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Strict Execution Protocol</span>
                        </div>
                        <p className="text-stone-600 leading-relaxed">{habit.strict_rule}</p>
                      </div>
                    )}

                    {habit.minimum_resilient && (
                      <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px] uppercase tracking-wider">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Minimum Resilient Floor</span>
                        </div>
                        <p className="text-stone-600 leading-relaxed">{habit.minimum_resilient}</p>
                      </div>
                    )}

                    {habit.scientific_rationale && (
                      <div className="p-3 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-violet-800 font-bold text-[11px] uppercase tracking-wider">
                          <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                          <span>Scientific Mechanism</span>
                        </div>
                        <p className="text-stone-500 italic leading-relaxed">"{habit.scientific_rationale}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
