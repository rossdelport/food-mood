// Supabase data layer for the user profile (name, avatar, targets, settings).
import { supabase } from './supabase';

const AVATARS = 'avatars';

export type RemoteProfile = {
  name: string;
  tagline: string;
  avatarPath: string | null;
  goals: string[];
  reason: string;
  targets: { protein: number; carbs: number; fat: number; calories: number };
  showCalories: boolean;
  haptics: boolean;
  notif: { on: boolean; mins: number };
};

export async function fetchProfile(uid: string): Promise<RemoteProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', uid).maybeSingle();
  if (error || !data) return null;
  return {
    name: data.name ?? '',
    tagline: data.tagline ?? '',
    avatarPath: data.avatar_path ?? null,
    goals: Array.isArray(data.goals) ? data.goals : [],
    reason: data.reason ?? '',
    targets: data.targets ?? {},
    showCalories: !!data.show_calories,
    haptics: data.haptics ?? true,
    notif: data.notif ?? {},
  };
}

export async function upsertProfile(uid: string, p: RemoteProfile): Promise<void> {
  await supabase.from('profiles').upsert({
    user_id: uid,
    name: p.name,
    tagline: p.tagline,
    avatar_path: p.avatarPath,
    goals: p.goals,
    reason: p.reason,
    targets: p.targets,
    show_calories: p.showCalories,
    haptics: p.haptics,
    notif: p.notif,
    updated_at: new Date().toISOString(),
  });
}

export async function uploadAvatar(uid: string, uri: string): Promise<string> {
  const path = `${uid}/avatar_${Date.now()}.jpg`;
  const arraybuffer = await fetch(uri).then((r) => r.arrayBuffer());
  const { error } = await supabase.storage.from(AVATARS).upload(path, arraybuffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return path;
}

export async function avatarUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(AVATARS).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
