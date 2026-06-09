import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnbShell from '../../components/onboarding/OnbShell';
import OnbButton from '../../components/onboarding/OnbButton';
import OnbLogo from '../../components/onboarding/OnbLogo';
import DriftingSpectrum from '../../components/onboarding/DriftingSpectrum';
import { signIn } from '../../store/auth';
import { colors, fonts } from '../../constants/theme';

export default function Welcome() {
  const router = useRouter();
  const haveAccount = () => {
    signIn();
    router.replace('/');
  };
  return (
    <OnbShell
      back={false}
      total={0}
      footer={
        <>
          <OnbButton label="Get started" onPress={() => router.push('/onboarding/idea')} />
          <OnbButton label="I already have an account" ghost onPress={haveAccount} />
        </>
      }
    >
      <View style={styles.center}>
        <OnbLogo size={20} />
        <Text style={styles.brand}>FOOD MOOD</Text>
        <Text style={styles.h1}>How does food make you feel?</Text>
        <Text style={styles.body}>A gentle way to notice the link between what you eat and how you feel.</Text>
        <View style={{ marginTop: 36 }}>
          <DriftingSpectrum width={240} height={12} reverse />
        </View>
      </View>
    </OnbShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  brand: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: 3, color: colors.ink3, marginTop: 12 },
  h1: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 44, letterSpacing: -0.5, color: colors.ink1, textAlign: 'center', marginTop: 28 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.ink3, textAlign: 'center', marginTop: 18, maxWidth: 280 },
});
