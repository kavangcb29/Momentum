import React, { useState, useRef } from 'react';
import { X, Sparkles, Check, AlertCircle, Upload, Copy, FileText, Calendar } from 'lucide-react';
import { parseGeminiNotebookPayload, type ParseResult } from '../utils/geminiParser';
import type { Habit, DayLog } from '../types';

interface GeminiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportHabits: (habits: Habit[], logs?: Record<string, DayLog>) => void;
}

const SAMPLE_NOTEBOOK_TEXT = `Winter Arc November Protocols:
- [ ] Rise before 7:30 AM & 8h Sleep (15 pts)
  - Strict: Bed by 11:15 PM, alarm set strictly without snooze
  - Resilient: 7 hours sleep minimum on high workload days
  - Science: Optimizes GH and testosterone secretion
- [ ] 90-Min Daily Technical Study Sprint (20 pts)
  - Strict: 90 uninterrupted minutes of SQL/System design practice
  - Resilient: 20 minutes reviewing cheatsheets
  - Science: Deliberate practice compounds technical mastery
- [ ] Hypertrophy & Progressive Overload (20 pts)
  - Strict: 4 sets per exercise targeting RPE 8-9
  - Resilient: 15-minute bodyweight mobility session
- [ ] Clean Surplus & 80g Protein Floor (20 pts)
- [ ] 10-Min Evening Meditation & Box Breathing (10 pts)
- [ ] No Social Media / Phone Before 11 AM (15 pts)`;

const GEMINI_PROMPT_TEMPLATE = `Format my November Winter Arc protocols as a JSON object for Momentum tracker:
{
  "habits": [
    {
      "name": "Habit Name",
      "points": 20,
      "category": "Physical Hypertrophy",
      "strict_rule": "Detailed rule on how it works",
      "minimum_resilient": "Fallback floor when exhausted",
      "scientific_rationale": "Why it works scientifically"
    }
  ]
}`;

export const GeminiImportModal: React.FC<GeminiImportModalProps> = ({
  isOpen,
  onClose,
  onImportHabits,
}) => {
  const [rawText, setRawText] = useState(SAMPLE_NOTEBOOK_TEXT);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [hasParsed, setHasParsed] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePreview = () => {
    const result = parseGeminiNotebookPayload(rawText);
    setParseResult(result);
    setHasParsed(true);
  };

  const handleConfirm = () => {
    if (parseResult && parseResult.habits.length > 0) {
      onImportHabits(parseResult.habits, parseResult.logs);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        const result = parseGeminiNotebookPayload(content);
        setParseResult(result);
        setHasParsed(true);
      }
    };
    reader.readAsText(file);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(GEMINI_PROMPT_TEMPLATE);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const detectedHabits = parseResult?.habits || [];
  const detectedLogs = parseResult?.logs ? Object.keys(parseResult.logs) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Import from Gemini Notebook
              </h3>
              <p className="text-xs text-stone-400">
                Upload or paste rules, points, execution protocols & logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action helper bar */}
        <div className="pt-3 flex items-center justify-between text-xs gap-2">
          <button
            onClick={handleCopyPrompt}
            className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            title="Copy format prompt to ask Gemini in your notebook"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
            <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy Gemini Prompt'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,.md,.txt"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-stone-400" />
            <span>Upload File (.json, .md)</span>
          </button>
        </div>

        {/* Text Area */}
        <div className="py-3 space-y-3 overflow-y-auto flex-1 pr-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Notebook Markdown or JSON
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setHasParsed(false);
              }}
              placeholder="Paste markdown checklist with sub-protocols or JSON payload..."
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 text-xs font-mono text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 dark:focus:ring-stone-800 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
              <span>Parse & Preview ({hasParsed ? detectedHabits.length : 'Inspect'})</span>
            </button>
            <span className="text-[11px] text-stone-400">
              Supports sub-rules (Strict, Resilient, Science)
            </span>
          </div>

          {/* Parsed Preview */}
          {hasParsed && (
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Detected Protocols ({detectedHabits.length})</span>
                </h4>
                {detectedLogs.length > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>+{detectedLogs.length} Day Logs</span>
                  </span>
                )}
              </div>

              {detectedHabits.length === 0 ? (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>No valid habits detected. Check your format or try JSON.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {detectedHabits.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/80 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <span>{h.icon || '⚡'}</span>
                          <span className="text-stone-900 dark:text-stone-100 font-bold truncate">{h.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                            {h.category}
                          </span>
                          <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                            +{h.points} pts
                          </span>
                        </div>
                      </div>

                      {h.strict_rule && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 pl-6 leading-relaxed">
                          • <span className="font-semibold text-stone-700 dark:text-stone-300">Rule:</span> {h.strict_rule}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={!hasParsed || detectedHabits.length === 0}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-black dark:hover:bg-white disabled:opacity-40 text-white dark:text-stone-900 font-semibold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply to Momentum</span>
          </button>
        </div>
      </div>
    </div>
  );
};
