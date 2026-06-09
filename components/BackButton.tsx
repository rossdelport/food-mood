import { Pressable, StyleSheet } from 'react-native';
import { ChevronLeftIcon } from './NavIcons';
import { colors } from '../constants/theme';

// Circular back chevron used on modal/pushed screens.
export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.btn} onPress={onPress} hitSlop={8}>
      <ChevronLeftIcon color={colors.ink2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
