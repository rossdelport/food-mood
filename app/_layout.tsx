import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Outfit_200ExtraLight,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
} from '@expo-google-fonts/outfit';
import {
  Newsreader_400Regular_Italic,
  Newsreader_500Medium_Italic,
} from '@expo-google-fonts/newsreader';
import { colors } from '../constants/theme';
import { useAuth, hydrateAuth } from '../store/auth';
import { hydrateJournal } from '../store/journal';
import { hydrateMoods } from '../store/moods';
import { hydrateProfile } from '../store/profile';
import { hydrateMeals } from '../store/meals';
import { ensureSession } from '../services/supabase';

SplashScreen.preventAutoHideAsync();

// Root navigation. Loads brand fonts (Outfit + Newsreader) before revealing the app.
export default function RootLayout() {
  const [loaded] = useFonts({
    Outfit_200ExtraLight,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium_Italic,
  });

  const signedIn = useAuth();
  const [storesReady, setStoresReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Load all persisted stores once on launch, before revealing the app.
  useEffect(() => {
    Promise.all([hydrateAuth(), hydrateJournal(), hydrateMoods(), hydrateProfile(), hydrateMeals()]).finally(() =>
      setStoresReady(true),
    );
  }, []);

  // Establish the anonymous Supabase session in the background (non-blocking).
  useEffect(() => {
    ensureSession();
  }, []);

  const ready = loaded && storesReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // First-run / auth gate: not signed in → onboarding welcome.
  // Waits for storage hydration so signed-in users don't flash onboarding.
  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!signedIn && !inOnboarding) {
      router.replace('/onboarding/welcome');
    }
  }, [ready, signedIn, segments, router]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="day" />
        <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="mood-picker" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="breakdown" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="journal-entry" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="journal-read" />
      </Stack>
    </SafeAreaProvider>
  );
}
