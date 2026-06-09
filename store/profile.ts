// Profile / settings store. Becomes AsyncStorage-backed in the persistence pass.
import { useSyncExternalStore } from 'react';

export type Targets = { protein: number; carbs: number; fat: number; calories: number };
export type Profile = {
  name: string;
  tagline: string;
  avatar: string | null;
  targets: Targets;
  showCalories: boolean;
  notif: { on: boolean; mins: number };
};

let profile: Profile = {
  name: '',
  tagline: 'Tracking mood + macros',
  avatar: null,
  targets: { protein: 120, carbs: 200, fat: 65, calories: 2000 },
  showCalories: false,
  notif: { on: true, mins: 60 },
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, () => profile);
}

export function updateProfile(patch: Partial<Profile>) {
  profile = { ...profile, ...patch };
  emit();
}

export function updateTarget(key: keyof Targets, value: number) {
  profile = { ...profile, targets: { ...profile.targets, [key]: value } };
  emit();
}

export function updateNotif(patch: Partial<Profile['notif']>) {
  profile = { ...profile, notif: { ...profile.notif, ...patch } };
  emit();
}
