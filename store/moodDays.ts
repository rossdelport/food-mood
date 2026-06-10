// Per-day aggregates from real logged meals — powers the week spectrum and the
// monthly calendar. Holds both the dominant mood per day and which days have
// any meal logged. Reactive; refreshed when meals/moods change.
import { useSyncExternalStore } from 'react';
import { subDays, startOfDay } from 'date-fns';
import { listDayStats, type DayStats } from '../services/meals';

let stats: DayStats = { moodByDay: {}, mealDays: {} };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

async function load() {
  try {
    const from = startOfDay(subDays(new Date(), 365)).toISOString();
    const to = new Date().toISOString();
    stats = await listDayStats(from, to);
  } catch {
    // keep what we have
  }
  emit();
}

export async function hydrateMoodDays() {
  await load();
}

export async function refreshMoodDays() {
  await load();
}

export function useMoodDays(): Record<string, string> {
  return useSyncExternalStore(subscribe, () => stats.moodByDay);
}

export function useMealDays(): Record<string, true> {
  return useSyncExternalStore(subscribe, () => stats.mealDays);
}
