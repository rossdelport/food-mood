// Today's meals, backed by Supabase. Reactive via useSyncExternalStore.
import { useSyncExternalStore } from 'react';
import { listTodayMeals } from '../services/meals';
import type { Meal } from '../types';

let meals: Meal[] = [];
let loading = true;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

async function load() {
  try {
    meals = await listTodayMeals();
  } catch {
    // keep whatever we have; offline or not signed in yet
  } finally {
    loading = false;
    emit();
  }
}

export async function hydrateMeals() {
  await load();
}

// Re-fetch from Supabase (after a capture or a mood update).
export async function refreshMeals() {
  await load();
}

export function useMeals(): Meal[] {
  return useSyncExternalStore(subscribe, () => meals);
}

export function useMealsLoading(): boolean {
  return useSyncExternalStore(subscribe, () => loading);
}

export function getMeals(): Meal[] {
  return meals;
}
