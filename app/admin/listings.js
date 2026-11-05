import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, Chip, EmptyState, ErrorBanner, LoadingView, Screen, ScreenHeader, StatusPill } from '@/components/common';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { listAllListings, setListingFlagged, setListingRemoved } from '@/services/adminService';
import { showError, showSuccess } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage, formatPrice, toImageSource } from '@/lib/utils';

const FILTERS = ['All', 'Flagged', 'Removed'];

export default function AdminListings() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [f, setF] = useState('All');

  const load = useCallback(async () => {
    setError(null);
    try { setItems(await listAllListings()); } catch (e) { setError(errorMessage(e)); setItems([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => (items || []).filter((l) =>
    `${l.title} ${l.sellerName}`.toLowerCase().includes(q.toLowerCase()) &&
    (f === 'All' || (f === 'Flagged' && l.flagged) || (f === 'Removed' && l.removed))), [items, q, f]);

  const run = async (fn, ok) => { try { await fn(); showSuccess(ok); await load(); } catch (e) { showError(errorMessage(e)); } };
  const remove = async (l) => {
    if (await confirmDialog({ title: 'Remove this listing?', message: 'It will be hidden from everyone. You can restore it later.', confirmText: 'Remove', destructive: true })) run(() => setListingRemoved(l.id, true), 'Listing removed');
  };

  if (!items) return <LoadingView />;
  return (
    <Screen>
      <ScreenHeader title="Listings" onBack={() => router.back()} />
      <View style={{ paddingHorizontal: 16 }}>
        <TextInput style={styles.search} value={q} onChangeText={setQ} placeholder="Search title or seller…" placeholderTextColor={colors.muted} autoCapitalize="none" />
        <View style={{ flexDirection: 'row' }}>{FILTERS.map((x) => <Chip key={x} label={x} selected={f === x} onPress={() => setF(x)} />)}</View>
        <ErrorBanner message={error} onRetry={load} />
      </View>
      <FlatList
        data={shown}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ListEmptyComponent={<EmptyState icon="pricetags-outline" title="No listings found" />}
        renderItem={({ item: l }) => (
          <View style={styles.card}>
            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => router.push(`/item/${l.id}`)} accessibilityRole="button">
              {l.thumb ? <Image source={toImageSource(l.thumb)} style={styles.img} /> : <View style={styles.img} />}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.title} numberOfLines={1}>{l.title}</Text>
                <Text style={styles.sub}>{formatPrice(l.price)} · {l.sellerName}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' }}>
                  <StatusPill status={l.status} />
                  {l.flagged ? <Text style={styles.flag}>Flagged</Text> : null}
                  {l.removed ? <Text style={styles.rem}>Removed</Text> : null}
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.actions}>
              <AppButton small variant="outline" title={l.flagged ? 'Approve' : 'Flag'} onPress={() => run(() => setListingFlagged(l.id, !l.flagged), l.flagged ? 'Listing approved' : 'Listing flagged')} style={{ flex: 1 }} />
              {l.removed
                ? <AppButton small variant="secondary" title="Restore" onPress={() => run(() => setListingRemoved(l.id, false), 'Listing restored')} style={{ flex: 1 }} />
                : <AppButton small variant="dangerOutline" title="Remove" onPress={() => remove(l)} style={{ flex: 1 }} />}
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  search: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: radius.pill, paddingHorizontal: 16, minHeight: 46, color: c.text, fontSize: fontSize.md, marginVertical: 10 },
  card: { backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 12, marginBottom: 10 },
  img: { width: 64, height: 64, borderRadius: radius.input, backgroundColor: c.border },
  title: { fontSize: fontSize.md, fontWeight: '800', color: c.text },
  sub: { fontSize: fontSize.xs, color: c.muted, marginTop: 2 },
  flag: { fontSize: fontSize.xs, fontWeight: '800', color: c.warning },
  rem: { fontSize: fontSize.xs, fontWeight: '800', color: c.danger },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
});
