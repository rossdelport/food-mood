import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeftIcon } from '../NavIcons';
import { colors, fonts } from '../../constants/theme';

type Props = {
  idx?: number;
  total?: number;
  back?: boolean;
  skip?: boolean;
  onSkip?: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
};

// Shared onboarding chrome: back chevron, progress dots, optional Skip, footer.
export default function OnbShell({ idx = 0, total = 0, back = true, skip = false, onSkip, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        {back ? (
          <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
            <ChevronLeftIcon color={colors.ink2} size={14} />
          </Pressable>
        ) : (
          <View style={styles.slot} />
        )}

        {total > 0 ? (
          <View style={styles.dots}>
            {Array.from({ length: total }).map((_, i) => (
              <View key={i} style={[styles.dot, i === idx ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
        ) : (
          <View />
        )}

        {skip ? (
          <Pressable onPress={onSkip} hitSlop={8}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.slot} />
        )}
      </View>

      <View style={styles.body}>{children}</View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, minHeight: 40 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  slot: { width: 36 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: 999 },
  dotActive: { width: 18, backgroundColor: colors.ink1 },
  dotInactive: { width: 6, backgroundColor: colors.line },
  skip: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.ink3 },
  body: { flex: 1 },
  footer: { paddingHorizontal: 28 },
});
