import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { ratingText } from '@/lib/utils';
import { Avatar, RatingStars, TrustedBadge } from '@/components/common';

export default function ProfileHeader({ user, listingCount = 0 }) {
  const { styles } = useStyles(makeStyles);
  if (!user) return null;
  return (
    <View style={styles.wrap}>
      <Avatar uri={user.profilePicBase64} name={user.fullName} size={92} />
      <Text style={styles.name}>{user.fullName}</Text>
      {user.trusted ? <View style={{ marginTop: 6 }}><TrustedBadge /></View> : null}
      <Text style={styles.sub}>
        {[user.year, user.department, user.college].filter(Boolean).join(' · ')}
      </Text>
      <View style={styles.ratingRow}>
        <RatingStars value={user.ratingAvg || 0} size={18} />
        <Text style={styles.ratingText}>{ratingText(user.ratingAvg || 0, user.ratingCount || 0)}</Text>
      </View>
      {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statNum}>{listingCount}</Text><Text style={styles.statLabel}>Listings</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{user.completedSales || 0}</Text><Text style={styles.statLabel}>Sales</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{user.ratingCount || 0}</Text><Text style={styles.statLabel}>Reviews</Text></View>
      </View>
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  name: { fontSize: fontSize.xl, fontWeight: '800', color: c.text, marginTop: 12, textAlign: 'center' },
  sub: { fontSize: fontSize.sm, color: c.muted, marginTop: 4, textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingText: { marginLeft: 8, fontSize: fontSize.sm, color: c.muted },
  bio: { fontSize: fontSize.md, color: c.text, marginTop: 12, textAlign: 'center', lineHeight: 21 },
  stats: { flexDirection: 'row', backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, marginTop: 16, alignSelf: 'stretch', paddingVertical: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: fontSize.lg, fontWeight: '800', color: c.text },
  statLabel: { fontSize: fontSize.xs, color: c.muted, marginTop: 2 },
});
