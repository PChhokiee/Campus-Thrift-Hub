import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppInput, ErrorBanner, FormScroll, Screen, ScreenHeader } from '@/components/common';
import { CAMPUS_EMAIL_EXAMPLE } from '@/constants/config';
import { fontSize } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/services/authService';
import { validateCampusEmail } from '@/lib/validation';

export default function ForgotPassword() {
  const { styles } = useStyles(makeStyles);
  const router = useRouter();
  const { sendReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    const emailErr = validateCampusEmail(email);
    if (emailErr) return setError(emailErr);
    setLoading(true);
    try { await sendReset(email); setSent(true); } catch (err) { setError(authErrorMessage(err)); } finally { setLoading(false); }
  };

  return (
    <Screen>
      <ScreenHeader title="Reset password" onBack={() => (router.canGoBack() ? router.back() : router.replace('/login'))} />
      <FormScroll>
        <Text style={styles.sub}>Enter your campus email and we'll send you a link to set a new password.</Text>
        <ErrorBanner message={error} />
        {sent ? (
          <>
            <Text style={styles.ok}>If an account exists for {email.trim().toLowerCase()}, a reset link is on its way. Check your inbox and spam folder.</Text>
            <AppButton title="Back to sign in" onPress={() => router.replace('/login')} />
          </>
        ) : (
          <>
            <AppInput label="Campus email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false}
              keyboardType="email-address" placeholder={CAMPUS_EMAIL_EXAMPLE} />
            <AppButton title="Send reset link" onPress={submit} loading={loading} />
          </>
        )}
      </FormScroll>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  sub: { fontSize: fontSize.md, color: c.muted, marginBottom: 20 },
  ok: { fontSize: fontSize.md, color: c.secondary, marginBottom: 20, lineHeight: 22 },
});
