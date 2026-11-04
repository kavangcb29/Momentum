import type { Habit, DayLog, WinterArcSettings } from '../types';

const HABITS_KEY = 'momentum_habits_v5';
const LOGS_KEY = 'momentum_logs_v1';
const SETTINGS_KEY = 'momentum_settings_v2';

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'h1_digital_sunset',
    name: '11:00 PM Digital Sunset & 8-Hour Sleep Floor',
    category: 'Circadian Shield & Sleep Recovery',
    points: 1,
    icon: '🦩',
    color: '#FF99C8',
    frequency: 'daily',
    strict_rule: 'Screens off strictly at 11:00 PM. Sleep >= 8.0 hours nightly and wake up before 8:00 AM without snooze.',
    minimum_resilient: 'Bedtime alarm set for 11:15 PM even if total sleep duration is slightly shortened.',
    scientific_rationale: 'Protects REM and slow-wave sleep architecture required for muscle tissue repair, protein synthesis, and cognitive memory consolidation.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h2_gym_split',
    name: '4-Day Gym Split + Double Progression',
    category: 'Physical Hypertrophy & Strength',
    points: 1,
    icon: '🔥',
    color: '#FF9233',
    frequency: '4_times_per_week',
    scheduled_days: ['Mon', 'Tue', 'Thu', 'Fri'],
    strict_rule: `Train 4x/week (Mon, Tue, Thu, Fri) on an Upper/Lower split with 4 sets per exercise. Hold weight static across all 4 sets until hitting 12 clean reps on EVERY set before raising load (+2.5–5 lbs).
• Mon: Upper A (Bench Press, Incline DB Press, Overhead Press, Dips)
• Tue: Lower A (Squats, RDLs, Leg Press, Calf Raises)
• Wed: Active Recovery (10,000 steps + mobility stretching)
• Thu: Upper B (Lat Pulldowns, Bent Rows, Lateral Raises, Bicep Curls)
• Fri: Lower B (Bulgarian Split Squats, Hamstring Curls, Lunges, Abs)
• Sat & Sun: Active Recovery / Rest`,
    minimum_resilient: '10-minute bodyweight circuit or active mobility flow.',
    scientific_rationale: 'Drives mechanical tension and myofibrillar hypertrophy while providing structured rest days to allow complete central nervous system and joint recovery.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h3_clean_bulk',
    name: 'Clean Bulk & 80g Protein Floor',
    category: 'Nutrition & Fuel',
    points: 1,
    icon: '🟩',
    color: '#A3FFB4',
    frequency: 'daily',
    strict_rule: 'Hit ~2,600 kcal/day clean surplus and >= 80g protein floor daily across clean whole-food meals.',
    minimum_resilient: 'Hit 80g protein floor across Meals 1 & 2 even if total calories fluctuate.',
    scientific_rationale: 'Delivers necessary amino acids and intramuscular glycogen hydration to support muscle growth without causing digestive bloating during cognitive work.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h4_study_sprint',
    name: '90-Minute Daily Study Sprint',
    category: 'Technical Skill & Academics',
    points: 1,
    icon: '🌊',
    color: '#90E0EF',
    frequency: 'daily',
    strict_rule: `Execute 90 minutes of deep work daily, split into three 30-minute blocks:
• 30m SQL: Practice window functions (PARTITION BY, LAG, LEAD, DENSE_RANK)
• 30m BA Portfolio: Process maps (Lucidchart), BRD user stories, or Power BI
• 30m Coursework: Computer Science assignments, lecture prep, or exam review`,
    minimum_resilient: '15 minutes reviewing SQL query syntax, project scope, or lecture slides.',
    scientific_rationale: 'Builds technical career capital through daily deliberate practice and strengthens neural pathways for complex analytical problem-solving.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h5_career_points',
    name: 'Daily Career Points System (3 Pts — Strict Model A)',
    category: 'Career Transition & Pipeline',
    points: 3,
    icon: '🎯',
    color: '#FF70A6',
    frequency: 'daily',
    strict_rule: `Earn >= 3 Career Points every single day. Points reset to 0 at midnight. NO BANKING / NO ROLL-OVERS.
• 1 Tailored Application (Customized Resume/Cover) = 2 Points
• 1 Networking / Referral LinkedIn Message = 1 Point
• 1 Quick-Apply Application = 1 Point`,
    minimum_resilient: 'Send 1 personalized networking/referral message on LinkedIn.',
    scientific_rationale: 'Ensures persistent daily action and pipeline volume during competitive recruitment cycles without burnout.',
    createdAt: new Date().toISOString(),
  },
];

// Target points: 7 points daily (1 + 1 + 1 + 1 + 3 = 7 pts total)
export const DEFAULT_SETTINGS: WinterArcSettings = {
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dailyTargetPoints: 7,
  streakThresholdPercent: 70, // 70% (>= 5 pts) maintains streak
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
  if (todayLog && (todayLog.totalPoints >= threshold || todayLog.isRestDay)) {
    streak++;
  }

  while (true) {
    checkDate.setDate(checkDate.getDate() - 1);
    const dateStr = checkDate.toISOString().split('T')[0];
    const log = logs[dateStr];

    if (log && (log.totalPoints >= threshold || log.isRestDay)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
