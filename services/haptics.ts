// Tasteful, centralised haptics. Each helper maps to one intentional moment so
// the feel stays consistent and easy to tune. All calls are fire-and-forget and
// swallow errors (e.g. simulator / unsupported devices).
import * as Haptics from 'expo-haptics';

let enabled = true;
/** Toggle all haptics (driven by the user's Profile setting). */
export const setHapticsEnabled = (v: boolean) => { enabled = v; };

const run = (fn: () => Promise<unknown>) => { if (enabled) fn().catch(() => {}); };

/** Light tick for choosing/selecting (mood, swatch, toggle, library pick). */
export const hSelect = () => run(() => Haptics.selectionAsync());
/** Soft bump for crossing a threshold (pull-to-refresh armed). */
export const hLight = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
/** Firmer bump for a deliberate action (camera shutter). */
export const hMedium = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
/** Satisfying confirm for a completed action (meal/mood logged). */
export const hSuccess = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
/** Gentle caution for destructive/blocked actions (delete, not-food). */
export const hWarning = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
