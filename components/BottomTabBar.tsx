import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../constants/theme';
import {
  HomeIcon, MoodsIcon, JournalIcon, ProfileIcon, CameraIcon,
  HomeFilledIcon, MoodsFilledIcon, JournalFilledIcon, ProfileFilledIcon,
} from './NavIcons';

// Minimal shape of the navigator props we actually use (avoids the
// expo-router vs @react-navigation type mismatch on the full BottomTabBarProps).
type Props = {
  state: { index: number; routes: { name: string }[] };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
  };
};

type Glyph = (p: { color: string; size?: number }) => React.ReactNode;
type TabDef = { name: string; label: string; Icon: Glyph; Filled: Glyph };

const ICON = 28;

const LEFT: TabDef[] = [
  { name: 'index', label: 'Home', Icon: HomeIcon, Filled: HomeFilledIcon },
  { name: 'moods', label: 'Moods', Icon: MoodsIcon, Filled: MoodsFilledIcon },
];
const RIGHT: TabDef[] = [
  { name: 'journal', label: 'Journal', Icon: JournalIcon, Filled: JournalFilledIcon },
  { name: 'profile', label: 'Profile', Icon: ProfileIcon, Filled: ProfileFilledIcon },
];

// Bottom tab bar with a raised center Capture button. The active tab's icon is filled.
export default function BottomTabBar({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeName = state.routes[state.index]?.name;

  const go = (name: string) => {
    const event = navigation.emit({ type: 'tabPress', target: name, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(name);
  };

  const renderTab = ({ name, label, Icon, Filled }: TabDef) => {
    const isActive = activeName === name;
    const color = isActive ? colors.ink1 : colors.ink2;
    const G = isActive ? Filled : Icon;
    return (
      <Pressable
        key={name}
        style={({ pressed }) => [styles.tab, pressed && { opacity: 0.55, transform: [{ scale: 0.92 }] }]}
        onPress={() => go(name)}
      >
        <G color={color} size={ICON} />
        <Text style={[styles.label, { color }, isActive && styles.labelActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {LEFT.map(renderTab)}

      <View style={styles.centerWrap}>
        <Pressable
          style={({ pressed }) => [styles.capture, pressed && { transform: [{ scale: 0.94 }] }]}
          onPress={() => router.push('/camera')}
        >
          <CameraIcon size={26} />
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
    paddingTop: 13,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 5 },
  label: { fontFamily: fonts.regular, fontSize: 12, letterSpacing: 0.2 },
  labelActive: { fontFamily: fonts.semibold },
  centerWrap: { flex: 1, alignItems: 'center', gap: 7 },
  capture: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginTop: -31,
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
  captureLabel: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: 0.2, color: colors.ink2 },
});
