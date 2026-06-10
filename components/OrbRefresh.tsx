import { useRef } from 'react';
import { View, Animated, ScrollView, StyleSheet, type StyleProp, type ViewStyle, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOODS, MOOD_ORDER } from '../constants/data';
import { showToast } from '../store/toast';

const ORBS = MOOD_ORDER.map((id) => MOODS[id].color);
const THRESHOLD = 96; // pull distance (px) at which all 5 orbs are lit → arm refresh
const HOLD_MS = 550; // how long the lit orbs stay pinned open while "refreshing"

type Props = {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Top offset for the orb indicator. Defaults to the safe-area top + 16. */
  indicatorTop?: number;
};

// Pull-to-refresh with a mood-orb indicator: the further you pull, the more
// orbs light up (1 by 1). Release with all 5 lit and it pins open for a beat
// (refreshing), then the orbs fade out as the page drops (no reverse un-light).
export default function OrbRefresh({ onRefresh, children, contentContainerStyle, indicatorTop }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = indicatorTop ?? insets.top + 16;
  const holdHeight = topPad + 48;

  const lit = useRef(new Animated.Value(0)).current; // orb-lighting progress (0..1)
  const hold = useRef(new Animated.Value(0)).current; // spacer gap while held open (0..1)
  const exit = useRef(new Animated.Value(1)).current; // group fade-out on collapse
  const offset = useRef(0);
  const refreshing = useRef(false);

  const litOpacity = lit.interpolate({ inputRange: [0, 0.06], outputRange: [0, 1], extrapolate: 'clamp' });
  const containerOpacity = Animated.multiply(litOpacity, exit);
  const spacerHeight = hold.interpolate({ inputRange: [0, 1], outputRange: [0, holdHeight] });

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    offset.current = y;
    // drive the orb lighting from the overscroll pull (ignored once refreshing)
    if (!refreshing.current) lit.setValue(Math.max(0, Math.min(1, -y / THRESHOLD)));
  };

  const trigger = async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    Animated.timing(lit, { toValue: 1, duration: 120, useNativeDriver: false }).start();
    Animated.timing(hold, { toValue: 1, duration: 160, useNativeDriver: false }).start();
    // refresh, but hold open at least HOLD_MS so it reads as a refresh
    await Promise.all([Promise.resolve(onRefresh()), new Promise((r) => setTimeout(r, HOLD_MS))]);
    // collapse: fade the lit orbs out as a group while the page drops
    Animated.parallel([
      Animated.timing(exit, { toValue: 0, duration: 180, useNativeDriver: false }),
      Animated.timing(hold, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start(() => {
      lit.setValue(0);
      exit.setValue(1);
      refreshing.current = false;
      showToast('Reloaded', 'refresh');
    });
  };

  return (
    <View style={styles.wrap}>
      {/* orb indicator — behind the (transparent) scroll view, revealed in the gap */}
      <Animated.View pointerEvents="none" style={[styles.indicator, { paddingTop: topPad, opacity: containerOpacity }]}>
        <View style={styles.orbRow}>
          {ORBS.map((c, i) => {
            const lo = i / ORBS.length;
            const hi = (i + 1) / ORBS.length;
            const opacity = lit.interpolate({ inputRange: [lo, hi], outputRange: [0.16, 1], extrapolate: 'clamp' });
            const scale = lit.interpolate({ inputRange: [lo, hi], outputRange: [0.5, 1], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.orb, { backgroundColor: c, opacity, transform: [{ scale }] }]} />;
          })}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollEndDrag={() => { if (offset.current <= -THRESHOLD) trigger(); }}
        contentContainerStyle={contentContainerStyle}
      >
        <Animated.View style={{ height: spacerHeight }} />
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  indicator: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  orbRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  orb: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
});
