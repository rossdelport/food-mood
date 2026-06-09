import type { Mood } from '@/types';

// Placeholder: Moods data hook.
// TODO: load mood entries from local DB / API.
export function useMoods() {
  const moods: Mood[] = [];
  return { moods, loading: false };
}
