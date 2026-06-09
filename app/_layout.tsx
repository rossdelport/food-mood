import { Stack } from 'expo-router';

// Root navigation. Expo Router auto-discovers the (tabs) group, the
// onboarding routes, and App.tsx. Kept minimal as a placeholder scaffold.
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
