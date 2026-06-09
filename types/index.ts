// Shared TypeScript types for Food Mood.

export type Macros = {
  protein: number;
  carbs: number;
  fat: number;
};

export type Mood = {
  id: string;
  label: string;
  sub: string;
  color: string;
  ink: string; // text color to use on top of `color`
  darkText: boolean; // true => the mood is light, use dark ink
};

export type Meal = {
  id: string;
  title: string;
  time: string;
  mood: string; // mood id
  img: string;
  macros: Macros;
  slot?: string;
};

export type WeekDay = {
  label: string; // M, T, W, Th, F, Sa, Su
  day: string;
  date: string;
  moodId: string;
  today?: boolean;
};

export type JournalLink = { label: string };

export type JournalEntry = {
  id: string;
  ts: number; // created
  updatedAt: number;
  moodId: string | null;
  link: JournalLink | null;
  text: string;
  date: string; // "Tuesday, June 9"
  time: string; // "3:30 PM"
};
