import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import OnbShell from '../../components/onboarding/OnbShell';
import OnbButton from '../../components/onboarding/OnbButton';
import { useProfile, updateNotif } from '../../store/profile';
import { MOODS, MOOD_ORDER } from '../../constants/data';
import { colors, fonts } from '../../constants/theme';

export default function Reminders() {
  const router = useRouter();
  const mins = useProfile().notif.mins;
  const next = () => router.push('/onboarding/ready');

  return (
    <OnbShell idx={5} total={6} skip onSkip={next} footer={<OnbButton label="Continue" onPress={next} />}>
      <View style={styles.head}>
        <Text style={styles.h1}>When should we check in?</Text>
        <Text style={styles.sub}>We'll send one gentle nudge after a meal to capture how you feel.</Text>
      </View>

      <View style={styles.center}>
        {/* dummy lock-screen notification */}
        <View style={styles.notif}>
          <LinearGradient
            colors={MOOD_ORDER.map((id) => MOODS[id].color) as [string, string, ...string[]]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.notifIcon}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.notifTop}>
              <Text style={styles.notifApp}>FOOD MOOD</Text>
              <Text style={styles.notifNow}>now</Text>
            </View>
            <Text style={styles.notifTitle}>Time to check in</Text>
            <Text style={styles.notifBody}>How did your last meal leave you feeling?</Text>
          </View>
        </View>

        {/* timing card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Remind me after eating</Text>
          <View style={styles.valueRow}>
            <Text style={styles.valueCaption}>How long after</Text>
            <Text style={styles.value}>{mins} min</Text>
          </View>
          <Slider
            minimumValue={30}
            maximumValue={120}
            step={15}
            value={mins}
            onValueChange={(v) => updateNotif({ mins: v })}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.line}
            thumbTintColor={colors.accent}
          />
          <View style={styles.scaleRow}>
            <Text style={styles.scale}>30 min</Text>
            <Text style={styles.scale}>2 hr</Text>
          </View>
        </View>
      </View>
    </OnbShell>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 32, paddingTop: 14 },
  h1: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.4, color: colors.ink1 },
  sub: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: colors.ink3, marginTop: 8 },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  notif: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 3 },
  notifIcon: { width: 40, height: 40, borderRadius: 11 },
  notifTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  notifApp: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.2, color: colors.ink2 },
  notifNow: { fontFamily: fonts.regular, fontSize: 11, color: colors.ink3 },
  notifTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink1, marginTop: 3 },
  notifBody: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 18, color: colors.ink2, marginTop: 1 },
  card: { marginTop: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18 },
  cardTitle: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.ink1 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18, marginBottom: 6 },
  valueCaption: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink3 },
  value: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink1, fontVariant: ['tabular-nums'] },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  scale: { fontFamily: fonts.regular, fontSize: 11, color: colors.ink3 },
});
