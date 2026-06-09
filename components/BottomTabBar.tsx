import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../constants/theme';
import { HomeIcon, MoodsIcon, JournalIcon, ProfileIcon, CameraIcon } from './NavIcons';

// Minimal shape of the navigator props we actually use (avoids the
// expo-router vs @react-navigation type mismatch on the full BottomTabBarProps).
type Props = {
  state: { index: number; routes: { name: string }[] };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
  };
};

type TabDef = { name: string; label: string; Icon: (p: { color: string }) => React.ReactNode };

const LEFT: TabDef[] = [
  { name: 'index', label: 'Home', Icon: HomeIcon },
  { name: 'moods', label: 'Moods', Icon: MoodsIcon },
];
const RIGHT: TabDef[] = [
  { name: 'journal', label: 'Journal', Icon: JournalIcon },
  { name: 'profile', label: 'Profile', Icon: ProfileIcon },
];

// Bottom tab bar with a raised center Capture button.
export default function BottomTabBar({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeName = state.routes[state.index]?.name;

  const go = (name: string) => {
    const event = navigation.emit({ type: 'tabPress', target: name, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(name);
  };

  const renderTab = ({ name, label, Icon }: TabDef) => {
    const isActive = activeName === name;
    const color = isActive ? colors.ink1 : colors.ink2;
    return (
      <Pressable
        key={name}
        style={({ pressed }) => [styles.tab, pressed && { opacity: 0.55, transform: [{ scale: 0.92 }] }]}
        onPress={() => go(name)}
      >
        <Icon color={color} />
        <Text style={[styles.label, { color }, isActive && styles.labelActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {LEFT.map(renderTab)}

      <View style={styles.centerWrap}>
        <Pressable
          style={({ pressed }) => [styles.capture, pressed && { transform: [{ scale: 0.94 }] }]}
          onPress={() => router.push('/camera')}
        >
          <CameraIcon />
        </Pressable>
        <Text style={styles.captureLabel}>Capture</Text>
      </View>

      {RIGHT.map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 11,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 4 },
  label: { fontFamily: fonts.regular, fontSize: 10, letterSpacing: 0.2 },
  labelActive: { fontFamily: fonts.semibold },
  centerWrap: { flex: 1, alignItems: 'center', gap: 6 },
  capture: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginTop: -26,
    borderWidth: 3,
    borderColor: colors.card,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2733',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  captureLabel: { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 0.2, color: colors.ink2 },
});
