// Dominant mood per day (from real logged meals) — powers the week spectrum
// and the monthly calendar. Reactive; refreshed when meals/moods change.
import { useSyncExternalStore } from 'react';
import { subDays, startOfDay } from 'date-fns';
import { listMoodDays } from '../services/meals';

let moodDays: Record<string, string> = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

async function load() {
  try {
    const from = startOfDay(subDays(new Date(), 365)).toISOString();
    const to = new Date().toISOString();
    moodDays = await listMoodDays(from, to);
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
  return useSyncExternalStore(subscribe, () => moodDays);
}
