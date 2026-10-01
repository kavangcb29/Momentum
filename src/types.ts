export interface Habit {
  id: string;
  name: string;
  category: string;
  points: number;
  icon?: string;
  frequency?: 'daily' | 'weekly' | '4_times_per_week' | string;
  scheduled_days?: string[]; // e.g. ["Mon", "Tue", "Thu", "Fri"]
  strict_rule?: string;
  minimum_resilient?: string;
  scientific_rationale?: string;
  description?: string;
  createdAt: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  completedHabitIds: string[];
  totalPoints: number;
  targetPoints: number;
  memorableMoment?: string;
  highlight?: string;
  notes?: string;
}

export interface WinterArcSettings {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dailyTargetPoints: number;
  streakThresholdPercent: number; // e.g. 70% to maintain streak
  userName: string;
  theme: 'slate' | 'oled' | 'cyber';
}
