// Profile / settings store. Source of truth is Supabase (so it follows the
// account across devices); AsyncStorage is a local cache for instant launch.
import { useSyncExternalStore } from 'react';
import { loadJSON, saveJSON } from './persist';
import { setHapticsEnabled } from '../services/haptics';
import { ensureSession } from '../services/supabase';
import { fetchProfile, upsertProfile, uploadAvatar, avatarUrl, type RemoteProfile } from '../services/profile';

const KEY = 'foodmood:profile';

export type Targets = { protein: number; carbs: number; fat: number; calories: number };
export type Profile = {
  name: string;
  tagline: string;
  avatar: string | null; // resolved (signed) display url
  avatarPath: string | null; // storage path in the avatars bucket
  goals: string[];
  reason: string;
  targets: Targets;
  showCalories: boolean;
  haptics: boolean;
  notif: { on: boolean; mins: number };
};

const DEFAULT_PROFILE: Profile = {
  name: '',
  tagline: 'Tracking mood + macros',
  avatar: null,
  avatarPath: null,
  goals: [],
  reason: '',
  targets: { protein: 120, carbs: 200, fat: 65, calories: 2000 },
  showCalories: false,
  haptics: true,
  notif: { on: true, mins: 60 },
};

let profile: Profile = { ...DEFAULT_PROFILE };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

const toRemote = (p: Profile): RemoteProfile => ({
  name: p.name, tagline: p.tagline, avatarPath: p.avatarPath,
  goals: p.goals, reason: p.reason, targets: p.targets,
  showCalories: p.showCalories, haptics: p.haptics, notif: p.notif,
});

// Debounced upsert to Supabase after local edits.
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleRemoteSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const uid = await ensureSession();
    if (uid) upsertProfile(uid, toRemote(profile)).catch(() => {});
  }, 500);
}

// Push the current local profile to the account immediately (e.g. after signup).
export async function pushProfileToRemote() {
  const uid = await ensureSession();
  if (uid) await upsertProfile(uid, toRemote(profile)).catch(() => {});
}

// Pull the account's profile from Supabase (after login / on launch). Creates
// the remote row from local data if the account has none yet.
export async function syncProfileFromRemote() {
  const uid = await ensureSession();
  if (!uid) return;
  const row = await fetchProfile(uid);
  if (row) {
    const avatar = await avatarUrl(row.avatarPath);
    profile = {
      ...DEFAULT_PROFILE,
      name: row.name,
      tagline: row.tagline || DEFAULT_PROFILE.tagline,
      avatar,
      avatarPath: row.avatarPath,
      goals: row.goals,
      reason: row.reason,
      targets: { ...DEFAULT_PROFILE.targets, ...row.targets },
      showCalories: row.showCalories,
      haptics: row.haptics,
      notif: { ...DEFAULT_PROFILE.notif, ...row.notif },
    };
    saveJSON(KEY, profile);
    setHapticsEnabled(profile.haptics);
    emit();
  } else {
    await pushProfileToRemote();
  }
}

// Load the cached profile for instant display, then sync from the account.
export async function hydrateProfile() {
  const saved = await loadJSON<Profile>(KEY);
  if (saved) profile = { ...DEFAULT_PROFILE, ...saved, targets: { ...DEFAULT_PROFILE.targets, ...saved.targets }, notif: { ...DEFAULT_PROFILE.notif, ...saved.notif } };
  setHapticsEnabled(profile.haptics);
  emit();
  await syncProfileFromRemote();
}

export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, () => profile);
}

// Reset to defaults in memory + cache (used by logout / delete-account).
export function resetProfile() {
  profile = { ...DEFAULT_PROFILE };
  saveJSON(KEY, profile);
  setHapticsEnabled(profile.haptics);
  emit();
}

export function updateProfile(patch: Partial<Profile>) {
  profile = { ...profile, ...patch };
  if (patch.haptics !== undefined) setHapticsEnabled(profile.haptics);
  saveJSON(KEY, profile);
  emit();
  scheduleRemoteSave();
}

export function updateTarget(key: keyof Targets, value: number) {
  profile = { ...profile, targets: { ...profile.targets, [key]: value } };
  saveJSON(KEY, profile);
  emit();
  scheduleRemoteSave();
}

export function updateNotif(patch: Partial<Profile['notif']>) {
  profile = { ...profile, notif: { ...profile.notif, ...patch } };
  saveJSON(KEY, profile);
  emit();
  scheduleRemoteSave();
}

// Upload a new avatar to Supabase storage and save it to the account.
export async function setAvatar(localUri: string) {
  profile = { ...profile, avatar: localUri }; // optimistic
  emit();
  const uid = await ensureSession();
  if (!uid) { saveJSON(KEY, profile); return; }
  try {
    const path = await uploadAvatar(uid, localUri);
    const url = await avatarUrl(path);
    profile = { ...profile, avatarPath: path, avatar: url ?? localUri };
    saveJSON(KEY, profile);
    emit();
    upsertProfile(uid, toRemote(profile)).catch(() => {});
  } catch {
    saveJSON(KEY, profile); // keep the local uri on failure
  }
}
