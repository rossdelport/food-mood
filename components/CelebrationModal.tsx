// One-time celebration shown after the user logs their very first meal.
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import Confetti from './Confetti';
import { colors, fonts, radius as radii, buttonShadow } from '../constants/theme';

// "90" -> "1 hr 30 min", "60" -> "1 hour", "45" -> "45 min".
function humanMins(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (r === 0) return `${h} hour${h > 1 ? 's' : ''}`;
  return `${h} hr ${r} min`;
}

export default function CelebrationModal({ visible, minutes, onDone }: {
  visible: boolean;
  minutes: number | null; // reminder minutes, or null when no reminder was scheduled
  onDone: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDone}>
      <View style={styles.scrim}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Congrats!</Text>
          <Text style={styles.body}>
            {minutes != null
              ? `You logged your first meal. Enjoy it — we'll send a gentle check-in in ${humanMins(minutes)} so you can log how it made you feel.`
              : `You logged your first meal. Enjoy it — you can log how it made you feel anytime from the day's view.`}
          </Text>
          <Pressable style={styles.btn} onPress={onDone}>
            <Text style={styles.btnText}>Enjoy your meal</Text>
          </Pressable>
        </View>
        {visible && <Confetti />}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(26,22,18,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: radii.sheet,
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 26,
    alignItems: 'center',
  },
  emoji: { fontSize: 44, marginBottom: 8 },
  title: { fontFamily: fonts.light, fontSize: 28, letterSpacing: -0.4, color: colors.ink1 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.ink2, textAlign: 'center', marginTop: 12 },
  btn: { alignSelf: 'stretch', marginTop: 24, backgroundColor: colors.accent, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center', ...buttonShadow },
  btnText: { fontFamily: fonts.medium, fontSize: 15.5, letterSpacing: 0.2, color: colors.accentText },
});
