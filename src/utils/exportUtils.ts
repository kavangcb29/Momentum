import type { DayLog, Habit, WinterArcSettings } from '../types';

export function exportToExcelCSV(
  logs: Record<string, DayLog>,
  habits: Habit[],
  settings: WinterArcSettings
): void {
  // Habit ID to Name map
  const habitMap = new Map<string, Habit>();
  habits.forEach((h) => habitMap.set(h.id, h));

  // Sort logs by date ascending
  const sortedDates = Object.keys(logs).sort();

  // If no logs, add today
  if (sortedDates.length === 0) {
    sortedDates.push(new Date().toISOString().split('T')[0]);
  }

  // Build CSV Header
  const headers = [
    'Date',
    'Day',
    'Total Points',
    'Target Points',
    'Completion Rate (%)',
    'Streak Met',
    'Completed Habits',
    'Missed Habits',
    'Memorable Moment / Reflection',
  ];

  const rows: string[][] = [];

  for (const dateStr of sortedDates) {
    const log = logs[dateStr] || {
      date: dateStr,
      completedHabitIds: [],
      totalPoints: 0,
      targetPoints: settings.dailyTargetPoints,
    };

    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const target = log.targetPoints || settings.dailyTargetPoints || 100;
    const rate = Math.min(100, Math.round((log.totalPoints / Math.max(1, target)) * 100));
    const streakMet = log.totalPoints >= target * (settings.streakThresholdPercent / 100) ? 'YES' : 'NO';

    const completedNames = log.completedHabitIds
      .map((id) => habitMap.get(id)?.name || id)
      .join('; ');

    const missedNames = habits
      .filter((h) => !log.completedHabitIds.includes(h.id))
      .map((h) => h.name)
      .join('; ');

    const memory = log.memorableMoment || log.notes || '';

    rows.push([
      dateStr,
      dayName,
      String(log.totalPoints),
      String(target),
      `${rate}%`,
      streakMet,
      completedNames,
      missedNames,
      memory,
    ]);
  }

  // CSV formatting helper with escaping
  const formatCell = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes(';')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Microsoft Excel compatibility
    [
      headers.map(formatCell).join(','),
      ...rows.map((row) => row.map(formatCell).join(',')),
    ].join('\r\n');

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Momentum_WinterArc_Habits_Log_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
