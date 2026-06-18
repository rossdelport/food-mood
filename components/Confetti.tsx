// Lightweight confetti burst built on RN Animated (no extra dependency, native
// driver). Pieces fall from the top with random drift + spin, then fade out.
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

// On-brand: the five mood colours.
const COLORS = ['#F4E4C1', '#C9A876', '#A8B8A0', '#7A8FA3', '#8B4F5C'];
const { width: W, height: H } = Dimensions.get('window');

type Piece = {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  spin: number; // total degrees of rotation
  drift: number; // horizontal travel
  round: boolean;
};

function makePieces(n: number): Piece[] {
  return Array.from({ length: n }, () => ({
    left: Math.random() * W,
    size: 6 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 650,
    duration: 2200 + Math.random() * 1700,
    spin: (Math.random() * 6 - 3) * 360,
    drift: (Math.random() * 2 - 1) * 90,
    round: Math.random() < 0.35,
  }));
}

export default function Confetti({ count = 90 }: { count?: number }) {
  const pieces = useRef(makePieces(count)).current;
  const progress = useRef(pieces.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel(
      pieces.map((p, i) =>
        Animated.timing(progress[i], {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [pieces, progress]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const translateY = progress[i].interpolate({ inputRange: [0, 1], outputRange: [-40, H + 40] });
        const translateX = progress[i].interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
        const rotate = progress[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] });
        const opacity = progress[i].interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: p.left,
              width: p.size,
              height: p.round ? p.size : p.size * 0.6,
              borderRadius: p.round ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
