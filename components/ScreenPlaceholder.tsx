import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../constants/theme';

// Temporary themed placeholder for screens not yet built in this milestone.
export default function ScreenPlaceholder({ title }: { title: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>COMING SOON</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 8 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3 },
  title: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.4, color: colors.ink1 },
});
