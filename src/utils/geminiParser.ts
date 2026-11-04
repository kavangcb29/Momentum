import type { Habit, DayLog } from '../types';

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export interface ParseResult {
  habits: Habit[];
  logs?: Record<string, DayLog>;
}

export function parseGeminiNotebookPayload(rawText: string): ParseResult {
  const trimmed = rawText.trim();
  if (!trimmed) return { habits: [] };

  // 1. Check if the text is JSON
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);

      // Unified object format: { habits: [...], logs: { ... } }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.habits || parsed.rules)) {
        const rawHabits = parsed.habits || parsed.rules || [];
        const rawLogs = parsed.logs || {};

        const habits = Array.isArray(rawHabits) ? parseHabitsArray(rawHabits) : [];
        const logs: Record<string, DayLog> = {};

        // Parse logs if present
        if (typeof rawLogs === 'object') {
          Object.entries(rawLogs).forEach(([dateStr, logData]: [string, any]) => {
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              logs[dateStr] = {
                date: dateStr,
                completedHabitIds: Array.isArray(logData.completedHabitIds || logData.completed)
                  ? (logData.completedHabitIds || logData.completed)
                  : [],
                totalPoints: Number(logData.totalPoints || logData.points) || 0,
                targetPoints: Number(logData.targetPoints) || 120,
                memorableMoment: logData.memorableMoment || logData.notes || logData.reflection || '',
                isRestDay: Boolean(logData.isRestDay),
              };
            }
          });
        }

        return { habits, logs: Object.keys(logs).length > 0 ? logs : undefined };
      }

      // Plain array of habits: [ { name: "...", points: 20 }, ... ]
      const list = Array.isArray(parsed) ? parsed : [parsed];
      return { habits: parseHabitsArray(list) };
    } catch {
      // Fallback to markdown/text parser if JSON fails
    }
  }

  // 2. Hierarchical Markdown / Text Parser
  // Handles:
  // - [ ] Habit Name (20 pts)
  //   - Strict: ...
  //   - Resilient: ...
  //   - Science: ...
  const lines = trimmed.split('\n');
  const extractedHabits: Habit[] = [];
  let currentHabit: Habit | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();
    if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('---')) continue;

    // Check if line is a sub-detail under the current habit (indented or prefixed with tag)
    const isIndented = rawLine.startsWith('  ') || rawLine.startsWith('\t');
    const lowerTrimmed = trimmedLine.toLowerCase();

    if (
      currentHabit &&
      (isIndented ||
        lowerTrimmed.startsWith('strict:') ||
        lowerTrimmed.startsWith('protocol:') ||
        lowerTrimmed.startsWith('resilient:') ||
        lowerTrimmed.startsWith('floor:') ||
        lowerTrimmed.startsWith('science:') ||
        lowerTrimmed.startsWith('rationale:'))
    ) {
      if (lowerTrimmed.includes('strict:') || lowerTrimmed.includes('protocol:')) {
        currentHabit.strict_rule = trimmedLine.replace(/^[-*•]?\s*(strict|protocol):\s*/i, '').trim();
      } else if (lowerTrimmed.includes('resilient:') || lowerTrimmed.includes('floor:')) {
        currentHabit.minimum_resilient = trimmedLine.replace(/^[-*•]?\s*(minimum resilient|resilient|floor):\s*/i, '').trim();
      } else if (lowerTrimmed.includes('science:') || lowerTrimmed.includes('rationale:')) {
        currentHabit.scientific_rationale = trimmedLine.replace(/^[-*•]?\s*(scientific rationale|science|rationale):\s*/i, '').trim();
      }
      continue;
    }

    // It's a new top-level habit line
    let cleanLine = trimmedLine
      .replace(/^(\*|-|\d+\.)\s*(\[[ xX]\])?\s*/, '')
      .replace(/^•\s*/, '')
      .trim();

    cleanLine = decodeHtmlEntities(cleanLine);
    if (!cleanLine) continue;

    // Extract points
    let points = 10;
    const pointsRegex = /(?:[-–:]|\b)\s*\(?(\d+)\s*(?:pts?|points?|p)\)?/i;
    const match = cleanLine.match(pointsRegex);

    if (match && match[1]) {
      points = parseInt(match[1], 10);
      cleanLine = cleanLine.replace(match[0], '').trim();
    } else {
      const endNumMatch = cleanLine.match(/[-–:]?\s*(\d+)$/);
      if (endNumMatch && endNumMatch[1]) {
        points = parseInt(endNumMatch[1], 10);
        cleanLine = cleanLine.replace(endNumMatch[0], '').trim();
      }
    }

    cleanLine = cleanLine.replace(/[-–:,]+$/, '').trim();
    if (!cleanLine) continue;

    const category = categorizeName(cleanLine);
    const icon = selectIcon(cleanLine, category);

    currentHabit = {
      id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanLine,
      category,
      points: isNaN(points) || points <= 0 ? 10 : points,
      icon,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
    };

    extractedHabits.push(currentHabit);
  }

  return { habits: extractedHabits };
}

// Backward compatible signature
export function parseGeminiNotebookText(rawText: string): Habit[] {
  return parseGeminiNotebookPayload(rawText).habits;
}

function parseHabitsArray(list: any[]): Habit[] {
  return list.map((item: any, idx: number) => {
    const rawName = decodeHtmlEntities(item.name || item.title || `Habit ${idx + 1}`);
    const category = decodeHtmlEntities(item.category || categorizeName(rawName));
    const points = item.points ? Number(item.points) : 15;
    const icon = item.icon || selectIcon(rawName, category);

    return {
      id: item.id || `h_${Date.now()}_${idx}`,
      name: rawName,
      category,
      points,
      icon,
      frequency: item.frequency || 'daily',
      scheduled_days: item.scheduled_days,
      strict_rule: decodeHtmlEntities(item.strict_rule || item.rule || item.protocol || ''),
      minimum_resilient: decodeHtmlEntities(item.minimum_resilient || item.floor || ''),
      scientific_rationale: decodeHtmlEntities(item.scientific_rationale || item.science || ''),
      createdAt: new Date().toISOString(),
    };
  });
}

function categorizeName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('hypertrophy') || lower.includes('lift')) return 'Physical Hypertrophy';
  if (lower.includes('code') || lower.includes('study') || lower.includes('deep work') || lower.includes('sql')) return 'Technical & Academics';
  if (lower.includes('read') || lower.includes('book') || lower.includes('article')) return 'Knowledge Base';
  if (lower.includes('meditat') || lower.includes('breath') || lower.includes('mind')) return 'Mindset & Focus';
  if (lower.includes('diet') || lower.includes('macro') || lower.includes('protein') || lower.includes('water')) return 'Nutrition & Bulk';
  if (lower.includes('sleep') || lower.includes('wake') || lower.includes('circadian') || lower.includes('bed')) return 'Recovery & Circadian';
  if (lower.includes('phone') || lower.includes('screen') || lower.includes('social media')) return 'Circadian Shield';
  if (lower.includes('clean') || lower.includes('desk') || lower.includes('environment')) return 'Environment Reset';
  if (lower.includes('career') || lower.includes('job') || lower.includes('application') || lower.includes('outreach')) return 'Career Transition';
  if (lower.includes('interview') || lower.includes('mock') || lower.includes('case')) return 'Interview Mastery';
  if (lower.includes('audit') || lower.includes('retrospective') || lower.includes('reflection') || lower.includes('review')) return 'Weekly Retrospective';
  return 'Discipline';
}

function selectIcon(name: string, category: string): string {
  const lower = name.toLowerCase();
  if (category.includes('Recovery') || lower.includes('sleep')) return '🌅';
  if (category.includes('Shield') || lower.includes('phone')) return '📵';
  if (category.includes('Physical') || lower.includes('gym')) return '🏋️';
  if (category.includes('Nutrition') || lower.includes('diet')) return '🥗';
  if (category.includes('Technical') || lower.includes('study')) return '💻';
  if (category.includes('Knowledge') || lower.includes('read')) return '📖';
  if (category.includes('Mindset') || lower.includes('meditat')) return '🧘';
  if (category.includes('Environment') || lower.includes('clean')) return '🧹';
  if (category.includes('Career')) return '🎯';
  if (category.includes('Interview')) return '🎙️';
  if (category.includes('Retrospective')) return '📊';
  return '⚡';
}
