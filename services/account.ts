// Account deletion: wipe the user's meals + photos from Supabase, then drop
// the session. (Anonymous users get a fresh session on next launch/capture.)
import { supabase } from './supabase';

const BUCKET = 'meal-photos';

export async function deleteAccount(): Promise<void> {
  const uid = (await supabase.auth.getSession()).data.session?.user.id;
  if (uid) {
    try {
      const { data: files } = await supabase.storage.from(BUCKET).list(uid);
      if (files?.length) {
        await supabase.storage.from(BUCKET).remove(files.map((f) => `${uid}/${f.name}`));
      }
    } catch {
      // best-effort
    }
    try {
      await supabase.from('meals').delete().eq('user_id', uid);
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
