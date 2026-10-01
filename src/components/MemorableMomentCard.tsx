import React, { useState, useEffect } from 'react';
import { Check, Bookmark } from 'lucide-react';

interface MemorableMomentCardProps {
  date: string;
  isToday: boolean;
  memorableMoment?: string;
  onSaveMoment: (moment: string) => void;
}

export const MemorableMomentCard: React.FC<MemorableMomentCardProps> = ({
  date,
  isToday,
  memorableMoment = '',
  onSaveMoment,
}) => {
  const [text, setText] = useState(memorableMoment);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state when date changes
  useEffect(() => {
    setText(memorableMoment || '');
    setIsSaved(false);
  }, [date, memorableMoment]);

  const handleBlur = () => {
    if (text !== memorableMoment) {
      onSaveMoment(text);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSaveMoment(text);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 shadow-lg space-y-3 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>Memorable Moment & Reflection</span>
              {isToday && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold lowercase">
                  today
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Capture your biggest win, lesson, or highlight for {date}
            </p>
          </div>
        </div>

        {/* Auto-save status indicator */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {isSaved ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          ) : text && text !== memorableMoment ? (
            <span className="text-amber-400 animate-pulse">Unsaved...</span>
          ) : null}
        </div>
      </div>

      <div className="relative">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="What made today stand out in your winter arc? A great workout, a breakthrough, a lesson learned, or something you're grateful for..."
          className="w-full bg-[#070A11]/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 transition-all resize-none font-sans leading-relaxed"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>Auto-saves when you click away or tap Save</span>
        <button
          type="button"
          onClick={() => {
            onSaveMoment(text);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
          }}
          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold transition-all flex items-center gap-1"
        >
          <Check className="w-3 h-3" />
          <span>Save Moment</span>
        </button>
      </div>
    </div>
  );
};
