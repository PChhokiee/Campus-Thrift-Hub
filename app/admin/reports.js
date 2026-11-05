import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, Chip, EmptyState, ErrorBanner, LoadingView, Screen, ScreenHeader, StatusPill } from '@/components/common';
import { REPORT_REASONS } from '@/constants/campus';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { listReports, resolveReport } from '@/services/reportService';
import { showError, showSuccess } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage, timeAgo } from '@/lib/utils';

const FILTERS = ['open', 'upheld', 'dismissed'];

export default function AdminReports() {
  const { styles } = useStyles(makeStyles);
  const router = useRouter();
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);
  const [f, setF] = useState('open');

  const load = useCallback(async () => {
    setError(null);
    try { setReports(await listReports()); } catch (e) { setError(errorMessage(e)); setReports([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => (reports || []).filter((r) => r.status === f), [reports, f]);

  const decide = async (r, decision) => {
    const removable = r.targetType !== 'user';
    let remove = false;
    if (decision === 'upheld') {
      const ok = await confirmDialog({
        title: 'Uphold this report?',
        message: removable ? 'The owner gets an upheld report (removing their Trusted badge) and the reported content will be removed.' : 'The user gets an upheld report, which removes their Trusted badge.',
        confirmText: 'Uphold', destructive: true,
      });
      if (!ok) return;
      remove = removable;
    }
    try { await resolveReport(r, decision, remove); showSuccess(`Report ${decision}`); await load(); } catch (e) { showError(errorMessage(e)); }
  };

  const view = (r) => {
    if (r.targetType === 'listing') router.push(`/item/${r.targetId}`);
    else if (r.targetType === 'comment' && r.listingId) router.push(`/item/${r.listingId}`);
    else if (r.targetType === 'user') router.push(`/profile/${r.targetId}`);
  };

  if (!reports) return <LoadingView />;
  return (
    <Screen>
      <ScreenHeader title="Reports" onBack={() => router.back()} />
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8 }}>
        {FILTERS.map((x) => <Chip key={x} label={x[0].toUpperCase() + x.slice(1)} selected={f === x} onPress={() => setF(x)} />)}
      </View>
      <View style={{ paddingHorizontal: 16 }}><ErrorBanner message={error} onRetry={load} /></View>
      <FlatList
        data={shown}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
        ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center' }}><EmptyState icon="checkmark-done-outline" title={`No ${f} reports`} /></View>}
        renderItem={({ item: r }) => {
          const reason = REPORT_REASONS.find((x) => x.key === r.reason);
          return (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.type}>{r.targetType.toUpperCase()}</Text>
                <StatusPill status={r.status} />
              </View>
              <Text style={styles.label} numberOfLines={2}>{r.label || r.targetId}</Text>
              <Text style={styles.reason}>{reason ? reason.label : r.reason}</Text>
              {r.details ? <Text style={styles.details}>“{r.details}”</Text> : null}
              <Text style={styles.sub}>Reported by {r.reporterName} · {timeAgo(r.createdAt)}</Text>
              <View style={styles.actions}>
                <AppButton small variant="outline" title="View" onPress={() => view(r)} style={{ flex: 1 }} />
                {r.status === 'open' ? (
                  <>
                    <AppButton small variant="danger" title="Uphold" onPress={() => decide(r, 'upheld')} style={{ flex: 1 }} />
                    <AppButton small variant="secondary" title="Dismiss" onPress={() => decide(r, 'dismissed')} style={{ flex: 1 }} />
                  </>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  card: { backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 10 },
  type: { fontSize: fontSize.xs, fontWeight: '800', color: c.primary },
  label: { fontSize: fontSize.md, fontWeight: '800', color: c.text, marginTop: 6 },
  reason: { fontSize: fontSize.sm, color: c.danger, fontWeight: '700', marginTop: 4 },
  details: { fontSize: fontSize.sm, color: c.text, marginTop: 6, fontStyle: 'italic' },
  sub: { fontSize: fontSize.xs, color: c.muted, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
