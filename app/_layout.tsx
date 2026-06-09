import { useEffect } from 'react';
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
import { useAuth } from '../store/auth';

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
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // First-run / auth gate: not signed in → onboarding welcome.
  useEffect(() => {
    if (!loaded) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!signedIn && !inOnboarding) {
      router.replace('/onboarding/welcome');
    }
  }, [loaded, signedIn, segments, router]);

  if (!loaded) return null;

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
