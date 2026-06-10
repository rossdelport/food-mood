import { View, Text, TextInput, Pressable, Keyboard, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnbShell from '../../components/onboarding/OnbShell';
import OnbButton from '../../components/onboarding/OnbButton';
import Toggle from '../../components/Toggle';
import { useProfile, updateTarget, updateProfile } from '../../store/profile';
import type { Targets as TargetsType } from '../../store/profile';
import { colors, fonts } from '../../constants/theme';

export default function Targets() {
  const router = useRouter();
  const profile = useProfile();
  const cal = profile.showCalories;
  const next = () => router.push('/onboarding/reminders');

  const set = (k: keyof TargetsType, max: number) => (t: string) => {
    const digits = t.replace(/[^0-9]/g, '');
    updateTarget(k, digits === '' ? 0 : Math.min(max, parseInt(digits, 10)));
  };

  const rows: [string, keyof TargetsType, string, number][] = [
    ['Protein', 'protein', 'g', 500],
    ['Carbs', 'carbs', 'g', 500],
    ['Fat', 'fat', 'g', 500],
  ];

  return (
    <OnbShell idx={4} total={6} skip onSkip={next} footer={<OnbButton label="Continue" onPress={next} />}>
      <Pressable style={styles.dismiss} onPress={Keyboard.dismiss}>
      <View style={styles.head}>
        <Text style={styles.h1}>Set your targets</Text>
        <Text style={styles.sub}>Optional. Your daily macro goals. Change them anytime.</Text>
      </View>

      <View style={styles.center}>
        <View style={styles.card}>
          {rows.map(([label, key, unit, max], i) => (
            <View key={key} style={[styles.row, i > 0 && styles.divider]}>
              <Text style={styles.label}>{label} <Text style={styles.unit}>({unit})</Text></Text>
              <TextInput value={String(profile.targets[key])} onChangeText={set(key, max)} keyboardType="number-pad" style={styles.input} />
            </View>
          ))}
          {cal && (
            <View style={[styles.row, styles.divider]}>
              <Text style={styles.label}>Calories <Text style={styles.unit}>(cal)</Text></Text>
              <TextInput value={String(profile.targets.calories)} onChangeText={set('calories', 9999)} keyboardType="number-pad" style={styles.input} />
            </View>
          )}
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Count calories</Text>
            <Toggle on={cal} onChange={(v) => updateProfile({ showCalories: v })} />
          </View>
          <Text style={styles.help}>Adds a calorie goal above. Off by default, since mood and macros come first.</Text>
        </View>
      </View>
      </Pressable>
    </OnbShell>
  );
}

const styles = StyleSheet.create({
  dismiss: { flex: 1 },
  head: { paddingHorizontal: 32, paddingTop: 14 },
  h1: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.4, color: colors.ink1 },
  sub: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: colors.ink3, marginTop: 8 },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  divider: { borderTopWidth: 1, borderTopColor: colors.line },
  label: { fontFamily: fonts.regular, fontSize: 15.5, color: colors.ink1 },
  unit: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3 },
  input: { width: 84, textAlign: 'right', borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 13, paddingVertical: 9, fontFamily: fonts.regular, fontSize: 16, color: colors.ink1, backgroundColor: colors.bg, fontVariant: ['tabular-nums'] },
  toggleCard: { marginTop: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontFamily: fonts.regular, fontSize: 15, color: colors.ink1 },
  help: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 17, color: colors.ink3, marginTop: 8, marginHorizontal: 2 },
});
