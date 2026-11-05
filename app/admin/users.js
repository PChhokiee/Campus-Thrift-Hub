import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, Avatar, EmptyState, ErrorBanner, LoadingView, Screen, ScreenHeader, TrustedBadge } from '@/components/common';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { listAllUsers, recalcTrust, setManualTrusted, setSuspended } from '@/services/adminService';
import { showError, showSuccess } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage, ratingText } from '@/lib/utils';

export default function AdminUsers() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try { setUsers(await listAllUsers()); } catch (e) { setError(errorMessage(e)); setUsers([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => (users || []).filter((u) => `${u.fullName} ${u.email}`.toLowerCase().includes(q.toLowerCase())), [users, q]);

  const run = async (fn, ok) => { try { await fn(); showSuccess(ok); await load(); } catch (e) { showError(errorMessage(e)); } };
  const suspend = async (u) => {
    const to = !u.suspended;
    if (await confirmDialog({ title: `${to ? 'Suspend' : 'Reinstate'} ${u.fullName}?`, confirmText: to ? 'Suspend' : 'Reinstate', destructive: to })) run(() => setSuspended(u.uid, to), to ? 'User suspended' : 'User reinstated');
  };

  if (!users) return <LoadingView />;
  return (
    <Screen>
      <ScreenHeader title="Users" onBack={() => router.back()} />
      <View style={{ paddingHorizontal: 16 }}>
        <TextInput style={styles.search} value={q} onChangeText={setQ} placeholder="Search name or email…" placeholderTextColor={colors.muted} autoCapitalize="none" />
        <ErrorBanner message={error} onRetry={load} />
      </View>
      <FlatList
        data={shown}
        keyExtractor={(u) => u.uid}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No users found" />}
        renderItem={({ item: u }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar uri={u.profilePicBase64} name={u.fullName} size={44} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{u.fullName}{u.role === 'admin' ? ' · Admin' : ''}</Text>
                <Text style={styles.sub} numberOfLines={1}>{u.email}</Text>
                <Text style={styles.sub}>{ratingText(u.ratingAvg || 0, u.ratingCount || 0)} · {u.completedSales || 0} sales · {u.upheldReports || 0} upheld reports</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
              {u.trusted ? <TrustedBadge /> : null}
              {u.suspended ? <Text style={styles.sus}>Suspended</Text> : null}
            </View>
            {u.uid !== user.uid ? (
              <View style={styles.actions}>
                <AppButton small variant={u.suspended ? 'secondary' : 'dangerOutline'} title={u.suspended ? 'Reinstate' : 'Suspend'} onPress={() => suspend(u)} style={{ flex: 1 }} />
                <AppButton small variant="outline" title={u.trustedManual ? 'Remove badge' : 'Give badge'} onPress={() => run(() => setManualTrusted(u.uid, !u.trustedManual), 'Badge updated')} style={{ flex: 1 }} />
                <AppButton small variant="ghost" title="Recalc" onPress={() => run(() => recalcTrust(u.uid), 'Trust recalculated')} />
              </View>
            ) : null}
          </View>
        )}
      />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  search: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: radius.pill, paddingHorizontal: 16, minHeight: 46, color: c.text, fontSize: fontSize.md, marginVertical: 10 },
  card: { backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 12, marginBottom: 10 },
  name: { fontSize: fontSize.md, fontWeight: '800', color: c.text },
  sub: { fontSize: fontSize.xs, color: c.muted, marginTop: 2 },
  sus: { fontSize: fontSize.xs, fontWeight: '800', color: c.danger },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
});
