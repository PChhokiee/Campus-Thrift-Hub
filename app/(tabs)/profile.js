import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, CountBadge, EmptyState, Screen, ScreenHeader } from '@/components/common';
import ListingGrid from '@/components/listings/ListingGrid';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { confirmDialog } from '@/lib/dialogs';

function MenuRow({ icon, label, onPress, badge, styles, colors }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <CountBadge count={badge} style={{ marginRight: 8 }} />
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </TouchableOpacity>
  );
}

export default function Profile() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const { profile, isAdmin, signOut } = useAuth();
  const { allListings, pendingRequests, unreadNotifs } = useData();
  const mine = useMemo(() => allListings.filter((l) => l.sellerUid === profile.uid && !l.removed).sort((a, b) => b.createdAt - a.createdAt), [allListings, profile.uid]);

  const logout = async () => {
    if (await confirmDialog({ title: 'Sign out?', message: 'You will need to sign in again.', confirmText: 'Sign out', destructive: true })) await signOut();
  };

  const header = (
    <View>
      <ProfileHeader user={profile} listingCount={mine.length} />
      <View style={styles.actions}>
        <AppButton title="Edit profile" variant="outline" small onPress={() => router.push('/profile/edit')} style={{ flex: 1 }} />
        <AppButton title="Settings" variant="outline" small icon="settings-outline" onPress={() => router.push('/profile/settings')} style={{ flex: 1 }} />
      </View>
      <View style={styles.menu}>
        <MenuRow styles={styles} colors={colors} icon="receipt-outline" label="My orders & requests" badge={pendingRequests} onPress={() => router.push('/orders')} />
        <MenuRow styles={styles} colors={colors} icon="notifications-outline" label="Notifications" badge={unreadNotifs} onPress={() => router.push('/notifications')} />
        <MenuRow styles={styles} colors={colors} icon="location-outline" label="Safe meetup points" onPress={() => router.push('/meetup-points')} />
        {isAdmin ? <MenuRow styles={styles} colors={colors} icon="shield-outline" label="Admin dashboard" onPress={() => router.push('/admin')} /> : null}
      </View>
      <Text style={styles.h}>My listings</Text>
    </View>
  );

  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Profile" right={<TouchableOpacity onPress={logout} style={{ padding: 10 }} accessibilityLabel="Sign out"><Ionicons name="log-out-outline" size={24} color={colors.text} /></TouchableOpacity>} />
      <ListingGrid
        data={mine}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState icon="pricetags-outline" title="You haven't listed anything yet" actionLabel="+ Sell an item" onAction={() => router.navigate('/sell')} />}
      />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 14 },
  menu: { marginHorizontal: 16, marginTop: 14, backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border },
  menuRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
  menuLabel: { flex: 1, marginLeft: 12, fontSize: fontSize.md, color: c.text, fontWeight: '600' },
  h: { fontSize: fontSize.lg, fontWeight: '800', color: c.text, marginTop: 22, marginBottom: 12, paddingHorizontal: 16 },
});
