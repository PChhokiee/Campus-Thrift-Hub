import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppButton, AppInput, Avatar, BottomSheet, Chip, EmptyState, IconButton, LoadingView, MenuSheet, RatingStars,
  Screen, ScreenHeader, StatusPill, TrustedBadge,
} from '@/components/common';
import ImageGallery from '@/components/listings/ImageGallery';
import CommentsSection from '@/components/listings/CommentsSection';
import RateSheet from '@/components/listings/RateSheet';
import ReportSheet from '@/components/listings/ReportSheet';
import { CONTACT_METHODS, STATUS_LABELS } from '@/constants/campus';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useParam } from '@/hooks/useParam';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { useActions } from '@/hooks/useActions';
import { deleteListing, getListing, getListingImages, setListingStatus } from '@/services/listingService';
import { createOrder } from '@/services/orderService';
import { chatIdFor } from '@/services/chatService';
import { blockUser, getUser } from '@/services/userService';
import { setListingRemoved } from '@/services/adminService';
import { showError, showSuccess } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage, formatPrice, pluralize, ratingText } from '@/lib/utils';

export default function ItemDetail() {
  const { styles, colors } = useStyles(makeStyles);
  const id = useParam('id');
  const router = useRouter();
  const { user, profile, isAdmin } = useAuth();
  const { listingsById, orders, hiddenUids, loaded } = useData();
  const { isSaved, isLiked, toggleSave, toggleLike } = useActions();

  const fromCtx = listingsById[id];
  const [fetched, setFetched] = useState(null);
  const [missing, setMissing] = useState(false);
  const [images, setImages] = useState([]);
  const [seller, setSeller] = useState(null);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(null);
  const [rateOrder, setRateOrder] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!fromCtx && loaded && !fetched) {
      getListing(id).then((l) => (l ? setFetched(l) : setMissing(true))).catch(() => setMissing(true));
    }
  }, [id, fromCtx, loaded, fetched]);

  const item = fromCtx || fetched;
  const imageCount = item ? item.imageCount : 0;

  useEffect(() => {
    if (item) getListingImages(id, item).then(setImages).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, imageCount]);
  useEffect(() => {
    if (item && item.sellerUid) getUser(item.sellerUid).then(setSeller).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item && item.sellerUid]);

  if (!item) {
    return missing ? (
      <Screen><ScreenHeader title="Item" onBack={() => router.back()} /><EmptyState icon="alert-circle-outline" title="Item not found" message="It may have been deleted." actionLabel="Go back" onAction={() => router.back()} /></Screen>
    ) : <LoadingView message="Loading item…" />;
  }

  const isOwner = item.sellerUid === user.uid;
  if ((hiddenUids.has(item.sellerUid) || (item.removed && !isAdmin && !isOwner))) {
    return <Screen><ScreenHeader title="Item" onBack={() => router.back()} /><EmptyState icon="eye-off-outline" title="This item isn't available" actionLabel="Go back" onAction={() => router.back()} /></Screen>;
  }

  const myOrders = orders.filter((o) => o.listingId === item.id);
  const myActiveOrder = myOrders.find((o) => o.buyerUid === user.uid && ['requested', 'accepted'].includes(o.status));
  const toRate = myOrders.find((o) => o.buyerUid === user.uid && o.status === 'completed' && !o.rated);
  const incoming = myOrders.filter((o) => o.sellerUid === user.uid && o.status === 'requested');
  const canRequest = !isOwner && item.status === 'available' && !myActiveOrder;
  const contact = CONTACT_METHODS.find((m) => m.key === item.contactMethod);

  const sendRequest = async () => {
    setBusy(true);
    try {
      const orderId = await createOrder({ listing: item, profile, note });
      setRequestOpen(false); setNote('');
      showSuccess('Request sent to the seller');
      router.push(`/orders/${orderId}`);
    } catch (e) { showError(errorMessage(e)); } finally { setBusy(false); }
  };

  const changeStatus = async (status) => {
    if (status === item.status) return;
    if (status === 'sold' && !(await confirmDialog({ title: 'Mark as sold?', message: 'Buyers who saved this item will be told it is gone.', confirmText: 'Mark sold' }))) return;
    try { await setListingStatus(item, status, profile); } catch (e) { showError(errorMessage(e)); }
  };

  const remove = async () => {
    if (!(await confirmDialog({ title: 'Delete this listing?', message: "This can't be undone.", confirmText: 'Delete', destructive: true }))) return;
    try { await deleteListing(item.id); showSuccess('Listing deleted'); router.back(); } catch (e) { showError(errorMessage(e)); }
  };

  const block = async () => {
    if (!(await confirmDialog({ title: `Block ${item.sellerName}?`, message: "You won't see each other's items or be able to message each other.", confirmText: 'Block', destructive: true }))) return;
    try { await blockUser(user.uid, item.sellerUid); showSuccess('User blocked'); router.back(); } catch (e) { showError(errorMessage(e)); }
  };

  const menuActions = isOwner
    ? [
        { label: 'Edit listing', icon: 'create-outline', onPress: () => router.push(`/item/edit/${item.id}`) },
        { label: 'Delete listing', icon: 'trash-outline', destructive: true, onPress: remove },
      ]
    : [
        { label: 'Report listing', icon: 'flag-outline', onPress: () => setReport({ type: 'listing', id: item.id, ownerUid: item.sellerUid, label: item.title }) },
        { label: 'Report seller', icon: 'person-remove-outline', onPress: () => setReport({ type: 'user', id: item.sellerUid, ownerUid: item.sellerUid, label: item.sellerName }) },
        { label: 'Block seller', icon: 'ban-outline', destructive: true, onPress: block },
        ...(isAdmin ? [{ label: item.removed ? 'Restore listing (admin)' : 'Remove listing (admin)', icon: 'shield-outline', destructive: !item.removed, onPress: () => setListingRemoved(item.id, !item.removed).catch((e) => showError(errorMessage(e))) }] : []),
      ];

  return (
    <Screen>
      <ScreenHeader title="Item details" onBack={() => router.back()} right={<IconButton icon="ellipsis-horizontal" onPress={() => setMenu(true)} label="More options" />} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <ImageGallery images={images} fallback={item.thumb} />
        <View style={styles.body}>
          {item.removed ? <Text style={styles.removed}>This listing has been removed by an admin.</Text> : null}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
          </View>
          <View style={styles.pills}>
            <StatusPill status={item.status} />
            {item.sellerTrusted ? <TrustedBadge /> : null}
            {item.flagged ? <Text style={styles.flag}>Under review</Text> : null}
          </View>
          <View style={styles.ratingRow}>
            <RatingStars value={item.ratingAvg} size={18} />
            <Text style={styles.muted}>  {ratingText(item.ratingAvg, item.ratingCount)}</Text>
          </View>

          <View style={styles.facts}>
            <Text style={styles.fact}><Ionicons name="pricetag-outline" size={14} /> {item.category || 'General'}</Text>
            <Text style={styles.fact}><Ionicons name="sparkles-outline" size={14} /> {item.condition}</Text>
            <Text style={styles.fact}><Ionicons name="location-outline" size={14} /> {item.location}</Text>
            <Text style={styles.fact}><Ionicons name="chatbubble-ellipses-outline" size={14} /> {contact ? contact.label : 'In-app chat'}</Text>
          </View>

          <View style={styles.reactRow}>
            <TouchableOpacity style={styles.react} onPress={() => toggleLike(item)} accessibilityLabel="Like">
              <Ionicons name={isLiked(item.id) ? 'heart' : 'heart-outline'} size={24} color={isLiked(item.id) ? colors.danger : colors.text} />
              <Text style={styles.reactText}>{item.likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.react} onPress={() => toggleSave(item)} accessibilityLabel="Save to wishlist">
              <Ionicons name={isSaved(item.id) ? 'bookmark' : 'bookmark-outline'} size={24} color={isSaved(item.id) ? colors.primary : colors.text} />
              <Text style={styles.reactText}>{isSaved(item.id) ? 'Saved' : 'Save to Wishlist'}</Text>
            </TouchableOpacity>
            <View style={styles.react}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
              <Text style={styles.reactText}>{item.commentCount}</Text>
            </View>
          </View>

          <Text style={styles.h}>Description</Text>
          <Text style={styles.desc}>{item.description || 'No description.'}</Text>

          <TouchableOpacity style={styles.sellerCard} onPress={() => router.push(`/profile/${item.sellerUid}`)} accessibilityRole="button">
            <Avatar uri={seller && seller.profilePicBase64} name={item.sellerName} size={48} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.sellerName}>{item.sellerName}{isOwner ? ' (you)' : ''}</Text>
              <Text style={styles.muted}>{ratingText(seller ? seller.ratingAvg || 0 : item.sellerRatingAvg, seller ? seller.ratingCount || 0 : 0)}</Text>
              {item.sellerTrusted ? <View style={{ marginTop: 4 }}><TrustedBadge /></View> : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          {isOwner ? (
            <View>
              <Text style={styles.h}>Availability</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {Object.keys(STATUS_LABELS).map((s) => <Chip key={s} label={STATUS_LABELS[s]} selected={item.status === s} onPress={() => changeStatus(s)} />)}
              </View>
              {incoming.length ? (
                <AppButton title={`View ${pluralize(incoming.length, 'buy request')}`} icon="receipt-outline" onPress={() => router.push('/orders')} style={{ marginTop: 10 }} />
              ) : null}
              <AppButton title="Edit listing" variant="outline" icon="create-outline" onPress={() => router.push(`/item/edit/${item.id}`)} style={{ marginTop: 10 }} />
              <AppButton title="Delete listing" variant="dangerOutline" icon="trash-outline" onPress={remove} style={{ marginTop: 10 }} />
            </View>
          ) : (
            <View style={{ marginTop: 20, gap: 10 }}>
              {canRequest ? <AppButton title={item.price === 0 ? 'Request this item' : 'Request to buy / reserve'} icon="hand-left-outline" onPress={() => setRequestOpen(true)} /> : null}
              {myActiveOrder ? <AppButton title="View my request" icon="receipt-outline" onPress={() => router.push(`/orders/${myActiveOrder.id}`)} /> : null}
              {!canRequest && !myActiveOrder && item.status !== 'available' ? <Text style={styles.muted}>This item is {item.status}.</Text> : null}
              <AppButton title="Message Seller" variant={canRequest ? 'outline' : 'primary'} icon="chatbubble-ellipses-outline" onPress={() => router.push(`/chat/${chatIdFor(item.id, user.uid)}`)} />
              {toRate ? <AppButton title="Rate this deal" variant="secondary" icon="star-outline" onPress={() => setRateOrder(toRate)} /> : null}
              <Text style={styles.safety}>🛡️ Safety tip: meet in a public campus spot. See Safe Meetup Points in your profile.</Text>
            </View>
          )}

          <View style={{ height: 24 }} />
          <CommentsSection listing={item} />
        </View>
      </ScrollView>

      <MenuSheet visible={menu} onClose={() => setMenu(false)} title="Options" actions={menuActions} />
      <ReportSheet visible={!!report} onClose={() => setReport(null)} target={report} />
      <RateSheet visible={!!rateOrder} onClose={() => setRateOrder(null)} order={rateOrder} />
      <BottomSheet visible={requestOpen} onClose={() => setRequestOpen(false)} title="Send a request">
        <Text style={styles.muted}>The seller will be notified and can accept or decline. No payment happens in the app: you pay at the handover.</Text>
        <AppInput label="Message to seller (optional)" value={note} onChangeText={setNote} multiline maxLength={200} placeholder="e.g. I can meet tomorrow after class" style={{ marginTop: 12 }} />
        <AppButton title="Send request" onPress={sendRequest} loading={busy} />
      </BottomSheet>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  body: { padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  removed: { backgroundColor: c.dangerBg, color: c.danger, padding: 10, borderRadius: radius.input, marginBottom: 10, fontWeight: '700' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  title: { flex: 1, fontSize: fontSize.xl, fontWeight: '800', color: c.text },
  price: { fontSize: fontSize.xl, fontWeight: '800', color: c.primary },
  pills: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  flag: { fontSize: fontSize.xs, color: c.warning, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  muted: { fontSize: fontSize.sm, color: c.muted },
  facts: { marginTop: 14, backgroundColor: c.card, borderRadius: radius.card, padding: 12, borderWidth: 1, borderColor: c.border, gap: 6 },
  fact: { fontSize: fontSize.md, color: c.text },
  reactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 },
  react: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  reactText: { marginLeft: 6, fontSize: fontSize.sm, fontWeight: '700', color: c.text },
  h: { fontSize: fontSize.lg, fontWeight: '800', color: c.text, marginTop: 20, marginBottom: 8 },
  desc: { fontSize: fontSize.md, color: c.text, lineHeight: 22 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 12, marginTop: 20 },
  sellerName: { fontSize: fontSize.md, fontWeight: '800', color: c.text },
  safety: { fontSize: fontSize.sm, color: c.muted, marginTop: 4, textAlign: 'center' },
});
