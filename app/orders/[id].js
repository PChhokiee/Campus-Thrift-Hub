import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, EmptyState, LoadingView, Screen, ScreenHeader, StatusPill } from '@/components/common';
import RateSheet from '@/components/listings/RateSheet';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useParam } from '@/hooks/useParam';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { respondToOrder } from '@/services/orderService';
import { chatIdFor } from '@/services/chatService';
import { showError, showSuccess } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage, formatDateTime, formatPrice } from '@/lib/utils';

export default function OrderDetail() {
  const { styles } = useStyles(makeStyles);
  const id = useParam('id');
  const router = useRouter();
  const { user, profile } = useAuth();
  const { orders, listingsById, loaded } = useData();
  const [busy, setBusy] = useState(false);
  const [rate, setRate] = useState(false);

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return loaded ? (
      <Screen><ScreenHeader title="Order" onBack={() => router.back()} /><EmptyState icon="alert-circle-outline" title="Order not found" actionLabel="Go back" onAction={() => router.back()} /></Screen>
    ) : <LoadingView />;
  }

  const listing = listingsById[order.listingId];
  const isSeller = order.sellerUid === user.uid;
  const other = isSeller ? order.buyerName : order.sellerName;
  const otherUid = isSeller ? order.buyerUid : order.sellerUid;

  const act = async (action, confirm) => {
    if (confirm && !(await confirmDialog(confirm))) return;
    setBusy(true);
    try { await respondToOrder(order, action, profile, listing); showSuccess('Order updated'); } catch (e) { showError(errorMessage(e)); } finally { setBusy(false); }
  };

  const canAccept = listing ? listing.status === 'available' : true;

  return (
    <Screen>
      <ScreenHeader title="Order details" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <View style={styles.card}>
          <Text style={styles.title}>{order.listingTitle}</Text>
          <Text style={styles.price}>{formatPrice(order.price)}</Text>
          <View style={{ marginTop: 10 }}><StatusPill status={order.status} /></View>
          <Text style={styles.line}>{isSeller ? 'Buyer' : 'Seller'}: <Text style={styles.bold}>{other}</Text></Text>
          <Text style={styles.line}>Requested: {formatDateTime(order.createdAt)}</Text>
          <Text style={styles.line}>Last update: {formatDateTime(order.updatedAt)}</Text>
          {order.note ? <Text style={styles.note}>“{order.note}”</Text> : null}
        </View>

        <Text style={styles.help}>
          {order.status === 'requested' && (isSeller ? 'Review this request. Accepting reserves the item for this buyer.' : 'Waiting for the seller to respond.')}
          {order.status === 'accepted' && 'Accepted. Agree on a safe campus meetup in chat, then the seller marks the deal as completed after the handover.'}
          {order.status === 'completed' && (order.rated ? 'Deal completed and rated. Thank you!' : isSeller ? 'Deal completed.' : 'Deal completed. Please rate the seller and item.')}
          {order.status === 'declined' && 'This request was declined.'}
          {order.status === 'cancelled' && 'This order was cancelled.'}
        </Text>

        <View style={{ gap: 10, marginTop: 8 }}>
          {isSeller && order.status === 'requested' ? (
            <>
              <AppButton title="Accept request" loading={busy} disabled={!canAccept} onPress={() => act('accept')} />
              {!canAccept ? <Text style={styles.warn}>This item is {listing.status}, so you can't accept another request.</Text> : null}
              <AppButton title="Decline" variant="dangerOutline" disabled={busy} onPress={() => act('decline', { title: 'Decline this request?', confirmText: 'Decline', destructive: true })} />
            </>
          ) : null}
          {isSeller && order.status === 'accepted' ? (
            <>
              <AppButton title="Mark as completed (item handed over)" icon="checkmark-circle-outline" loading={busy}
                onPress={() => act('complete', { title: 'Complete this deal?', message: 'Only confirm after the buyer has the item.', confirmText: 'Complete' })} />
              <AppButton title="Cancel order" variant="dangerOutline" disabled={busy}
                onPress={() => act('cancel', { title: 'Cancel this order?', message: 'The item becomes available again.', confirmText: 'Cancel order', destructive: true })} />
            </>
          ) : null}
          {!isSeller && order.status === 'requested' ? (
            <AppButton title="Cancel my request" variant="dangerOutline" loading={busy}
              onPress={() => act('buyerCancel', { title: 'Cancel your request?', confirmText: 'Cancel request', destructive: true })} />
          ) : null}
          {!isSeller && order.status === 'completed' && !order.rated ? (
            <AppButton title="Rate this deal" variant="secondary" icon="star-outline" onPress={() => setRate(true)} />
          ) : null}
          {['requested', 'accepted'].includes(order.status) ? (
            <AppButton title={`Chat with ${other}`} variant="outline" icon="chatbubble-ellipses-outline" onPress={() => router.push(`/chat/${chatIdFor(order.listingId, order.buyerUid)}`)} />
          ) : null}
          <AppButton title="View listing" variant="ghost" onPress={() => router.push(`/item/${order.listingId}`)} />
          <AppButton title={`View ${other}'s profile`} variant="ghost" onPress={() => router.push(`/profile/${otherUid}`)} />
        </View>
      </ScrollView>
      <RateSheet visible={rate} onClose={() => setRate(false)} order={order} />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  card: { backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 16 },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: c.text },
  price: { fontSize: fontSize.lg, fontWeight: '800', color: c.primary, marginTop: 4 },
  line: { fontSize: fontSize.md, color: c.muted, marginTop: 8 },
  bold: { color: c.text, fontWeight: '700' },
  note: { fontSize: fontSize.md, color: c.text, fontStyle: 'italic', marginTop: 12 },
  help: { fontSize: fontSize.md, color: c.muted, marginVertical: 14, lineHeight: 22 },
  warn: { fontSize: fontSize.sm, color: c.warning },
});
