import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBanner, Screen, ScreenHeader } from '@/components/common';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { listAllListings, listAllUsers } from '@/services/adminService';
import { listReports } from '@/services/reportService';
import { errorMessage } from '@/lib/utils';

export default function AdminHome() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [users, listings, reports] = await Promise.all([listAllUsers(), listAllListings(), listReports()]);
      setStats({
        users: users.length, suspended: users.filter((u) => u.suspended).length, trusted: users.filter((u) => u.trusted).length,
        listings: listings.length, flagged: listings.filter((l) => l.flagged).length, removed: listings.filter((l) => l.removed).length,
        openReports: reports.filter((r) => r.status === 'open').length,
      });
    } catch (e) { setError(errorMessage(e)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const Tile = ({ icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.tile} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={26} color={colors.primary} />
      <Text style={styles.num}>{stats ? value : '–'}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <ScreenHeader title="Admin dashboard" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <ErrorBanner message={error} onRetry={load} />
        <View style={styles.grid}>
          <Tile icon="people-outline" label="Users" value={stats && stats.users} onPress={() => router.push('/admin/users')} />
          <Tile icon="pricetags-outline" label="Listings" value={stats && stats.listings} onPress={() => router.push('/admin/listings')} />
          <Tile icon="flag-outline" label="Open reports" value={stats && stats.openReports} onPress={() => router.push('/admin/reports')} />
          <Tile icon="shield-checkmark-outline" label="Trusted sellers" value={stats && stats.trusted} onPress={() => router.push('/admin/users')} />
          <Tile icon="warning-outline" label="Flagged listings" value={stats && stats.flagged} onPress={() => router.push('/admin/listings')} />
          <Tile icon="ban-outline" label="Suspended users" value={stats && stats.suspended} onPress={() => router.push('/admin/users')} />
        </View>
        <Text style={styles.note}>Admins can suspend users, set Trusted Seller flags, flag or remove listings and review reports. To make someone an admin, set role = "admin" on their users document in the Firebase console.</Text>
      </ScrollView>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47.5%', backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 16, alignItems: 'flex-start' },
  num: { fontSize: fontSize.xxl, fontWeight: '800', color: c.text, marginTop: 8 },
  label: { fontSize: fontSize.sm, color: c.muted },
  note: { fontSize: fontSize.sm, color: c.muted, marginTop: 20, lineHeight: 20 },
});
