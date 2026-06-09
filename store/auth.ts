// Lightweight auth/session store. In-memory for now (resets on reload);
// becomes AsyncStorage-backed in the persistence pass.
import { useSyncExternalStore } from 'react';

let signedIn = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useAuth(): boolean {
  return useSyncExternalStore(subscribe, () => signedIn);
}

export function signIn() {
  signedIn = true;
  emit();
}

export function signOut() {
  signedIn = false;
  emit();
}
