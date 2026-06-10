import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast, type Toast, type ToastIcon } from '../store/toast';
import { RefreshIcon, CheckIcon, EditIcon, BellIcon, TrashIcon, InfoIcon } from './NavIcons';
import { colors, fonts } from '../constants/theme';

function Icon({ name }: { name: ToastIcon }) {
  const color = colors.bg;
  switch (name) {
    case 'refresh': return <RefreshIcon color={color} size={15} />;
    case 'edit': return <EditIcon color={color} size={15} />;
    case 'bell': return <BellIcon color={color} size={15} />;
    case 'trash': return <TrashIcon color={color} size={15} />;
    case 'info': return <InfoIcon color={color} size={15} />;
    default: return <CheckIcon color={color} size={16} />;
  }
}

// Renders the current global toast top-center, with a per-type icon. The
// refresh icon spins while visible.
export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [shown, setShown] = useState<Toast | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      setShown(toast);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 9, tension: 90 }).start();
      if (toast.icon === 'refresh') {
        spin.setValue(0);
        const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 850, easing: Easing.linear, useNativeDriver: true }));
        loop.start();
        return () => loop.stop();
      }
    } else {
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    }
  }, [toast, anim, spin]);

  if (!shown) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { top: insets.top + 10, opacity: anim, transform: [{ translateY }] }]}
    >
      <Animated.View style={shown.icon === 'refresh' ? { transform: [{ rotate }] } : undefined}>
        <Icon name={shown.icon} />
      </Animated.View>
      <Text style={styles.text}>{shown.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.ink1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 8,
  },
  text: { fontFamily: fonts.medium, fontSize: 13, color: colors.bg, letterSpacing: 0.2 },
});
