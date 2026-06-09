import { Tabs } from 'expo-router';
import BottomTabBar from '../../components/BottomTabBar';
import { colors } from '../../constants/theme';

// Bottom tab navigator. Order: Home · Moods · Capture(center) · Journal · Profile.
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...(props as any)} />}
      screenOptions={{ headerShown: false, animation: 'shift', sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="moods" />
      <Tabs.Screen name="capture" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
