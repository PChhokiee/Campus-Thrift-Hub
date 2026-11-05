import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { EmptyState, IconButton, LoadingView, MenuSheet, RatingStars, Screen, ScreenHeader } from '@/components/common';
import ListingGrid from '@/components/listings/ListingGrid';
import ReportSheet from '@/components/listings/ReportSheet';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useParam } from '@/hooks/useParam';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { blockUser, getUser } from '@/services/userService';
import { listSellerRatings } from '@/services/ratingService';
import { showError, showSuccess } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage, timeAgo } from '@/lib/utils';

export default function PublicProfile() {
  const { styles } = useStyles(makeStyles);
  const userId = useParam('userId');
  const router = useRouter();
  const { user, profile } = useAuth();
  const { listings, hiddenUids } = useData();
  const [u, setU] = useState(null);
  const [state, setState] = useState('loading');
  const [reviews, setReviews] = useState([]);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(null);
  const isMe = userId === user.uid;

  useEffect(() => {
    if (isMe) { setU(profile); setState('ok'); } else {
      getUser(userId).then((x) => { setU(x); setState(x ? 'ok' : 'missing'); }).catch(() => setState('missing'));
    }
    listSellerRatings(userId).then(setReviews).catch(() => {});
  }, [userId, isMe, profile]);

  const theirs = useMemo(() => listings.filter((l) => l.sellerUid === userId && l.status !== 'sold'), [listings, userId]);

  if (state === 'loading') return <LoadingView />;
  if (state === 'missing' || hiddenUids.has(userId)) {
    return <Screen><ScreenHeader title="Profile" onBack={() => router.back()} /><EmptyState icon="person-outline" title="Profile not available" actionLabel="Go back" onAction={() => router.back()} /></Screen>;
  }

  const block = async () => {
    if (!(await confirmDialog({ title: `Block ${u.fullName}?`, message: "You won't see each other's items or be able to message each other.", confirmText: 'Block', destructive: true }))) return;
    try { await blockUser(user.uid, userId); showSuccess('User blocked'); router.back(); } catch (e) { showError(errorMessage(e)); }
  };

  const header = (
    <View>
      <ProfileHeader user={u} listingCount={theirs.length} />
      {reviews.length ? (
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <Text style={styles.h}>Reviews</Text>
          {reviews.slice(0, 5).map((r) => (
            <View key={r.id} style={styles.review}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.reviewer}>{r.buyerName}</Text>
                <Text style={styles.time}>{timeAgo(r.createdAt)}</Text>
              </View>
              <RatingStars value={r.stars} size={14} />
              {r.review ? <Text style={styles.reviewText}>{r.review}</Text> : null}
              <Text style={styles.time}>for {r.listingTitle}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Text style={[styles.h, { paddingHorizontal: 16, marginTop: 18 }]}>Items for sale</Text>
    </View>
  );

  return (
    <Screen>
      <ScreenHeader title={isMe ? 'My public profile' : 'Profile'} onBack={() => router.back()}
        right={!isMe ? <IconButton icon="ellipsis-horizontal" onPress={() => setMenu(true)} label="More options" /> : null} />
      <ListingGrid data={theirs} ListHeaderComponent={header} ListEmptyComponent={<EmptyState icon="pricetags-outline" title="No items for sale right now" />} />
      <MenuSheet visible={menu} onClose={() => setMenu(false)} title={u.fullName} actions={[
        { label: 'Report user', icon: 'flag-outline', onPress: () => setReport({ type: 'user', id: userId, ownerUid: userId, label: u.fullName }) },
        { label: 'Block user', icon: 'ban-outline', destructive: true, onPress: block },
      ]} />
      <ReportSheet visible={!!report} onClose={() => setReport(null)} target={report} />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  h: { fontSize: fontSize.lg, fontWeight: '800', color: c.text, marginBottom: 10 },
  review: { backgroundColor: c.card, borderRadius: radius.input, borderWidth: 1, borderColor: c.border, padding: 12, marginBottom: 8 },
  reviewer: { fontSize: fontSize.sm, fontWeight: '700', color: c.text },
  reviewText: { fontSize: fontSize.md, color: c.text, marginTop: 6 },
  time: { fontSize: fontSize.xs, color: c.muted, marginTop: 4 },
});
