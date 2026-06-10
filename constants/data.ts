// Mood palette + mock/seed data + derived helpers.
// Ported from the design handoff `data.jsx` — the single source of truth for values.
import type { Macros, Meal, Mood, WeekDay } from '../types';

// ── Mood palette ─────────────────────────────────────────────
// NOTE: the dusty-blue mood's id stays `contemplative` (all data references it)
// but it must ALWAYS display as "Bloated".
export const MOODS: Record<string, Mood> = {
  energetic: {
    id: 'energetic', label: 'Energetic', sub: 'excited, flowing',
    color: '#F4E4C1', ink: '#5A4A2A', darkText: true,
  },
  focused: {
    id: 'focused', label: 'Focused', sub: 'content, stable',
    color: '#C9A876', ink: '#4A3A1E', darkText: true,
  },
  calm: {
    id: 'calm', label: 'Calm', sub: 'grounded, peaceful',
    color: '#A8B8A0', ink: '#33402C', darkText: true,
  },
  contemplative: {
    id: 'contemplative', label: 'Bloated', sub: 'heavy, full',
    color: '#7A8FA3', ink: '#FFFFFF', darkText: false,
  },
  sluggish: {
    id: 'sluggish', label: 'Sluggish', sub: 'low energy, anxious',
    color: '#8B4F5C', ink: '#FFFFFF', darkText: false,
  },
};

// Fixed order for pickers: energetic → focused → calm → contemplative(Bloated) → sluggish
export const MOOD_ORDER = ['energetic', 'focused', 'calm', 'contemplative', 'sluggish'];

// Pexels CDN — placeholder/seed food photos (replaced by user captures in production).
const PX = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=240&h=240&fit=crop&dpr=2`;
export const PHOTO = {
  oats: PX(5604832),
  bowl: PX(33103094),
  matcha: PX(32695045),
  salmon: PX(7627415),
};

// ── Mock meals (today) ───────────────────────────────────────
export const MEALS: Meal[] = [
  { id: 'm1', title: 'Oats, berries & honey', time: '8:10 AM', mood: 'energetic', slot: 'meal-oats', img: PHOTO.oats, macros: { protein: 18, carbs: 52, fat: 9 } },
  { id: 'm2', title: 'Roasted grain bowl', time: '12:40 PM', mood: 'focused', slot: 'meal-bowl', img: PHOTO.bowl, macros: { protein: 32, carbs: 48, fat: 16 } },
  { id: 'm3', title: 'Matcha & almonds', time: '3:30 PM', mood: 'calm', slot: 'meal-matcha', img: PHOTO.matcha, macros: { protein: 8, carbs: 14, fat: 18 } },
  { id: 'm4', title: 'Salmon & bitter greens', time: '7:15 PM', mood: 'contemplative', slot: 'meal-salmon', img: PHOTO.salmon, macros: { protein: 38, carbs: 22, fat: 20 } },
];

export const TODAY = 'Tuesday, June 9';

// ── This week's mood journey (Mon → Sun) ─────────────────────
export const WEEK: WeekDay[] = [
  { label: 'M', day: 'Monday', date: 'Monday, June 8', moodId: 'sluggish' },
  { label: 'T', day: 'Tuesday', date: 'Tuesday, June 9', moodId: 'energetic', today: true },
  { label: 'W', day: 'Wednesday', date: 'Wednesday, June 10', moodId: 'focused' },
  { label: 'Th', day: 'Thursday', date: 'Thursday, June 11', moodId: 'calm' },
  { label: 'F', day: 'Friday', date: 'Friday, June 12', moodId: 'energetic' },
  { label: 'Sa', day: 'Saturday', date: 'Saturday, June 13', moodId: 'calm' },
  { label: 'Su', day: 'Sunday', date: 'Sunday, June 14', moodId: 'contemplative' },
];

// Meal templates the per-day builder draws from.
const POOL = [
  { key: 'oats', title: 'Oats, berries & honey', time: '8:10 AM', img: PHOTO.oats, macros: { protein: 18, carbs: 52, fat: 9 } },
  { key: 'bowl', title: 'Roasted grain bowl', time: '12:40 PM', img: PHOTO.bowl, macros: { protein: 32, carbs: 48, fat: 16 } },
  { key: 'matcha', title: 'Matcha & almonds', time: '3:30 PM', img: PHOTO.matcha, macros: { protein: 8, carbs: 14, fat: 18 } },
  { key: 'salmon', title: 'Salmon & bitter greens', time: '7:15 PM', img: PHOTO.salmon, macros: { protein: 38, carbs: 22, fat: 20 } },
];

// Meals logged on a given week-day. Today returns the hand-authored set; other
// days are built so the day's dominant mood matches the spectrum.
export function mealsForDay(dayKey: string): Meal[] {
  const wd = WEEK.find((d) => d.label === dayKey) || WEEK[1];
  if (wd.today) return MEALS;
  const idx = WEEK.indexOf(wd);
  const lunch = POOL[idx % 2 === 0 ? 1 : 2];
  const second = MOOD_ORDER[(MOOD_ORDER.indexOf(wd.moodId) + 2) % MOOD_ORDER.length];
  return [
    { id: `${wd.label}-b`, title: POOL[0].title, time: POOL[0].time, img: POOL[0].img, macros: POOL[0].macros, mood: wd.moodId },
    { id: `${wd.label}-l`, title: lunch.title, time: lunch.time, img: lunch.img, macros: lunch.macros, mood: wd.moodId },
    { id: `${wd.label}-d`, title: POOL[3].title, time: POOL[3].time, img: POOL[3].img, macros: POOL[3].macros, mood: second },
  ];
}

export function macroGrams(m: Macros): number {
  return m.protein + m.carbs + m.fat;
}

// cal = 4·protein + 4·carbs + 9·fat
export function kcalOf(m: Macros): number {
  return Math.round(m.protein * 4 + m.carbs * 4 + m.fat * 9);
}

export function dayTotals(meals: Meal[]): Macros {
  return meals.reduce(
    (a, m) => ({
      protein: a.protein + m.macros.protein,
      carbs: a.carbs + m.macros.carbs,
      fat: a.fat + m.macros.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );
}

// dominant mood = most frequent (ties → first logged). Ignores meals with no mood.
export function dominantMood(meals: Meal[]): string {
  const count: Record<string, number> = {};
  meals.forEach((m) => { if (m.mood) count[m.mood] = (count[m.mood] || 0) + 1; });
  const withMood = meals.map((m) => m.mood).filter((x): x is string => !!x);
  return withMood.sort((a, b) => count[b] - count[a])[0];
}

// hex + alpha → rgba() string
export function hexA(hex: string, a: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Monthly calendar mock ────────────────────────────────────
export const CAL_TODAY = { y: 2026, m: 5, d: 9 }; // June 9, 2026 (month is 0-based)
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// dominant mood for a given calendar day (mock): null when the day is in the future
export function monthDayMood(year: number, month: number, day: number): string | null {
  const today = new Date(CAL_TODAY.y, CAL_TODAY.m, CAL_TODAY.d);
  const date = new Date(year, month, day);
  if (date > today) return null;
  return MOOD_ORDER[(day * 3 + month * 5 + 1) % MOOD_ORDER.length];
}
