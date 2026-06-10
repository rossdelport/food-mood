// Supabase data layer for meals: upload photo, create, list today, update mood.
import { format, startOfDay } from 'date-fns';
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

async function rowToMeal(r: MealRow): Promise<Meal> {
  let img = '';
  if (r.photo_path) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(r.photo_path, 3600);
    img = data?.signedUrl ?? '';
  }
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

// Create a meal row (mood pending) and schedule its reminder time.
export async function createMeal(params: {
  uri: string;
  detected: DetectedMeal;
  reminderMins: number;
}): Promise<{ id: string; reminderAt: Date }> {
  const uid = await ensureSession();
  if (!uid) throw new Error('Not signed in');
  const photoPath = await uploadPhoto(uid, params.uri);
  const reminderAt = new Date(Date.now() + params.reminderMins * 60000);
  const { data, error } = await supabase
    .from('meals')
    .insert({
      user_id: uid,
      title: params.detected.title,
      protein: params.detected.protein,
      carbs: params.detected.carbs,
      fat: params.detected.fat,
      calories: params.detected.calories,
      photo_path: photoPath,
      reminder_at: reminderAt.toISOString(),
    })
    .select('id')
    .single();
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

export async function getMealById(id: string): Promise<Meal | null> {
  await ensureSession();
  const { data, error } = await supabase.from('meals').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToMeal(data);
}

export async function setMealMood(id: string, mood: string): Promise<void> {
  await ensureSession();
  const { error } = await supabase
    .from('meals')
    .update({ mood, mood_logged_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
