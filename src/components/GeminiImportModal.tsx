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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Import from Gemini Notebook
              </h3>
              <p className="text-xs text-stone-400">
                Paste JSON or bulleted protocol rules to automatically import
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Paste Notebook Text / Markdown / JSON
            </label>
            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setHasParsed(false);
              }}
              placeholder="Paste markdown checklist or JSON array..."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs font-mono text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Parse & Preview ({hasParsed ? parsedHabits.length : 'Click'})</span>
            </button>
            <span className="text-[11px] text-stone-400">
              Auto-detects JSON schemas & rules
            </span>
          </div>

          {/* Parsed Preview */}
          {hasParsed && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Detected Habits ({parsedHabits.length})
              </h4>
              {parsedHabits.length === 0 ? (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>No valid habits detected. Check your text format.</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {parsedHabits.map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{h.icon || '⚡'}</span>
                        <span className="text-stone-800 font-medium truncate">{h.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-stone-500 px-2 py-0.5 rounded-full bg-white border border-stone-200">
                          {h.category}
                        </span>
                        <span className="text-[11px] font-bold text-stone-700">
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
        <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={!hasParsed || parsedHabits.length === 0}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-black disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply to Momentum</span>
          </button>
        </div>
      </div>
    </div>
  );
};
