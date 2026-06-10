// Auth/session store backed by Supabase email + password auth. The Supabase
// client persists the session to AsyncStorage, so sign-in survives restarts
// (auto-login). `signedIn` reflects a real account session.
import { useSyncExternalStore } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

let session: Session | null = null;
let hydrated = false;
let subscribed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

const isReal = (s: Session | null) => !!s && !s.user.is_anonymous;

// Load the persisted session once on launch, then keep it in sync.
export async function hydrateAuth() {
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // signed-out fallback
  } finally {
    hydrated = true;
    emit();
  }
  if (!subscribed) {
    subscribed = true;
    supabase.auth.onAuthStateChange((_event, s) => { session = s; emit(); });
  }
}

export function useAuth(): boolean {
  return useSyncExternalStore(subscribe, () => isReal(session));
}

export function useAuthHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => hydrated);
}

export function useUserEmail(): string | null {
  return useSyncExternalStore(subscribe, () => session?.user.email ?? null);
}

// Create an account. Returns an error message, plus whether a session was
// established (false means the project still requires email confirmation).
export async function signUpEmail(email: string, password: string): Promise<{ error?: string; session: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password });
  if (error) return { error: error.message, session: false };
  return { session: !!data.session };
}

// Sign in to an existing account. Returns an error message or null on success.
export async function signInEmail(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  return error ? error.message : null;
}

export async function signOutAuth(): Promise<void> {
  try { await supabase.auth.signOut(); } catch { /* ignore */ }
  session = null;
  emit();
}

// Email a password-reset code. Returns an error message or null.
export async function requestPasswordReset(email: string): Promise<string | null> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
  return error ? error.message : null;
}

// Verify the emailed code and set a new password (signs the user in). Returns
// an error message or null.
export async function confirmPasswordReset(email: string, code: string, newPassword: string): Promise<string | null> {
  const { error: vErr } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'recovery' });
  if (vErr) return vErr.message;
  const { error: uErr } = await supabase.auth.updateUser({ password: newPassword });
  return uErr ? uErr.message : null;
}
