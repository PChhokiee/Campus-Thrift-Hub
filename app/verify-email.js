import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, ErrorBanner, Screen } from '@/components/common';
import { fontSize } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/services/authService';

const COOLDOWN = 60;

export default function VerifyEmail() {
  const { styles, colors } = useStyles(makeStyles);
  const { user, refreshUser, resendVerification, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const check = useCallback(async (manual) => {
    if (manual) { setChecking(true); setError(null); setMessage(null); }
    try {
      const ok = await refreshUser(); // when verified, the root layout redirects into the app
      if (!ok && manual) setMessage('Not verified yet. Open the link in your email first, then try again.');
    } catch (e) {
      if (manual) setError(authErrorMessage(e));
    } finally {
      if (manual) setChecking(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') check(false); });
    return () => sub.remove();
  }, [check]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    setSending(true); setError(null); setMessage(null);
    try {
      await resendVerification();
      setMessage('Verification email sent. Check your inbox and spam folder.');
      setCooldown(COOLDOWN);
    } catch (e) { setError(authErrorMessage(e)); } finally { setSending(false); }
  };

  return (
    <Screen style={{ padding: 24 }}>
      <View style={styles.center}>
        <Ionicons name="mail-open-outline" size={64} color={colors.secondary} />
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.sub}>We sent a verification link to</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.sub}>Tap the link in that email, then come back and press the button below. You can't buy, sell or chat until your email is verified.</Text>
      </View>
      <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
        <ErrorBanner message={error} />
        {message ? <Text style={styles.msg}>{message}</Text> : null}
        <AppButton title="I've verified my email" onPress={() => check(true)} loading={checking} />
        <AppButton title={cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend email'} variant="outline" onPress={resend}
          loading={sending} disabled={cooldown > 0} style={{ marginTop: 10 }} />
        <AppButton title="Use a different account" variant="ghost" onPress={signOut} style={{ marginTop: 6 }} />
      </View>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: c.text, marginTop: 16, marginBottom: 12 },
  sub: { fontSize: fontSize.md, color: c.muted, textAlign: 'center', marginTop: 6, lineHeight: 22 },
  email: { fontSize: fontSize.lg, fontWeight: '700', color: c.text, marginVertical: 6 },
  msg: { color: c.secondary, textAlign: 'center', marginBottom: 12 },
});
