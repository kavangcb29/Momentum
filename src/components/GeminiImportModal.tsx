import React, { useState } from 'react';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { parseGeminiNotebookText } from '../utils/geminiParser';
import type { Habit } from '../types';

interface GeminiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportHabits: (habits: Habit[]) => void;
}

const SAMPLE_NOTEBOOK_TEXT = `Winter Arc October Checklist:
- [ ] Morning Gym Workout (20 pts)
- [ ] 2 Hours Deep Work / Code (20 pts)
- [ ] Cold shower and hydration (10 pts)
- [ ] Clean diet without sugar (15 pts)
- [ ] Read 15 pages of book (10 pts)
- [ ] 10 minutes meditation & breathing (10 pts)
- [ ] No social media before 12pm (15 pts)`;

export const GeminiImportModal: React.FC<GeminiImportModalProps> = ({
  isOpen,
  onClose,
  onImportHabits,
}) => {
  const [rawText, setRawText] = useState(SAMPLE_NOTEBOOK_TEXT);
  const [parsedHabits, setParsedHabits] = useState<Habit[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  if (!isOpen) return null;

  const handlePreview = () => {
    const habits = parseGeminiNotebookText(rawText);
    setParsedHabits(habits);
    setHasParsed(true);
  };

  const handleConfirm = () => {
    if (parsedHabits.length > 0) {
      onImportHabits(parsedHabits);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Import from Gemini Notebook
              </h3>
              <p className="text-xs text-slate-400">
                Paste your daily winter arc points or checklist
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Paste Notebook Text / Markdown
            </label>
            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setHasParsed(false);
              }}
              placeholder="Paste lines like:&#10;- Gym workout (20 pts)&#10;- Deep work 2hr (20 pts)&#10;- Read 10 pages (10 pts)"
              className="w-full bg-[#070A11] border border-slate-700/80 rounded-2xl p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Parse & Preview ({hasParsed ? parsedHabits.length : 'Click'})</span>
            </button>
            <span className="text-[11px] text-slate-500">
              Auto-detects points, category, & emojis
            </span>
          </div>

          {/* Parsed Preview */}
          {hasParsed && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detected Habits ({parsedHabits.length})
              </h4>
              {parsedHabits.length === 0 ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>No valid habits detected. Check your text format.</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {parsedHabits.map((h, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{h.icon}</span>
                        <span className="text-slate-200 truncate">{h.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                          {h.category}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-cyan-400">
                          +{h.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={!hasParsed || parsedHabits.length === 0}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply to Momentum</span>
          </button>
        </div>
      </div>
    </div>
  );
};
