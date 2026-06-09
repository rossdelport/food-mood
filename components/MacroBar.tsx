import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { macroColors as defaultMacroColors, colors, radius as radii } from '../constants/theme';
import { macroGrams } from '../constants/data';
import type { Macros } from '../types';

type Props = {
  macros: Macros;
  height?: number;
  radius?: number;
  colors?: { protein: string; carbs: string; fat: string };
  /** Animate segment widths in on mount (~700ms). */
  animate?: boolean;
};

// Horizontal stacked macro bar (proportional). Three segments separated by thin
// background-colored gaps. Uses RN Animated (no extra babel setup).
export default function MacroBar({
  macros,
  height = 14,
  radius = radii.base,
  colors: macroColors = defaultMacroColors,
  animate = true,
}: Props) {
  const total = macroGrams(macros) || 1;
  const segs = [
    { key: 'protein', v: macros.protein, c: macroColors.protein },
    { key: 'carbs', v: macros.carbs, c: macroColors.carbs },
    { key: 'fat', v: macros.fat, c: macroColors.fat },
  ];

  const progress = useRef(new Animated.Value(animate ? 0 : 1)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 700,
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
      useNativeDriver: false, // width is a layout prop
    }).start();
  }, [animate, progress]);

  return (
    <View style={[styles.track, { height, borderRadius: radius }]}>
      {segs.map((s, i) => {
        const pct = (s.v / total) * 100;
        const width = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', `${pct}%`],
        });
        return (
          <Animated.View
            key={s.key}
            style={[
              { width, backgroundColor: s.c },
              i < 2 && { borderRightWidth: 1.5, borderRightColor: colors.bg },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
});
