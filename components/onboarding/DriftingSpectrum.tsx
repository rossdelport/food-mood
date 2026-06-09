import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MOODS, MOOD_ORDER } from '../../constants/data';

// Looping mood-spectrum bar with a slow continuous drift.
// `reverse` flips the drift direction (default drifts left).
export default function DriftingSpectrum({ width = 240, height = 12, reverse = false }: { width?: number; height?: number; reverse?: boolean }) {
  const cols = MOOD_ORDER.map((id) => MOODS[id].color);
  const doubled = [...cols, ...cols] as [string, string, ...string[]];
  const tx = useRef(new Animated.Value(reverse ? -width : 0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(tx, { toValue: reverse ? 0 : -width, duration: 9000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [tx, width, reverse]);

  return (
    <View style={[styles.wrap, { width, height, borderRadius: height }]}>
      <Animated.View style={{ width: width * 2, height, transform: [{ translateX: tx }] }}>
        <LinearGradient colors={doubled} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ width: width * 2, height }} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 3,
  },
});
