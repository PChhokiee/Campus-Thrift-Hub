import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, Screen, ScreenHeader, StatusPill } from '@/components/common';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useData } from '@/hooks/useData';
import { useActions } from '@/hooks/useActions';
import { formatPrice, timeAgo, toImageSource } from '@/lib/utils';

export default function Wishlist() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const { saved, listingsById, hiddenUids, loaded } = useData();
  const { toggleSave } = useActions();

  const items = useMemo(() => {
    return Object.keys(saved)
      .map((id) => ({ id, meta: saved[id], listing: listingsById[id] }))
      .filter((x) => x.listing && !x.listing.removed && !hiddenUids.has(x.listing.sellerUid))
      .sort((a, b) => (b.meta.savedAt || 0) - (a.meta.savedAt || 0));
  }, [saved, listingsById, hiddenUids]);

  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Wishlist" />
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={loaded ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyState icon="bookmark-outline" title="Your wishlist is empty" message="Tap the bookmark on any item to save it here. We'll alert you about price drops." actionLabel="Browse items" onAction={() => router.navigate('/explore')} />
          </View>
        ) : null}
        renderItem={({ item: { listing, meta } }) => {
          const dropped = meta.priceAtSave > listing.price && listing.status !== 'sold';
          return (
            <TouchableOpacity style={styles.row} onPress={() => router.push(`/item/${listing.id}`)} accessibilityRole="button">
              {listing.thumb ? <Image source={toImageSource(listing.thumb)} style={styles.img} /> : <View style={[styles.img, styles.noImg]}><Ionicons name="image-outline" size={24} color={colors.muted} /></View>}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Text style={styles.price}>{formatPrice(listing.price)}</Text>
                  {dropped ? <Text style={styles.was}>{formatPrice(meta.priceAtSave)}</Text> : null}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <StatusPill status={listing.status} />
                  {dropped ? <View style={styles.drop}><Ionicons name="trending-down" size={12} color={colors.secondary} /><Text style={styles.dropText}>Price drop</Text></View> : null}
                </View>
                <Text style={styles.meta}>Saved {timeAgo(meta.savedAt || Date.now())}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleSave(listing)} hitSlop={10} accessibilityLabel="Remove from wishlist">
                <Ionicons name="bookmark" size={24} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: radius.card, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: c.border },
  img: { width: 76, height: 76, borderRadius: radius.input, backgroundColor: c.border },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.md, fontWeight: '700', color: c.text },
  price: { fontSize: fontSize.md, fontWeight: '800', color: c.primary },
  was: { marginLeft: 8, fontSize: fontSize.sm, color: c.muted, textDecorationLine: 'line-through' },
  drop: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.badgeBg, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  dropText: { marginLeft: 3, fontSize: fontSize.xs, fontWeight: '700', color: c.secondary },
  meta: { fontSize: fontSize.xs, color: c.muted, marginTop: 4 },
});
