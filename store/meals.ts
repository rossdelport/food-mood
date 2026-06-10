// Today's logged meals, persisted to AsyncStorage. Seeded with the mock day.
import { useSyncExternalStore } from 'react';
import { MEALS } from '../constants/data';
import { loadJSON, saveJSON } from './persist';
import type { Meal } from '../types';

const KEY = 'foodmood:meals';

let meals: Meal[] = [...MEALS];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export async function hydrateMeals() {
  const saved = await loadJSON<Meal[]>(KEY);
  if (saved) meals = saved;
  else saveJSON(KEY, meals);
  emit();
}

export function useMeals(): Meal[] {
  return useSyncExternalStore(subscribe, () => meals);
}

export function getMeals(): Meal[] {
  return meals;
}

// New capture lands at the top of the feed for immediate feedback.
export function addMeal(meal: Meal) {
  meals = [meal, ...meals];
  saveJSON(KEY, meals);
  emit();
}
