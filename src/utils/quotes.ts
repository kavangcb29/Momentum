export interface Quote {
  text: string;
  author: string;
  tag: string;
}

export const QUOTES: Quote[] = [
  {
    text: "We don't rise to the level of our expectations, we fall to the level of our training.",
    author: "Archilochus",
    tag: "Discipline",
  },
  {
    text: "You do not decide your future. You decide your habits, and your habits decide your future.",
    author: "F.M. Alexander",
    tag: "Habits",
  },
  {
    text: "No man is free who is not master of himself.",
    author: "Epictetus",
    tag: "Stoicism",
  },
  {
    text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    author: "John C. Maxwell",
    tag: "Consistency",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
    tag: "Resilience",
  },
  {
    text: "First forget inspiration. Habit is more dependable. Habit will sustain you whether you're inspired or not.",
    author: "Octavia Butler",
    tag: "Execution",
  },
  {
    text: "Discipline equals freedom.",
    author: "Jocko Willink",
    tag: "Focus",
  },
  {
    text: "Every action you take is a vote for the type of person you wish to become.",
    author: "James Clear",
    tag: "Identity",
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    tag: "Purpose",
  },
  {
    text: "Excellence is not an act, but a habit.",
    author: "Will Durant",
    tag: "Standards",
  },
];

export function getDailyQuote(dateStr?: string): Quote {
  const d = dateStr ? new Date(dateStr) : new Date();
  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  return QUOTES[Math.abs(dayOfYear) % QUOTES.length];
}
