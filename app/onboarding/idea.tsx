import { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnbShell from '../../components/onboarding/OnbShell';
import OnbButton from '../../components/onboarding/OnbButton';
import { MOODS } from '../../constants/data';
import { colors, fonts } from '../../constants/theme';

const LINES: [string, string, string][] = [
  ['Mood', 'first.', 'calm'],
  ['Macros', 'second.', 'focused'],
  ['Calories', 'optional.', 'energetic'],
];

const STAGGER = 700; // gap between reveals — enough to read each line
const DURATION = 520;

export default function Idea() {
  const router = useRouter();
  // One animated value per line + one for the paragraph.
  const anims = useRef([...LINES, 'para'].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const seq = Animated.stagger(
      STAGGER,
      anims.map((a) =>
        Animated.timing(a, { toValue: 1, duration: DURATION, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ),
    );
    seq.start();
    return () => seq.stop();
  }, [anims]);

  const reveal = (a: Animated.Value) => ({
    opacity: a,
    transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }],
  });

  return (
    <OnbShell idx={0} total={6} footer={<OnbButton label="Continue" onPress={() => router.push('/onboarding/about-you')} />}>
      <View style={styles.center}>
        {LINES.map(([a, b, mood], i) => (
          <Animated.View key={a} style={[styles.line, i > 0 && { marginTop: 20 }, reveal(anims[i])]}>
            <View style={[styles.dot, { backgroundColor: MOODS[mood].color }]} />
            <Text style={styles.lineText}>{a} <Text style={styles.lineMuted}>{b}</Text></Text>
          </Animated.View>
        ))}
        <Animated.Text style={[styles.para, reveal(anims[LINES.length])]}>
          Most trackers reduce food to numbers. Food Mood starts with a feeling. The macros are just the story underneath.
        </Animated.Text>
      </View>
    </OnbShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 40 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  lineText: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.5, color: colors.ink1 },
  lineMuted: { color: colors.ink3 },
  para: { fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 25, color: colors.ink2, marginTop: 40, maxWidth: 300 },
});
