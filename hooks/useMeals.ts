import type { Meal } from '@/types';

// Placeholder: Meals data hook.
// TODO: load meals from local DB / API.
export function useMeals() {
  const meals: Meal[] = [];
  return { meals, loading: false };
}
