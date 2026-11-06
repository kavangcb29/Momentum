export interface SponsorAd {
  id: string;
  brand: string;
  badge: string;
  tagline: string;
  description: string;
  cta: string;
  url: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  icon: string;
}

export const LIVE_SPONSOR_ADS: SponsorAd[] = [
  {
    id: 'whoop',
    brand: 'WHOOP 4.0',
    badge: 'Recovery Partner',
    tagline: 'Track Sleep Debt & HRV Recovery',
    description: 'Optimize your 8-hour sleep floor with clinical-grade biometric monitoring.',
    cta: 'Get Free Device',
    url: 'https://www.whoop.com',
    badgeBg: 'bg-rose-500/15 border-rose-500/30',
    badgeText: 'text-rose-600 dark:text-rose-400',
    accentColor: 'from-rose-500/10 via-transparent to-transparent',
    icon: '⚡',
  },
  {
    id: 'ag1',
    brand: 'AG1 Nutrition',
    badge: 'Fuel Sponsor',
    tagline: '75 Vitamins & Clean Micronutrients',
    description: 'Support gut health, immunity, and sustained energy for your Winter Arc.',
    cta: 'Claim Welcome Kit',
    url: 'https://drinkag1.com',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    accentColor: 'from-emerald-500/10 via-transparent to-transparent',
    icon: '🟩',
  },
  {
    id: 'gymshark',
    brand: 'Gymshark',
    badge: 'Training Sponsor',
    tagline: 'Engineered for 4-Day Double Progression',
    description: 'High-performance gym apparel built for heavy compound lifting splits.',
    cta: 'Shop Splits',
    url: 'https://www.gymshark.com',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-600 dark:text-amber-400',
    accentColor: 'from-amber-500/10 via-transparent to-transparent',
    icon: '🔥',
  },
  {
    id: 'myfitnesspal',
    brand: 'MyFitnessPal',
    badge: 'Nutrition & Macros',
    tagline: 'Hit Your 80g Protein Floor Daily',
    description: 'Instant barcode scanning for 14M+ whole foods to lock in clean surplus.',
    cta: 'Track Macros Free',
    url: 'https://www.myfitnesspal.com',
    badgeBg: 'bg-blue-500/15 border-blue-500/30',
    badgeText: 'text-blue-600 dark:text-blue-400',
    accentColor: 'from-blue-500/10 via-transparent to-transparent',
    icon: '📊',
  },
  {
    id: 'audible',
    brand: 'Audible by Amazon',
    badge: 'Deep Work Audio',
    tagline: 'Listen to Atomic Habits & Deep Work',
    description: 'Convert cardio, commutes, and downtime into deliberate learning sprints.',
    cta: 'Try 30 Days Free',
    url: 'https://www.audible.com',
    badgeBg: 'bg-purple-500/15 border-purple-500/30',
    badgeText: 'text-purple-600 dark:text-purple-400',
    accentColor: 'from-purple-500/10 via-transparent to-transparent',
    icon: '🎧',
  },
];
