// Profile / settings store, persisted to AsyncStorage.
import { useSyncExternalStore } from 'react';
import { loadJSON, saveJSON } from './persist';
import { setHapticsEnabled } from '../services/haptics';

const KEY = 'foodmood:profile';

export type Targets = { protein: number; carbs: number; fat: number; calories: number };
export type Profile = {
  name: string;
  tagline: string;
  avatar: string | null;
  goals: string[]; // onboarding "Your goal" selections
  reason: string; // onboarding "What brought you here?"
  targets: Targets;
  showCalories: boolean;
  haptics: boolean;
  notif: { on: boolean; mins: number };
};

const DEFAULT_PROFILE: Profile = {
  name: '',
  tagline: 'Tracking mood + macros',
  avatar: null,
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

// Load saved profile (merged over defaults so new fields stay populated).
export async function hydrateProfile() {
  const saved = await loadJSON<Partial<Profile>>(KEY);
  if (saved) profile = { ...profile, ...saved, targets: { ...profile.targets, ...saved.targets }, notif: { ...profile.notif, ...saved.notif } };
  else saveJSON(KEY, profile);
  setHapticsEnabled(profile.haptics);
  emit();
}

export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, () => profile);
}

// Reset to defaults in memory (used by delete-account).
export function resetProfile() {
  profile = { ...DEFAULT_PROFILE };
  emit();
}

export function updateProfile(patch: Partial<Profile>) {
  profile = { ...profile, ...patch };
  if (patch.haptics !== undefined) setHapticsEnabled(profile.haptics);
  saveJSON(KEY, profile);
  emit();
}

export function updateTarget(key: keyof Targets, value: number) {
  profile = { ...profile, targets: { ...profile.targets, [key]: value } };
  saveJSON(KEY, profile);
  emit();
}

export function updateNotif(patch: Partial<Profile['notif']>) {
  profile = { ...profile, notif: { ...profile.notif, ...patch } };
  saveJSON(KEY, profile);
  emit();
}
