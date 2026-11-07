import React, { useState } from 'react';
import type { Habit } from '../types';
import { Plus, ChevronDown, ChevronUp, Sparkles, ShieldAlert, BookOpen, Trash2, Search } from 'lucide-react';

interface ChallengesListProps {
  habits: Habit[];
  onOpenAdd: () => void;
  onDeleteHabit: (habitId: string) => void;
}

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

export const ChallengesList: React.FC<ChallengesListProps> = ({
  habits,
  onOpenAdd,
  onDeleteHabit,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Group habits by category
  const categories = ['All', ...Array.from(new Set(habits.map((h) => h.category)))];

  const filteredHabits = habits.filter((h) => {
    const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.strict_rule && h.strict_rule.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalPoints = habits.reduce((acc, h) => acc + h.points, 0);

  return (
    <div className="space-y-4 tab-content-enter">
      {/* Header Banner */}
      <section className="bg-streak-gradient rounded-3xl p-6 shadow-soft relative overflow-hidden flex flex-col justify-between border border-stone-200/50 dark:border-stone-800 select-none">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              Curated Protocols
            </span>
            <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-0.5">
              Challenges & Rules
            </h2>
          </div>
          <button
            onClick={onOpenAdd}
            className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 shadow-sm border border-stone-200/80 dark:border-stone-700 flex items-center justify-center text-stone-800 dark:text-stone-200 active-tactile transition-colors"
            title="Add New Challenge"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs p-3 rounded-2xl border border-white/60 dark:border-stone-800">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Total Challenges</span>
            <div className="text-xl font-black text-stone-900 dark:text-stone-100">{habits.length}</div>
          </div>
          <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs p-3 rounded-2xl border border-white/60 dark:border-stone-800">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Daily Max Points</span>
            <div className="text-xl font-black text-stone-900 dark:text-stone-100">{totalPoints} pts</div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges, keywords, rules..."
            className="w-full bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl pl-9.5 pr-4 py-2.5 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar px-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredHabits.length === 0 ? (
          <div className="col-span-full p-8 rounded-3xl bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 text-center space-y-2 shadow-card">
            <p className="text-xs text-stone-500">No challenges found matching your query.</p>
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const isExpanded = expandedId === habit.id;
            const catStyle = CATEGORY_STYLES[habit.category] || {
              bg: 'bg-stone-50 dark:bg-stone-800',
              text: 'text-stone-600 dark:text-stone-300',
              border: 'border-stone-200 dark:border-stone-700',
            };
            const hasExtraDetails = Boolean(habit.strict_rule || habit.minimum_resilient || habit.scientific_rationale);

            return (
              <div
                key={habit.id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-card overflow-hidden transition-all duration-200 hover:shadow-soft dark:hover:border-stone-700"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : habit.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 flex items-center justify-center text-lg flex-shrink-0"
                      style={habit.color ? { backgroundColor: `${habit.color}25`, borderColor: `${habit.color}70` } : undefined}
                    >
                      {habit.icon || '⚡'}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                        {habit.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {habit.category}
                        </span>
                        <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
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
                      className="p-1.5 rounded-xl text-stone-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
                  <div className="px-4 pb-4 pt-1 space-y-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-xs animate-fadeIn">
                    {habit.strict_rule && (
                      <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-1">
                        <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200 font-bold text-[11px] uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Strict Execution Protocol</span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">{habit.strict_rule}</p>
                      </div>
                    )}

                    {habit.minimum_resilient && (
                      <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Minimum Resilient Floor</span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{habit.minimum_resilient}</p>
                      </div>
                    )}

                    {habit.scientific_rationale && (
                      <div className="p-3 rounded-2xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 space-y-1">
                        <div className="flex items-center gap-1.5 text-violet-800 dark:text-violet-400 font-bold text-[11px] uppercase tracking-wider">
                          <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                          <span>Scientific Mechanism</span>
                        </div>
                        <p className="text-stone-500 dark:text-stone-400 italic leading-relaxed">"{habit.scientific_rationale}"</p>
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
