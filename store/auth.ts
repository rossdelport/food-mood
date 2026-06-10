// Auth/session store, persisted to AsyncStorage so sign-in survives restarts.
import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'foodmood:auth:signedIn';

let signedIn = false;
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

// Load persisted auth state once on app start.
export async function hydrateAuth() {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v === '1') signedIn = true;
  } catch {
    // ignore read errors — fall back to signed-out
  } finally {
    hydrated = true;
    emit();
  }
}

export function useAuth(): boolean {
  return useSyncExternalStore(subscribe, () => signedIn);
}

// True once persisted state has been loaded — gate logic should wait for this.
export function useAuthHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => hydrated);
}

export function signIn() {
  signedIn = true;
  AsyncStorage.setItem(KEY, '1').catch(() => {});
  emit();
}

export function signOut() {
  signedIn = false;
  AsyncStorage.removeItem(KEY).catch(() => {});
  emit();
}
