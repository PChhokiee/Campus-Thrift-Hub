import React from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';
import { formatPrice, toImageSource } from '@/lib/utils';
import TrustedBadge from '@/components/common/TrustedBadge';

export default function ListingCard({ item, width, onPress, saved, onToggleSave }) {
  const { styles, colors } = useStyles(makeStyles);
  const src = toImageSource(item.thumb);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, width ? { width } : { flex: 1 }, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${formatPrice(item.price)}`}
    >
      <View style={[styles.imgWrap, { height: width ? width : 150 }]}>
        {src ? <Image source={src} style={styles.img} resizeMode="cover" /> : (
          <View style={[styles.img, styles.noImg]}><Ionicons name="image-outline" size={32} color={colors.muted} /></View>
        )}
        {item.status !== 'available' ? (
          <View style={styles.statusTag}><Text style={styles.statusText}>{item.status === 'sold' ? 'SOLD' : 'RESERVED'}</Text></View>
        ) : null}
        {onToggleSave ? (
          <TouchableOpacity style={styles.heart} onPress={onToggleSave} hitSlop={8} accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}>
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? colors.primary : colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.condition} · {item.location}</Text>
        <View style={styles.footer}>
          {item.ratingCount > 0 ? (
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={colors.star} />
              <Text style={styles.ratingText}>{item.ratingAvg.toFixed(1)}</Text>
            </View>
          ) : <Text style={styles.meta}>New</Text>}
          {item.sellerTrusted ? <TrustedBadge compact /> : null}
        </View>
      </View>
    </Pressable>
  );
}
const makeStyles = (c, t) => StyleSheet.create({
  card: { backgroundColor: c.card, borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: c.border, ...t.shadow },
  imgWrap: { width: '100%', backgroundColor: c.border },
  img: { width: '100%', height: '100%' },
  noImg: { alignItems: 'center', justifyContent: 'center', backgroundColor: c.card },
  statusTag: { position: 'absolute', left: 8, top: 8, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  heart: { position: 'absolute', right: 8, top: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 10 },
  title: { fontSize: fontSize.md, fontWeight: '700', color: c.text },
  price: { fontSize: fontSize.md, fontWeight: '800', color: c.primary, marginTop: 2 },
  meta: { fontSize: fontSize.xs, color: c.muted, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, minHeight: 20 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 3, fontSize: fontSize.xs, fontWeight: '700', color: c.text },
});
