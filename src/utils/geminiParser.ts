import type { Habit } from '../types';

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

export function parseGeminiNotebookText(rawText: string): Habit[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  // 1. Check if the text is JSON (Array of habits)
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      
      return list.map((item: any, idx: number) => {
        const rawName = decodeHtmlEntities(item.name || item.title || `Habit ${idx + 1}`);
        const category = decodeHtmlEntities(item.category || 'Discipline');
        
        // Auto assign points based on category/importance if not explicitly provided
        let points = item.points ? Number(item.points) : 15;
        if (!item.points) {
          if (item.id === 'h5_gym' || item.id === 'h7_study' || item.id === 'h6_diet') points = 20;
          else if (item.id === 'h1_sleep' || item.id === 'h9_career') points = 15;
          else if (item.id === 'h10_mock' || item.id === 'h11_audit') points = 25;
          else points = 10;
        }

        // Auto select icon
        let icon = item.icon || '⚡';
        const lowerName = rawName.toLowerCase();
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes('circadian') || lowerName.includes('sleep') || lowerName.includes('wake')) icon = '🌅';
        else if (lowerCat.includes('shield') || lowerName.includes('phone')) icon = '📵';
        else if (lowerCat.includes('mind') || lowerName.includes('meditat')) icon = '🧘';
        else if (lowerCat.includes('environment') || lowerName.includes('clean')) icon = '🧹';
        else if (lowerCat.includes('hypertrophy') || lowerName.includes('gym')) icon = '🏋️';
        else if (lowerCat.includes('nutrition') || lowerName.includes('diet') || lowerName.includes('macro')) icon = '🥗';
        else if (lowerCat.includes('academic') || lowerName.includes('study') || lowerName.includes('deep work')) icon = '💻';
        else if (lowerCat.includes('knowledge') || lowerName.includes('read')) icon = '📖';
        else if (lowerCat.includes('career') || lowerName.includes('outreach')) icon = '🎯';
        else if (lowerCat.includes('interview') || lowerName.includes('mock')) icon = '🎙️';
        else if (lowerCat.includes('audit') || lowerName.includes('retrospective') || lowerName.includes('reflection')) icon = '📊';

        return {
          id: item.id || `h_${Date.now()}_${idx}`,
          name: rawName,
          category,
          points,
          icon,
          frequency: item.frequency || 'daily',
          scheduled_days: item.scheduled_days,
          strict_rule: decodeHtmlEntities(item.strict_rule || ''),
          minimum_resilient: decodeHtmlEntities(item.minimum_resilient || ''),
          scientific_rationale: decodeHtmlEntities(item.scientific_rationale || ''),
          createdAt: new Date().toISOString(),
        };
      });
    } catch {
      // Fallback to line parser if JSON parsing fails
    }
  }

  // 2. Line by line text / Markdown parser
  const lines = trimmed.split('\n');
  const extractedHabits: Habit[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('---')) continue;

    // Clean markdown checkboxes like - [ ] or * [ ] or 1.
    let cleanLine = trimmedLine
      .replace(/^(\*|-|\d+\.)\s*(\[[ xX]\])?\s*/, '')
      .replace(/^•\s*/, '')
      .trim();

    cleanLine = decodeHtmlEntities(cleanLine);
    if (!cleanLine) continue;

    // Extract points like (20 pts), (20 points), [15p], : 10 pts, - 25 pts, or 20p
    let points = 10; // Default
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

    let category = 'Discipline';
    const lower = cleanLine.toLowerCase();
    if (lower.includes('gym') || lower.includes('workout') || lower.includes('hypertrophy')) category = 'Physical Hypertrophy';
    else if (lower.includes('code') || lower.includes('study') || lower.includes('deep work')) category = 'Technical & Academics';
    else if (lower.includes('read') || lower.includes('book')) category = 'Knowledge Base';
    else if (lower.includes('meditat') || lower.includes('breathing')) category = 'Mindset & Focus';
    else if (lower.includes('diet') || lower.includes('macro') || lower.includes('protein')) category = 'Nutrition & Bulk';
    else if (lower.includes('sleep') || lower.includes('wake') || lower.includes('circadian')) category = 'Recovery & Circadian';
    else if (lower.includes('phone') || lower.includes('screen')) category = 'Circadian Shield';
    else if (lower.includes('clean') || lower.includes('desk') || lower.includes('environment')) category = 'Environment Reset';
    else if (lower.includes('career') || lower.includes('job') || lower.includes('application')) category = 'Career Transition';
    else if (lower.includes('interview') || lower.includes('mock')) category = 'Interview Mastery';
    else if (lower.includes('audit') || lower.includes('retrospective')) category = 'Weekly Retrospective';

    let icon = '⚡';
    if (category.includes('Recovery') || lower.includes('sleep')) icon = '🌅';
    else if (category.includes('Shield') || lower.includes('phone')) icon = '📵';
    else if (category.includes('Physical') || lower.includes('gym')) icon = '🏋️';
    else if (category.includes('Nutrition') || lower.includes('diet')) icon = '🥗';
    else if (category.includes('Technical') || lower.includes('study')) icon = '💻';
    else if (category.includes('Knowledge') || lower.includes('read')) icon = '📖';
    else if (category.includes('Mindset') || lower.includes('meditat')) icon = '🧘';
    else if (category.includes('Environment') || lower.includes('clean')) icon = '🧹';
    else if (category.includes('Career')) icon = '🎯';
    else if (category.includes('Interview')) icon = '🎙️';
    else if (category.includes('Retrospective')) icon = '📊';

    extractedHabits.push({
      id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanLine,
      category,
      points: isNaN(points) || points <= 0 ? 10 : points,
      icon,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
    });
  }

  return extractedHabits;
}
