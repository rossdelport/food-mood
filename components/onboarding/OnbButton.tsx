import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, buttonShadow } from '../../constants/theme';

export default function OnbButton({ label, onPress, ghost }: { label: string; onPress: () => void; ghost?: boolean }) {
  return (
    <Pressable style={[styles.btn, ghost ? styles.ghost : styles.solid]} onPress={onPress}>
      <Text style={[styles.text, ghost ? styles.ghostText : styles.solidText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: '100%', borderRadius: 14, paddingVertical: 17, alignItems: 'center' },
  solid: { backgroundColor: colors.accent, ...buttonShadow },
  ghost: { backgroundColor: 'transparent' },
  text: { fontFamily: fonts.medium, fontSize: 16, letterSpacing: 0.2 },
  solidText: { color: colors.accentText },
  ghostText: { color: colors.ink2 },
});
