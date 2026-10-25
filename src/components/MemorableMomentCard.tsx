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
    <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-card space-y-3 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-violet-50 text-violet-500 border border-violet-100">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Memorable Moment</span>
              {isToday && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-violet-50 text-violet-500 font-semibold lowercase border border-violet-100">
                  today
                </span>
              )}
            </h3>
            <p className="text-[11px] text-stone-400">
              Capture your biggest win or lesson for {date}
            </p>
          </div>
        </div>

        {/* Auto-save status indicator */}
        <div className="flex items-center gap-1 text-[11px]">
          {isSaved ? (
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          ) : text && text !== memorableMoment ? (
            <span className="text-amber-500 animate-pulse font-medium">Unsaved...</span>
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
          placeholder="What made today stand out? A great workout, a breakthrough, a lesson learned, or something you're grateful for..."
          className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all resize-none leading-relaxed"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-stone-400">
        <span>Auto-saves when you click away • Ctrl+Enter to save</span>
        <button
          type="button"
          onClick={() => {
            onSaveMoment(text);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
          }}
          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold transition-all flex items-center gap-1"
        >
          <Check className="w-3 h-3" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};
