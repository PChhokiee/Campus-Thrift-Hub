import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppInput, Chip, ErrorBanner, FormScroll, Screen, ScreenHeader } from '@/components/common';
import { CAMPUS_EMAIL_EXAMPLE, MIN_PASSWORD_LENGTH } from '@/constants/config';
import { fontSize } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/services/authService';
import { validateCampusEmail, validateName, validatePassword } from '@/lib/validation';

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', '5th year'];

export default function Register() {
  const { styles } = useStyles(makeStyles);
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = {};
    const nameErr = validateName(fullName);
    const emailErr = validateCampusEmail(email);
    const pwErr = validatePassword(password);
    if (nameErr) e.fullName = nameErr;
    if (emailErr) e.email = emailErr;
    if (pwErr) e.password = pwErr;
    else if (password !== confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    setFormError(null);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await signUp({ fullName, email, password, year, department }); // root layout sends you to verify-email
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Create account" onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <FormScroll>
        <Text style={styles.sub}>Only verified college students can join Thrift Hub.</Text>
        <ErrorBanner message={formError} />
        <AppInput label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your full name" error={errors.fullName} />
        <AppInput label="Campus email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false}
          keyboardType="email-address" placeholder={CAMPUS_EMAIL_EXAMPLE}
          helper={`Allowed format: ${CAMPUS_EMAIL_EXAMPLE} (your student ID + .cst@rub.edu.bt)`} error={errors.email} />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`} error={errors.password} />
        <AppInput label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repeat password" error={errors.confirm} />
        <Text style={styles.label}>Year (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {YEARS.map((y) => <Chip key={y} label={y} selected={year === y} onPress={() => setYear(year === y ? '' : y)} />)}
        </ScrollView>
        <AppInput label="Department (optional)" value={department} onChangeText={setDepartment} placeholder="e.g. Information Technology" />
        <AppButton title="Create account" onPress={submit} loading={loading} />
        <Text style={styles.note}>We'll email you a verification link. You must verify before you can buy, sell or chat.</Text>
        <TouchableOpacity onPress={() => router.replace('/login')} style={{ alignItems: 'center', marginTop: 12, minHeight: 44, justifyContent: 'center' }}>
          <Text style={styles.sub}>Already have an account? <Text style={styles.link}>Sign in</Text></Text>
        </TouchableOpacity>
      </FormScroll>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  sub: { fontSize: fontSize.md, color: c.muted, marginBottom: 16 },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: c.text, marginBottom: 6 },
  note: { fontSize: fontSize.sm, color: c.muted, marginTop: 12, textAlign: 'center' },
  link: { color: c.primary, fontWeight: '700' },
});
