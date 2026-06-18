// Local notification scheduling for the post-meal mood check-in.
import * as Notifications from 'expo-notifications';

// Show the reminder even if the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotifPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

// Schedule the "how did that meal feel?" reminder `minutes` from now. The meal
// title (when known) personalises both the notification body and the mood
// picker it opens.
export async function scheduleMealReminder(mealId: string, minutes: number, mealTitle?: string): Promise<string | null> {
  const ok = await ensureNotifPermission();
  if (!ok) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to check in',
      body: mealTitle ? `How did "${mealTitle}" make you feel?` : 'How did your last meal leave you feeling?',
      data: { mealId, mealTitle },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(minutes * 60)),
      repeats: false,
    },
  });
}
