import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnbShell from '../../components/onboarding/OnbShell';
import OnbButton from '../../components/onboarding/OnbButton';
import MoodDot from '../../components/MoodDot';
import { PlusIcon } from '../../components/NavIcons';
import { MOODS, MOOD_ORDER } from '../../constants/data';
import { colors, fonts } from '../../constants/theme';

const STAGGER = 700; // gap between reveals — matches screen 2
const DURATION = 520;

export default function MeetMoods() {
  const router = useRouter();
  // One animated value per mood row + one for the "add more" affordance.
  const anims = useRef([...MOOD_ORDER, 'add'].map(() => new Animated.Value(0))).current;

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
    <OnbShell idx={2} total={6} footer={<OnbButton label="Continue" onPress={() => router.push('/onboarding/how')} />}>
      <View style={styles.head}>
        <Text style={styles.h1}>Meet your moods</Text>
        <Text style={styles.sub}>Five feelings, five colours. You'll pick one after each meal, and you can make them your own later.</Text>
      </View>
      <View style={styles.list}>
        {MOOD_ORDER.map((id, i) => {
          const m = MOODS[id];
          return (
            <Animated.View key={id} style={[styles.row, reveal(anims[i])]}>
              <MoodDot moodId={id} size={52} />
              <View>
                <Text style={styles.label}>{m.label}</Text>
                <Text style={styles.sublabel}>{m.sub}</Text>
              </View>
            </Animated.View>
          );
        })}

        <Animated.View style={[styles.addWrap, reveal(anims[MOOD_ORDER.length])]}>
          <Pressable style={styles.addBtn}>
            <PlusIcon color={colors.ink2} size={14} />
            <Text style={styles.addText}>add more moods!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </OnbShell>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 32, paddingTop: 14 },
  h1: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.4, color: colors.ink1 },
  sub: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: colors.ink3, marginTop: 8 },
  list: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, gap: 16, transform: [{ translateY: -20 }] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  label: { fontFamily: fonts.regular, fontSize: 18, color: colors.ink1 },
  sublabel: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink3, marginTop: 1 },
  addWrap: { alignItems: 'center', marginTop: 6 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 14 },
  addText: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.ink2 },
});
