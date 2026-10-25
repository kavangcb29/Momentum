import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Habit } from '../types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Habit) => void;
}

const CATEGORIES: Habit['category'][] = [
  'Recovery & Circadian',
  'Circadian Shield',
  'Mindset & Focus',
  'Environment Reset',
  'Physical Hypertrophy',
  'Nutrition & Bulk',
  'Technical & Academics',
  'Knowledge Base',
  'Career Transition',
  'Interview Mastery',
  'Weekly Retrospective',
];

const EMOJIS = ['⚡', '🏋️', '💻', '📖', '🧘', '🚿', '🥗', '💧', '📵', '🎯', '🔥', '🧠', '🌅', '🧹', '🎙️', '📊'];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAddHabit,
}) => {
  const [name, setName] = useState('');
  const [points, setPoints] = useState<number>(15);
  const [category, setCategory] = useState<Habit['category']>('Mindset & Focus');
  const [icon, setIcon] = useState('⚡');
  const [strictRule, setStrictRule] = useState('');
  const [minResilient, setMinResilient] = useState('');
  const [scientificRationale, setScientificRationale] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHabit: Habit = {
      id: `h_${Date.now()}`,
      name: name.trim(),
      points: Number(points) || 10,
      category,
      icon,
      strict_rule: strictRule.trim() || undefined,
      minimum_resilient: minResilient.trim() || undefined,
      scientific_rationale: scientificRationale.trim() || undefined,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
    };

    onAddHabit(newHabit);
    setName('');
    setStrictRule('');
    setMinResilient('');
    setScientificRationale('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 text-base">New Challenge / Habit</h3>
            <p className="text-xs text-stone-400">Add a protocol to your active daily tracking</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 space-y-3.5 overflow-y-auto flex-1 pr-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 90-Min Daily Study Sprint"
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Points Weight
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Habit['category'])}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Icon Emoji
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border transition-all ${
                    icon === e
                      ? 'bg-stone-900 border-stone-900 text-white shadow-sm scale-105'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Strict Rule (Optional)
            </label>
            <textarea
              rows={2}
              value={strictRule}
              onChange={(e) => setStrictRule(e.target.value)}
              placeholder="e.g. Execute 90 minutes of deep work without phone distraction."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Minimum Resilient Floor (Optional)
            </label>
            <input
              type="text"
              value={minResilient}
              onChange={(e) => setMinResilient(e.target.value)}
              placeholder="e.g. 15 minutes reviewing lecture notes on low-energy days."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Scientific Rationale (Optional)
            </label>
            <input
              type="text"
              value={scientificRationale}
              onChange={(e) => setScientificRationale(e.target.value)}
              placeholder="e.g. Protects REM sleep architecture and memory consolidation."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-all"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white font-semibold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Challenge</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
