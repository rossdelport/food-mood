// Supabase data layer for meals: upload photo, create, list today, update mood.
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { supabase, ensureSession } from './supabase';
import type { Meal, DetectedMeal } from '../types';

const BUCKET = 'meal-photos';

type MealRow = {
  id: string;
  title: string | null;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  photo_path: string | null;
  mood: string | null;
  captured_at: string;
};

// Cache signed URLs by photo path so the same photo keeps the SAME url across
// refetches — otherwise a new token every fetch makes the image reload (and
// flash its spinner) every time a screen refocuses.
const SIGN_TTL = 3600; // seconds the signed url is valid
const REFRESH_BEFORE = 5 * 60 * 1000; // regenerate when < 5 min remain (ms)
const signedCache = new Map<string, { url: string; exp: number }>();

async function signedUrlFor(path: string): Promise<string> {
  const cached = signedCache.get(path);
  if (cached && cached.exp - Date.now() > REFRESH_BEFORE) return cached.url;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGN_TTL);
  const url = data?.signedUrl ?? '';
  if (url) signedCache.set(path, { url, exp: Date.now() + SIGN_TTL * 1000 });
  return url;
}

async function rowToMeal(r: MealRow): Promise<Meal> {
  const img = r.photo_path ? await signedUrlFor(r.photo_path) : '';
  return {
    id: r.id,
    title: r.title ?? 'Logged meal',
    time: format(new Date(r.captured_at), 'h:mm a'),
    mood: r.mood,
    img,
    macros: { protein: r.protein, carbs: r.carbs, fat: r.fat },
    calories: r.calories,
    capturedAt: new Date(r.captured_at).getTime(),
  };
}

async function uploadPhoto(uid: string, uri: string): Promise<string> {
  const path = `${uid}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const arraybuffer = await fetch(uri).then((r) => r.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, arraybuffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

// Create a meal row (mood pending). `capturedAt` back-dates the meal to a past
// day; omit it for "now".
export async function createMeal(params: {
  uri: string;
  detected: DetectedMeal;
  reminderMins: number;
  capturedAt?: Date;
}): Promise<{ id: string; reminderAt: Date }> {
  const uid = await ensureSession();
  if (!uid) throw new Error('Not signed in');
  const photoPath = await uploadPhoto(uid, params.uri);
  const reminderAt = new Date(Date.now() + params.reminderMins * 60000);
  const row: Record<string, unknown> = {
    user_id: uid,
    title: params.detected.title,
    protein: params.detected.protein,
    carbs: params.detected.carbs,
    fat: params.detected.fat,
    calories: params.detected.calories,
    photo_path: photoPath,
    reminder_at: reminderAt.toISOString(),
  };
  if (params.capturedAt) row.captured_at = params.capturedAt.toISOString();
  const { data, error } = await supabase.from('meals').insert(row).select('id').single();
  if (error) throw error;
  return { id: data.id as string, reminderAt };
}

export async function listTodayMeals(): Promise<Meal[]> {
  await ensureSession();
  const start = startOfDay(new Date()).toISOString();
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .gte('captured_at', start)
    .order('captured_at', { ascending: true });
  if (error) throw error;
  return Promise.all((data ?? []).map(rowToMeal));
}

// Meals logged on a specific local day (yyyy-MM-dd), oldest first.
export async function listMealsForDate(dateKey: string): Promise<Meal[]> {
  await ensureSession();
  const d = parseISO(dateKey);
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .gte('captured_at', startOfDay(d).toISOString())
    .lte('captured_at', endOfDay(d).toISOString())
    .order('captured_at', { ascending: true });
  if (error) throw error;
  return Promise.all((data ?? []).map(rowToMeal));
}

export type DayStats = {
  moodByDay: Record<string, string>; // day -> dominant logged mood id
  mealDays: Record<string, true>; // days that have any logged meal
};

// Aggregate meals per local day across a range, for the spectrum + calendar.
export async function listDayStats(fromISO: string, toISO: string): Promise<DayStats> {
  await ensureSession();
  const { data, error } = await supabase
    .from('meals')
    .select('mood, captured_at')
    .gte('captured_at', fromISO)
    .lte('captured_at', toISO);
  if (error) return { moodByDay: {}, mealDays: {} };
  const counts: Record<string, Record<string, number>> = {};
  const lastAt: Record<string, Record<string, number>> = {};
  const mealDays: Record<string, true> = {};
  for (const r of data ?? []) {
    const ts = new Date(r.captured_at).getTime();
    const key = format(ts, 'yyyy-MM-dd');
    mealDays[key] = true;
    if (r.mood) {
      (counts[key] ??= {})[r.mood] = (counts[key][r.mood] || 0) + 1;
      (lastAt[key] ??= {})[r.mood] = Math.max(lastAt[key][r.mood] ?? 0, ts);
    }
  }
  const moodByDay: Record<string, string> = {};
  for (const [key, c] of Object.entries(counts)) {
    // most frequent; ties break toward the most recently logged mood
    moodByDay[key] = Object.keys(c).sort((a, b) => c[b] - c[a] || lastAt[key][b] - lastAt[key][a])[0];
  }
  return { moodByDay, mealDays };
}

export async function getMealById(id: string): Promise<Meal | null> {
  await ensureSession();
  const { data, error } = await supabase.from('meals').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToMeal(data);
}

export async function updateMeal(
  id: string,
  fields: Partial<{ title: string; protein: number; carbs: number; fat: number; calories: number }>,
): Promise<void> {
  await ensureSession();
  const { error } = await supabase.from('meals').update(fields).eq('id', id);
  if (error) throw error;
}

export async function deleteMeal(id: string): Promise<void> {
  await ensureSession();
  const { data } = await supabase.from('meals').select('photo_path').eq('id', id).maybeSingle();
  if (data?.photo_path) {
    signedCache.delete(data.photo_path);
    try { await supabase.storage.from(BUCKET).remove([data.photo_path]); } catch { /* best-effort */ }
  }
  const { error } = await supabase.from('meals').delete().eq('id', id);
  if (error) throw error;
}

export async function setMealMood(id: string, mood: string): Promise<void> {
  await ensureSession();
  const { error } = await supabase
    .from('meals')
    .update({ mood, mood_logged_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
