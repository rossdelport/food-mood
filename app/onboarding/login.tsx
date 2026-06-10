import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';
import OnbButton from '../../components/onboarding/OnbButton';
import { signInEmail } from '../../store/auth';
import { syncProfileFromRemote } from '../../store/profile';
import { refreshMeals } from '../../store/meals';
import { refreshMoodDays } from '../../store/moodDays';
import { colors, fonts, radius as radii } from '../../constants/theme';

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    const e = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(e) || !password) { setError('Enter your email and password.'); return; }
    setError(null);
    setBusy(true);
    const err = await signInEmail(e, password);
    if (err) { setBusy(false); setError(err); return; }
    // pull this account's profile + data before entering the app
    await Promise.all([syncProfileFromRemote(), refreshMeals(), refreshMoodDays()]);
    setBusy(false);
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <BackButton onPress={() => router.back()} />
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Welcome back</Text>
          <Text style={styles.sub}>Log in to pick up where you left off.</Text>

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={colors.ink3}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>PASSWORD</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor={colors.ink3}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            style={styles.input}
            onSubmitEditing={submit}
            returnKeyType="go"
          />

          <Pressable onPress={() => router.push('/onboarding/forgot')} style={styles.forgot} hitSlop={8}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <OnbButton label={busy ? 'Logging in…' : 'Log in'} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  kav: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingBottom: 4 },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 32, paddingTop: 16 },
  h1: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.4, color: colors.ink1 },
  sub: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: colors.ink3, marginTop: 8, marginBottom: 26 },
  label: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.8, color: colors.ink3, marginBottom: 8 },
  input: { fontFamily: fonts.regular, fontSize: 16, color: colors.ink1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radii.base, paddingVertical: 15, paddingHorizontal: 16 },
  forgot: { alignSelf: 'flex-start', marginTop: 16 },
  forgotText: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.ink2 },
  error: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: '#9B5158', marginTop: 16 },
  footer: { paddingHorizontal: 28, paddingTop: 10 },
});
