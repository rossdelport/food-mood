import React from 'react';
import { View, Text } from 'react-native';

// NOTE: With Expo Router the real entry point is `expo-router/entry`
// (see package.json "main") together with app/_layout.tsx. This file is a
// placeholder kept to match the requested structure; Expo Router exposes it
// as the /App route.
export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Placeholder: App entry</Text>
    </View>
  );
}
