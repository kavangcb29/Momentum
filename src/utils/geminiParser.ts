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

// Regex to extract starting emoji
const EMOJI_REGEX = /^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|\p{Extended_Pictographic})/u;

export interface ParseResult {
  habits: Habit[];
  logs?: Record<string, DayLog>;
}

export function parseGeminiNotebookPayload(rawText: string): ParseResult {
  const trimmed = rawText.trim();
  if (!trimmed) return { habits: [] };

  // 1. JSON Parser
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.habits || parsed.rules)) {
        const rawHabits = parsed.habits || parsed.rules || [];
        const rawLogs = parsed.logs || {};

        const habits = Array.isArray(rawHabits) ? parseHabitsArray(rawHabits) : [];
        const logs: Record<string, DayLog> = {};

        if (typeof rawLogs === 'object') {
          Object.entries(rawLogs).forEach(([dateStr, logData]: [string, any]) => {
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              logs[dateStr] = {
                date: dateStr,
                completedHabitIds: Array.isArray(logData.completedHabitIds || logData.completed)
                  ? (logData.completedHabitIds || logData.completed)
                  : [],
                totalPoints: Number(logData.totalPoints || logData.points) || 0,
                targetPoints: Number(logData.targetPoints) || 100,
                memorableMoment: logData.memorableMoment || logData.notes || logData.reflection || '',
                isRestDay: Boolean(logData.isRestDay),
              };
            }
          });
        }

        return { habits, logs: Object.keys(logs).length > 0 ? logs : undefined };
      }

      const list = Array.isArray(parsed) ? parsed : [parsed];
      return { habits: parseHabitsArray(list) };
    } catch {
      // Fall through to markdown parser
    }
  }

  // 2. Advanced Markdown Parser (handles both `### 1. 🦩 Name` and `- [ ] Name`)
  const lines = trimmed.split('\n');
  const extractedHabits: Habit[] = [];
  let currentHabit: Habit | null = null;
  let currentSubSection: 'strict' | 'resilient' | 'science' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();
    if (!trimmedLine || trimmedLine === '---') continue;

    // Check if line is a Header Habit (e.g. `### 1. 🦩 11:00 PM Digital Sunset & 8-Hour Sleep Floor`)
    const headerMatch = trimmedLine.match(/^#{1,4}\s+(?:\d+[.)]\s*)?(.*)/);
    // Check if line is a standard checklist habit (e.g. `- [ ] 1. 🦩 ...`)
    const checklistMatch = trimmedLine.match(/^[-*•]\s*(?:\[[ xX]\]\s*)?(?:\d+[.)]\s*)?(.*)/);

    const isSubBullet =
      rawLine.startsWith('  ') ||
      rawLine.startsWith('\t') ||
      trimmedLine.match(/^[-*•]\s*\*\*(Hex Color|Strict Rule|Minimum Resilient|Scientific Rationale|Split Schedule|Point Values)/i);

    // If it's a sub-property under the current habit:
    if (currentHabit && isSubBullet) {
      const cleanSub = trimmedLine.replace(/^[-*•]\s*/, '').trim();

      // Hex Color
      const colorMatch = cleanSub.match(/\*\*Hex Color:\*\*\s*(#[A-Fa-f0-9]{3,8})/i);
      if (colorMatch) {
        currentHabit.color = colorMatch[1];
        continue;
      }

      // Strict Rule
      const strictMatch = cleanSub.match(/\*\*(?:Strict Rule|Protocol):\*\*\s*(.*)/i);
      if (strictMatch) {
        currentHabit.strict_rule = strictMatch[1].trim();
        currentSubSection = 'strict';
        continue;
      }

      // Minimum Resilient
      const resilientMatch = cleanSub.match(/\*\*(?:Minimum Resilient|Resilient Floor|Floor):\*\*\s*(.*)/i);
      if (resilientMatch) {
        currentHabit.minimum_resilient = resilientMatch[1].trim();
        currentSubSection = 'resilient';
        continue;
      }

      // Scientific Rationale
      const scienceMatch = cleanSub.match(/\*\*(?:Scientific Rationale|Science|Rationale):\*\*\s*(.*)/i);
      if (scienceMatch) {
        currentHabit.scientific_rationale = scienceMatch[1].trim();
        currentSubSection = 'science';
        continue;
      }

      // Additional indented detail (like Split Schedule)
      if (currentSubSection === 'strict' && currentHabit.strict_rule) {
        currentHabit.strict_rule += `\n${cleanSub}`;
        continue;
      }
      continue;
    }

    // Check if this line starts a new habit definition
    let candidateName = '';
    if (headerMatch && !headerMatch[1].toLowerCase().includes('winter arc') && !headerMatch[1].toLowerCase().includes('core non-negotiable')) {
      candidateName = headerMatch[1].trim();
    } else if (checklistMatch && !checklistMatch[1].match(/^\*\*(Hex Color|Strict Rule|Minimum Resilient|Scientific Rationale)/i)) {
      candidateName = checklistMatch[1].trim();
    }

    if (candidateName) {
      candidateName = decodeHtmlEntities(candidateName);

      // Extract emoji
      let icon = '⚡';
      const emojiMatch = candidateName.match(EMOJI_REGEX);
      if (emojiMatch) {
        icon = emojiMatch[0];
        candidateName = candidateName.replace(icon, '').trim();
      }

      // Extract points if present (e.g., `(20 pts)`, `(3 Pts)`, etc.)
      let points = 20; // Default 20 pts per core habit
      const pointsRegex = /(?:[-–:]|\b)\s*\(?(\d+)\s*(?:pts?|points?|p)\)?/i;
      const match = candidateName.match(pointsRegex);

      if (match && match[1]) {
        points = parseInt(match[1], 10);
        candidateName = candidateName.replace(match[0], '').trim();
      }

      candidateName = candidateName.replace(/^[-–:.\s]+/, '').replace(/[-–:,.\s]+$/, '').trim();
      if (!candidateName) continue;

      const category = categorizeName(candidateName);
      if (icon === '⚡') {
        icon = selectIcon(candidateName, category);
      }

      currentHabit = {
        id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: candidateName,
        category,
        points: isNaN(points) || points <= 0 ? 20 : points,
        icon,
        frequency: candidateName.toLowerCase().includes('gym') ? '4_times_per_week' : 'daily',
        scheduled_days: candidateName.toLowerCase().includes('gym') ? ['Mon', 'Tue', 'Thu', 'Fri'] : undefined,
        createdAt: new Date().toISOString(),
      };

      currentSubSection = null;
      extractedHabits.push(currentHabit);
    }
  }

  return { habits: extractedHabits };
}

export function parseGeminiNotebookText(rawText: string): Habit[] {
  return parseGeminiNotebookPayload(rawText).habits;
}

function parseHabitsArray(list: any[]): Habit[] {
  return list.map((item: any, idx: number) => {
    const rawName = decodeHtmlEntities(item.name || item.title || `Habit ${idx + 1}`);
    const category = decodeHtmlEntities(item.category || categorizeName(rawName));
    const points = item.points ? Number(item.points) : 20;
    const icon = item.icon || selectIcon(rawName, category);

    return {
      id: item.id || `h_${Date.now()}_${idx}`,
      name: rawName,
      category,
      points,
      icon,
      color: item.color || item.hexColor,
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
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('hypertrophy') || lower.includes('lift') || lower.includes('split')) return 'Physical Hypertrophy';
  if (lower.includes('code') || lower.includes('study') || lower.includes('deep work') || lower.includes('sql') || lower.includes('sprint')) return 'Technical & Academics';
  if (lower.includes('read') || lower.includes('book') || lower.includes('article')) return 'Knowledge Base';
  if (lower.includes('meditat') || lower.includes('breath') || lower.includes('mind')) return 'Mindset & Focus';
  if (lower.includes('diet') || lower.includes('macro') || lower.includes('protein') || lower.includes('bulk') || lower.includes('meal')) return 'Nutrition & Bulk';
  if (lower.includes('sleep') || lower.includes('wake') || lower.includes('circadian') || lower.includes('bed') || lower.includes('sunset')) return 'Recovery & Circadian';
  if (lower.includes('phone') || lower.includes('screen') || lower.includes('social media') || lower.includes('digital')) return 'Circadian Shield';
  if (lower.includes('clean') || lower.includes('desk') || lower.includes('environment')) return 'Environment Reset';
  if (lower.includes('career') || lower.includes('job') || lower.includes('application') || lower.includes('outreach') || lower.includes('points')) return 'Career Transition';
  if (lower.includes('interview') || lower.includes('mock') || lower.includes('case')) return 'Interview Mastery';
  if (lower.includes('audit') || lower.includes('retrospective') || lower.includes('reflection') || lower.includes('review')) return 'Weekly Retrospective';
  return 'Discipline';
}

function selectIcon(name: string, category: string): string {
  const lower = name.toLowerCase();
  if (category.includes('Recovery') || lower.includes('sleep') || lower.includes('sunset')) return '🦩';
  if (category.includes('Shield') || lower.includes('phone')) return '📵';
  if (category.includes('Physical') || lower.includes('gym')) return '🔥';
  if (category.includes('Nutrition') || lower.includes('protein') || lower.includes('bulk')) return '🟩';
  if (category.includes('Technical') || lower.includes('study') || lower.includes('sprint')) return '🌊';
  if (category.includes('Knowledge') || lower.includes('read')) return '📖';
  if (category.includes('Mindset') || lower.includes('meditat')) return '🧘';
  if (category.includes('Environment') || lower.includes('clean')) return '🧹';
  if (category.includes('Career') || lower.includes('points')) return '🎯';
  if (category.includes('Interview')) return '🎙️';
  if (category.includes('Retrospective')) return '📊';
  return '⚡';
}
