import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';
import OnbButton from '../../components/onboarding/OnbButton';
import { requestPasswordReset, confirmPasswordReset } from '../../store/auth';
import { syncProfileFromRemote } from '../../store/profile';
import { refreshMeals } from '../../store/meals';
import { refreshMoodDays } from '../../store/moodDays';
import { hSuccess } from '../../services/haptics';
import { colors, fonts, radius as radii } from '../../constants/theme';

export default function Forgot() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [phase, setPhase] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (busy) return;
    const e = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(e)) { setError('Please enter a valid email address.'); return; }
    setError(null);
    setBusy(true);
    const err = await requestPasswordReset(e);
    setBusy(false);
    if (err) { setError(err); return; }
    setPhase('verify');
  };

  const reset = async () => {
    if (busy) return;
    if (!code.trim()) { setError('Enter the code from your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(null);
    setBusy(true);
    const err = await confirmPasswordReset(email, code, password);
    if (err) { setBusy(false); setError(err); return; }
    await Promise.all([syncProfileFromRemote(), refreshMeals(), refreshMoodDays()]);
    setBusy(false);
    hSuccess();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  };

  const requesting = phase === 'request';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <BackButton onPress={() => (requesting ? router.back() : setPhase('request'))} />
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          {requesting ? (
            <>
              <Text style={styles.h1}>Reset your password</Text>
              <Text style={styles.sub}>Enter your email and we’ll send you a reset code.</Text>
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
                onSubmitEditing={sendCode}
                returnKeyType="send"
              />
            </>
          ) : (
            <>
              <Text style={styles.h1}>Check your email</Text>
              <Text style={styles.sub}>We sent a code to {email}. Enter it below with your new password.</Text>
              <Text style={styles.label}>CODE</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="6-digit code"
                placeholderTextColor={colors.ink3}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                style={styles.input}
              />
              <Text style={[styles.label, { marginTop: 16 }]}>NEW PASSWORD</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.ink3}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                style={styles.input}
                onSubmitEditing={reset}
                returnKeyType="go"
              />
            </>
          )}

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <OnbButton
            label={requesting ? (busy ? 'Sending…' : 'Send reset code') : (busy ? 'Resetting…' : 'Reset password')}
            onPress={requesting ? sendCode : reset}
          />
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
