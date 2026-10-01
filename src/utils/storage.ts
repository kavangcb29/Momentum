import type { Habit, DayLog, WinterArcSettings } from '../types';

const HABITS_KEY = 'momentum_habits_v2';
const LOGS_KEY = 'momentum_logs_v1';
const SETTINGS_KEY = 'momentum_settings_v1';

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'h1_sleep',
    name: 'Rise < 8:00 AM & 8h Sleep',
    category: 'Recovery & Circadian',
    points: 15,
    icon: '🌅',
    frequency: 'daily',
    strict_rule: 'Sleep >= 8.0 hours and wake up before 8:00 AM without pressing snooze.',
    minimum_resilient: 'Consistent bedtime alarm set even if sleep duration is slightly shortened.',
    scientific_rationale: 'Protects REM and deep sleep architecture necessary for muscle protein synthesis and memory consolidation.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h2_nophone',
    name: 'No Phone After 11:00 PM',
    category: 'Circadian Shield',
    points: 10,
    icon: '📵',
    frequency: 'daily',
    strict_rule: "Turn off all mobile screens and put phone out of arm's reach strictly by 11:00 PM.",
    minimum_resilient: 'Phone placed across the room by 11:00 PM even if reading paper books in bed.',
    scientific_rationale: 'Prevents blue light screen exposure from suppressing melatonin secretion.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h3_meditate',
    name: '5-Min Daily Meditation',
    category: 'Mindset & Focus',
    points: 10,
    icon: '🧘',
    frequency: 'daily',
    strict_rule: 'Complete 5 minutes of uninterrupted morning breathwork or mindfulness.',
    minimum_resilient: '1 minute of deep box-breathing (4s in, 4s hold, 4s out, 4s hold).',
    scientific_rationale: 'Calms sympathetic nervous system arousal and builds attentional control for study blocks.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h4_clean',
    name: 'Daily Environment Clean',
    category: 'Environment Reset',
    points: 10,
    icon: '🧹',
    frequency: 'daily',
    strict_rule: 'Spend 10-15 minutes tidying workspace, clearing desk, and resetting environment.',
    minimum_resilient: 'Clear desk surface completely before closing workspace for the night.',
    scientific_rationale: 'Eliminates visual clutter to reduce baseline cognitive overhead.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h5_gym',
    name: 'Gym & Double Progression',
    category: 'Physical Hypertrophy',
    points: 20,
    icon: '🏋️',
    frequency: '4_times_per_week',
    scheduled_days: ['Mon', 'Tue', 'Thu', 'Fri'],
    strict_rule: 'Train 4-day Upper/Lower split with 4 sets per exercise. Hold weight static until top rep limit is hit across ALL 4 sets before adding load.',
    minimum_resilient: '10-minute bodyweight circuit or active mobility flow.',
    scientific_rationale: 'Drives mechanical tension and myofibrillar hypertrophy while allowing central nervous system recovery.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h6_diet',
    name: 'Macro & Diet Auto-Sync',
    category: 'Nutrition & Bulk',
    points: 20,
    icon: '🥗',
    frequency: 'daily',
    strict_rule: 'Hit 2,516–2,600 kcal/day clean surplus and >= 130g protein floor.',
    minimum_resilient: 'Hit protein floor (130g) at breakfast/lunch even if calorie totals fluctuate.',
    scientific_rationale: 'Fuels muscle tissue growth and maintains intramuscular glycogen hydration without digestive bloating.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h7_study',
    name: '90-Min Daily Study Sprint',
    category: 'Technical & Academics',
    points: 20,
    icon: '💻',
    frequency: 'daily',
    strict_rule: 'Execute 90 minutes of deep work: coursework, SQL window functions, or BA portfolio projects.',
    minimum_resilient: '15 minutes reviewing lecture notes, syllabus, or SQL syntax.',
    scientific_rationale: 'Compounds technical career capital through daily focused deliberate practice.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h8_reading',
    name: '15–30m Tech Reading',
    category: 'Knowledge Base',
    points: 10,
    icon: '📖',
    frequency: 'daily',
    strict_rule: 'Read 15-30 minutes of PM teardowns, BA case studies, or systems architecture.',
    minimum_resilient: 'Read exactly 1 page of technical or self-growth material.',
    scientific_rationale: 'Trains linear attention models to combat short-form digital media fragmentation.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h9_career',
    name: 'Daily Career Points (3 Pts)',
    category: 'Career Transition',
    points: 15,
    icon: '🎯',
    frequency: 'daily',
    strict_rule: 'Earn >= 3 Career Points daily (1 Tailored App = 2pts, Outreach = 1pt, Quick App = 1pt). NO ROLL-OVERS / NO BANKING.',
    minimum_resilient: 'Send 1 personalized networking/referral message on LinkedIn.',
    scientific_rationale: 'Ensures consistent daily pipeline activity during recruitment cycles.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h10_mock',
    name: 'Weekly Mock Interview',
    category: 'Interview Mastery',
    points: 25,
    icon: '🎙️',
    frequency: 'weekly',
    strict_rule: 'Complete 1-2 mock interviews weekly practicing CIRCLES framework or SQL case studies.',
    minimum_resilient: 'Verbally outline 1 CIRCLES product framework question out loud.',
    scientific_rationale: 'Builds verbal fluency under clock pressure for case interviews.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h11_audit',
    name: 'Sunday Reflection & Audit',
    category: 'Weekly Retrospective',
    points: 20,
    icon: '📊',
    frequency: 'weekly',
    scheduled_days: ['Sun'],
    strict_rule: 'Conduct 10-minute Sunday audit of logs, set/rep progression sheets, and upcoming strategy.',
    minimum_resilient: 'Write a 1-sentence summary of weekly performance.',
    scientific_rationale: 'Decouples subjective emotion from objective performance data.',
    createdAt: new Date().toISOString(),
  },
];

// Calculate target points from default habits that are active today
export const DEFAULT_SETTINGS: WinterArcSettings = {
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dailyTargetPoints: 120,
  streakThresholdPercent: 70, // 70% of daily target completes a streak day
  userName: 'Arc Warrior',
  theme: 'slate',
};

export function getHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) {
      saveHabits(DEFAULT_HABITS);
      return DEFAULT_HABITS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_HABITS;
  }
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getLogs(): Record<string, DayLog> {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDayLog(log: DayLog): void {
  const logs = getLogs();
  logs[log.date] = log;
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getSettings(): WinterArcSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: WinterArcSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Format Date as YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate Current Streak
export function calculateStreak(logs: Record<string, DayLog>, targetPoints: number, thresholdPercent: number): number {
  let streak = 0;
  const today = new Date();
  
  let checkDate = new Date(today);
  const threshold = targetPoints * (thresholdPercent / 100);

  const todayStr = checkDate.toISOString().split('T')[0];
  const todayLog = logs[todayStr];
  if (todayLog && todayLog.totalPoints >= threshold) {
    streak++;
  }

  while (true) {
    checkDate.setDate(checkDate.getDate() - 1);
    const dateStr = checkDate.toISOString().split('T')[0];
    const log = logs[dateStr];

    if (log && log.totalPoints >= threshold) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
