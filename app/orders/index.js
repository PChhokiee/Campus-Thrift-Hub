import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chip, CountBadge, EmptyState, Screen, ScreenHeader, StatusPill } from '@/components/common';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { formatPrice, timeAgo, toImageSource } from '@/lib/utils';

export default function Orders() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const { user } = useAuth();
  const { orders, pendingRequests } = useData();
  const [tab, setTab] = useState('buying');

  const list = useMemo(
    () => orders.filter((o) => (tab === 'buying' ? o.buyerUid === user.uid : o.sellerUid === user.uid)),
    [orders, tab, user.uid]
  );

  return (
    <Screen>
      <ScreenHeader title="Orders & requests" onBack={() => router.back()} />
      <View style={styles.tabs}>
        <Chip label="Buying" selected={tab === 'buying'} onPress={() => setTab('buying')} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Chip label="Selling" selected={tab === 'selling'} onPress={() => setTab('selling')} />
          <CountBadge count={pendingRequests} style={{ marginLeft: -4, marginBottom: 8 }} />
        </View>
      </View>
      <FlatList
        data={list}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
        ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState icon="receipt-outline" title={tab === 'buying' ? 'No requests sent yet' : 'No buy requests yet'}
            message={tab === 'buying' ? 'Open an item and tap “Request to buy”.' : 'When someone requests your item it appears here.'} />
        </View>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push(`/orders/${item.id}`)} accessibilityRole="button">
            {item.listingImage ? <Image source={toImageSource(item.listingImage)} style={styles.img} /> : <View style={[styles.img, { alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="image-outline" size={22} color={colors.muted} /></View>}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title} numberOfLines={1}>{item.listingTitle}</Text>
              <Text style={styles.sub}>{tab === 'buying' ? `Seller: ${item.sellerName}` : `Buyer: ${item.buyerName}`} · {formatPrice(item.price)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <StatusPill status={item.status} />
                <Text style={styles.sub}>{timeAgo(item.updatedAt)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 12, marginBottom: 10 },
  img: { width: 64, height: 64, borderRadius: radius.input, backgroundColor: c.border },
  title: { fontSize: fontSize.md, fontWeight: '700', color: c.text },
  sub: { fontSize: fontSize.xs, color: c.muted, marginTop: 2 },
});
