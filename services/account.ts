// Account deletion: wipe the user's meals, profile, photos + avatar from
// Supabase, then drop the session.
import { supabase } from './supabase';

const BUCKET = 'meal-photos';
const AVATARS = 'avatars';

export async function deleteAccount(): Promise<void> {
  const uid = (await supabase.auth.getSession()).data.session?.user.id;
  if (uid) {
    for (const bucket of [BUCKET, AVATARS]) {
      try {
        const { data: files } = await supabase.storage.from(bucket).list(uid);
        if (files?.length) {
          await supabase.storage.from(bucket).remove(files.map((f) => `${uid}/${f.name}`));
        }
      } catch {
        // best-effort
      }
    }
    try {
      await supabase.from('meals').delete().eq('user_id', uid);
    } catch {
      // best-effort
    }
    try {
      await supabase.from('profiles').delete().eq('user_id', uid);
    } catch {
      // best-effort
    }
  }
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}
