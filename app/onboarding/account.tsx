import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';
import OnbButton from '../../components/onboarding/OnbButton';
import { signUpEmail } from '../../store/auth';
import { pushProfileToRemote } from '../../store/profile';
import { hSuccess } from '../../services/haptics';
import { colors, fonts, radius as radii } from '../../constants/theme';

export default function Account() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    const e = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(e)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(null);
    setBusy(true);
    const res = await signUpEmail(e, password);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    if (res.session) {
      await pushProfileToRemote(); // save the onboarding profile to the new account
      hSuccess();
      router.push('/onboarding/ready');
    } else {
      setError('Account created — please confirm your email, then log in.');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <BackButton onPress={() => router.back()} />
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Create your account</Text>
          <Text style={styles.sub}>So your meals and moods are saved — and there if you ever switch phones.</Text>

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
            placeholder="At least 6 characters"
            placeholderTextColor={colors.ink3}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            style={styles.input}
            onSubmitEditing={submit}
            returnKeyType="go"
          />

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <OnbButton label={busy ? 'Creating…' : 'Create account'} onPress={submit} />
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
  error: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: '#9B5158', marginTop: 16 },
  footer: { paddingHorizontal: 28, paddingTop: 10 },
});
