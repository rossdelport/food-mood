import { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import OnbShell from '../../components/onboarding/OnbShell';
import OnbButton from '../../components/onboarding/OnbButton';
import { CameraIcon } from '../../components/NavIcons';
import { MOODS, MOOD_ORDER } from '../../constants/data';
import { colors, fonts } from '../../constants/theme';

const STEPS = [
  { title: 'Capture a meal', desc: "Snap a photo and we'll read the macros.", icon: 'cam' as const },
  { title: 'Pick a feeling', desc: 'Tap the colour that fits how you feel.', icon: 'orb' as const },
  { title: 'See the pattern', desc: 'Watch your week of mood + food unfold.', icon: 'spec' as const },
];

function StepIcon({ kind }: { kind: 'cam' | 'orb' | 'spec' }) {
  if (kind === 'cam') return <CameraIcon color={colors.ink1} size={22} />;
  if (kind === 'orb') return <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: MOODS.calm.color }} />;
  return (
    <LinearGradient
      colors={MOOD_ORDER.map((id) => MOODS[id].color) as [string, string, ...string[]]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{ width: 22, height: 11, borderRadius: 99 }}
    />
  );
}

const STAGGER = 700; // gap between reveals — matches screens 2 & 4
const DURATION = 520;

export default function How() {
  const router = useRouter();
  const anims = useRef(STEPS.map(() => new Animated.Value(0))).current;

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
    <OnbShell idx={3} total={6} footer={<OnbButton label="Continue" onPress={() => router.push('/onboarding/targets')} />}>
      <View style={styles.head}>
        <Text style={styles.h1}>How it works</Text>
      </View>
      <View style={styles.list}>
        {STEPS.map((s, i) => (
          <Animated.View key={s.title} style={[styles.step, reveal(anims[i])]}>
            <View>
              <View style={styles.well}><StepIcon kind={s.icon} /></View>
              <View style={styles.badge}><Text style={styles.badgeText}>{i + 1}</Text></View>
            </View>
            <View style={{ flex: 1, paddingTop: 4 }}>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.desc}>{s.desc}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </OnbShell>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 32, paddingTop: 14 },
  h1: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.4, color: colors.ink1 },
  list: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, gap: 26 },
  step: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  well: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -6, left: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.accentText },
  title: { fontFamily: fonts.medium, fontSize: 18, color: colors.ink1 },
  desc: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.ink3, marginTop: 3 },
});
