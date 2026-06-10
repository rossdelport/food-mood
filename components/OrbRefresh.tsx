import { useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOODS, MOOD_ORDER } from '../constants/data';
import { colors, fonts } from '../constants/theme';

const ORBS = MOOD_ORDER.map((id) => MOODS[id].color);
const THRESHOLD = 96; // pull distance (px) at which all 5 orbs are lit → arm refresh

type Props = {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Top offset for the orb indicator. Defaults to the safe-area top + 16. */
  indicatorTop?: number;
};

// Pull-to-refresh with a mood-orb indicator: the further you pull, the more
// orbs light up (1 by 1); release with all 5 lit to refresh, then a "Reloaded"
// toast. Driven by iOS overscroll (transparent scroll view reveals the orbs).
export default function OrbRefresh({ onRefresh, children, contentContainerStyle, indicatorTop }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = indicatorTop ?? insets.top + 16;
  const scrollY = useRef(new Animated.Value(0)).current;
  const offset = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = () => {
    setToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1300),
      Animated.timing(toastOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start(() => setToast(false));
  };

  const trigger = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      showToast();
    }
  };

  const containerOpacity = scrollY.interpolate({ inputRange: [-14, -5], outputRange: [1, 0], extrapolate: 'clamp' });
  const translateY = scrollY.interpolate({ inputRange: [-THRESHOLD, 0], outputRange: [16, 0], extrapolate: 'clamp' });

  return (
    <View style={styles.wrap}>
      {/* orb indicator — behind the (transparent) scroll view, revealed on pull */}
      <Animated.View pointerEvents="none" style={[styles.indicator, { paddingTop: topPad, opacity: containerOpacity, transform: [{ translateY }] }]}>
        <View style={styles.orbRow}>
          {ORBS.map((c, i) => {
            const t = (THRESHOLD * (i + 1)) / ORBS.length;
            const opacity = scrollY.interpolate({ inputRange: [-t, -t + 14], outputRange: [1, 0.18], extrapolate: 'clamp' });
            const scale = scrollY.interpolate({ inputRange: [-t, -t + 14], outputRange: [1, 0.55], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.orb, { backgroundColor: c, opacity, transform: [{ scale }] }]} />;
          })}
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => { offset.current = e.nativeEvent.contentOffset.y; },
        })}
        onScrollEndDrag={() => { if (offset.current <= -THRESHOLD) trigger(); }}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </Animated.ScrollView>

      {toast && (
        <Animated.View pointerEvents="none" style={[styles.toast, { bottom: insets.bottom + 96, opacity: toastOpacity }]}>
          <Text style={styles.toastText}>Reloaded</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  indicator: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  orbRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  orb: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  toast: { position: 'absolute', alignSelf: 'center', backgroundColor: colors.ink1, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 22, elevation: 6 },
  toastText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.bg, letterSpacing: 0.2 },
});
