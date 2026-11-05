import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppInput, ErrorBanner, FormScroll, Screen, ScreenHeader } from '@/components/common';
import { CAMPUS_EMAIL_EXAMPLE } from '@/constants/config';
import { fontSize } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/services/authService';
import { validateCampusEmail } from '@/lib/validation';

export default function Login() {
  const { styles } = useStyles(makeStyles);
  const router = useRouter();
  const { signIn, notice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(notice);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = {};
    const emailErr = validateCampusEmail(email);
    if (emailErr) e.email = emailErr;
    if (!password) e.password = 'Please enter your password.';
    setErrors(e);
    setFormError(null);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await signIn({ email, password }); // the root layout redirects automatically
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Sign in" onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <FormScroll>
        <Text style={styles.h}>Welcome back</Text>
        <Text style={styles.sub}>Sign in with your campus email.</Text>
        <ErrorBanner message={formError} />
        <AppInput label="Campus email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false}
          keyboardType="email-address" placeholder={CAMPUS_EMAIL_EXAMPLE} error={errors.email} />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" error={errors.password} />
        <TouchableOpacity onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-end', marginBottom: 16, minHeight: 36, justifyContent: 'center' }}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>
        <AppButton title="Sign in" onPress={submit} loading={loading} />
        <View style={{ height: 16 }} />
        <TouchableOpacity onPress={() => router.replace('/register')} style={{ alignItems: 'center', minHeight: 44, justifyContent: 'center' }}>
          <Text style={styles.sub}>New here? <Text style={styles.link}>Create an account</Text></Text>
        </TouchableOpacity>
      </FormScroll>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  h: { fontSize: fontSize.xxl, fontWeight: '800', color: c.text },
  sub: { fontSize: fontSize.md, color: c.muted, marginTop: 4, marginBottom: 20 },
  link: { color: c.primary, fontWeight: '700', fontSize: fontSize.md },
});
