// Mood palette + macro helpers. (Meal/week/calendar data now comes from Supabase.)
import type { Macros, Meal, Mood } from '../types';

// ── Mood palette ─────────────────────────────────────────────
// NOTE: the dusty-blue mood's id stays `contemplative` (all data references it)
// but it must ALWAYS display as "Bloated".
export const MOODS: Record<string, Mood> = {
  energetic: { id: 'energetic', label: 'Energetic', sub: 'excited, flowing', color: '#F4E4C1', ink: '#5A4A2A', darkText: true },
  focused: { id: 'focused', label: 'Focused', sub: 'content, stable', color: '#C9A876', ink: '#4A3A1E', darkText: true },
  calm: { id: 'calm', label: 'Calm', sub: 'grounded, peaceful', color: '#A8B8A0', ink: '#33402C', darkText: true },
  contemplative: { id: 'contemplative', label: 'Bloated', sub: 'heavy, full', color: '#7A8FA3', ink: '#FFFFFF', darkText: false },
  sluggish: { id: 'sluggish', label: 'Sluggish', sub: 'low energy, anxious', color: '#8B4F5C', ink: '#FFFFFF', darkText: false },
};

// Fixed order for pickers: energetic → focused → calm → contemplative(Bloated) → sluggish
export const MOOD_ORDER = ['energetic', 'focused', 'calm', 'contemplative', 'sluggish'];

// ── Macro helpers ────────────────────────────────────────────
export function macroGrams(m: Macros): number {
  return m.protein + m.carbs + m.fat;
}

// cal = 4·protein + 4·carbs + 9·fat (fallback when no stored calorie value)
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
