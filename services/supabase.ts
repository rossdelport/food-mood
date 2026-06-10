import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Public, client-safe values (protected by Row-Level Security).
const SUPABASE_URL = 'https://yajuwuwjovuhnuhkmbni.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8L321OpPmrsu5OPByWgBAA_pBtHFkwX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Keep the session token fresh while the app is foregrounded.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

// Returns the current signed-in user's id (or null). The app gates on a real
// account, so callers can treat null as "not signed in".
export async function ensureSession(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
