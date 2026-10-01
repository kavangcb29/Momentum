import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Habit } from '../types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Habit) => void;
}

const CATEGORIES: Habit['category'][] = ['Focus', 'Physical', 'Mind', 'Discipline', 'Skill', 'Health'];

const EMOJIS = ['⚡', '🏋️', '💻', '📖', '🧘', '🚿', '🥗', '💧', '📵', '🎯', '🔥', '🧠'];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAddHabit,
}) => {
  const [name, setName] = useState('');
  const [points, setPoints] = useState<number>(15);
  const [category, setCategory] = useState<Habit['category']>('Focus');
  const [icon, setIcon] = useState('⚡');

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
      createdAt: new Date().toISOString(),
    };

    onAddHabit(newHabit);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="font-bold text-slate-100 text-base">New Winter Arc Habit</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 100 Pushups or 1 Hr Python"
              className="w-full bg-[#070A11] border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Points Weight
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-[#070A11] border border-slate-700/80 rounded-xl px-3 py-2 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Habit['category'])}
                className="w-full bg-[#070A11] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all ${
                    icon === e
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-110'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Habit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
