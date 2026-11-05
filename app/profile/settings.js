import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, Chip, FormScroll, Screen, ScreenHeader } from '@/components/common';
import { NOTIFICATION_LABELS } from '@/constants/campus';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { setNotificationPref } from '@/services/userService';
import { showError } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage } from '@/lib/utils';

export default function Settings() {
  const { styles, colors } = useStyles(makeStyles);
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const prefs = profile.notificationPrefs || {};

  const toggle = async (type, value) => {
    try { await setNotificationPref(user.uid, type, value); } catch (e) { showError(errorMessage(e)); }
  };
  const logout = async () => {
    if (await confirmDialog({ title: 'Sign out?', confirmText: 'Sign out', destructive: true })) await signOut();
  };

  return (
    <Screen>
      <ScreenHeader title="Settings" onBack={() => router.back()} />
      <FormScroll>
        <Text style={styles.h}>Appearance</Text>
        <View style={styles.wrap}>
          <Chip label="Match phone" selected={mode === 'system'} onPress={() => setMode('system')} />
          <Chip label="Light" selected={mode === 'light'} onPress={() => setMode('light')} />
          <Chip label="Dark" selected={mode === 'dark'} onPress={() => setMode('dark')} />
        </View>

        <Text style={styles.h}>Notifications</Text>
        <View style={styles.card}>
          {Object.keys(NOTIFICATION_LABELS).map((type) => (
            <View key={type} style={styles.row}>
              <Text style={styles.label}>{NOTIFICATION_LABELS[type]}</Text>
              <Switch value={prefs[type] !== false} onValueChange={(v) => toggle(type, v)} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
            </View>
          ))}
        </View>

        <Text style={styles.h}>Safety</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/blocked')}>
            <Text style={styles.label}>Blocked users ({(profile.blockedUids || []).length})</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/meetup-points')}>
            <Text style={styles.label}>Safe meetup points</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.h}>Account</Text>
        <Text style={styles.muted}>{user.email}</Text>
        <AppButton title="Sign out" variant="dangerOutline" onPress={logout} style={{ marginTop: 14 }} />
        <Text style={[styles.muted, { textAlign: 'center', marginTop: 24 }]}>Thrift Hub · College of Science and Technology</Text>
      </FormScroll>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  h: { fontSize: fontSize.lg, fontWeight: '800', color: c.text, marginTop: 20, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
  label: { flex: 1, fontSize: fontSize.md, color: c.text, paddingRight: 8 },
  muted: { fontSize: fontSize.sm, color: c.muted },
});
