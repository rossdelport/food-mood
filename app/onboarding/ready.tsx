import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnbShell from '../../components/onboarding/OnbShell';
import OnbButton from '../../components/onboarding/OnbButton';
import DriftingSpectrum from '../../components/onboarding/DriftingSpectrum';
import { signIn } from '../../store/auth';
import { colors, fonts } from '../../constants/theme';

export default function Ready() {
  const router = useRouter();
  const start = () => {
    signIn();
    router.replace('/');
  };
  return (
    <OnbShell back={false} total={0} footer={<OnbButton label="Start tracking" onPress={start} />}>
      <View style={styles.center}>
        <DriftingSpectrum width={250} height={14} reverse />
        <Text style={styles.h1}>You're all set.</Text>
        <Text style={styles.body}>Log your first meal and start tracking your mood!</Text>
      </View>
    </OnbShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 38 },
  h1: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 44, letterSpacing: -0.5, color: colors.ink1, textAlign: 'center', marginTop: 34 },
  body: { fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 24, color: colors.ink3, textAlign: 'center', marginTop: 16, maxWidth: 280 },
});
