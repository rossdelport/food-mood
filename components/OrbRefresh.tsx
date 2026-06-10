import { useRef } from 'react';
import { View, Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
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
// (refreshing), then collapses and shows a "Reloaded" toast.
export default function OrbRefresh({ onRefresh, children, contentContainerStyle, indicatorTop }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = indicatorTop ?? insets.top + 16;
  const holdHeight = topPad + 48;

  const scrollY = useRef(new Animated.Value(0)).current;
  const hold = useRef(new Animated.Value(0)).current; // 0..1 while pinned open
  const offset = useRef(0);
  const refreshing = useRef(false);

  // combined "lit" progress: pull amount + hold (0..1, clamped per orb below)
  const pullProgress = scrollY.interpolate({ inputRange: [-THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const progress = Animated.add(pullProgress, hold);
  const containerOpacity = progress.interpolate({ inputRange: [0, 0.06], outputRange: [0, 1], extrapolate: 'clamp' });
  const spacerHeight = hold.interpolate({ inputRange: [0, 1], outputRange: [0, holdHeight] });

  const trigger = async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    // pin the orbs open
    Animated.timing(hold, { toValue: 1, duration: 160, useNativeDriver: false }).start();
    // refresh, but hold open for at least HOLD_MS so it reads as a refresh
    await Promise.all([Promise.resolve(onRefresh()), new Promise((r) => setTimeout(r, HOLD_MS))]);
    // collapse, then toast
    Animated.timing(hold, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
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
            const opacity = progress.interpolate({ inputRange: [lo, hi], outputRange: [0.16, 1], extrapolate: 'clamp' });
            const scale = progress.interpolate({ inputRange: [lo, hi], outputRange: [0.5, 1], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.orb, { backgroundColor: c, opacity, transform: [{ scale }] }]} />;
          })}
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
          listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => { offset.current = e.nativeEvent.contentOffset.y; },
        })}
        onScrollEndDrag={() => { if (offset.current <= -THRESHOLD) trigger(); }}
        contentContainerStyle={contentContainerStyle}
      >
        <Animated.View style={{ height: spacerHeight }} />
        {children}
      </Animated.ScrollView>
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
