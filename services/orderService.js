import { addDoc, collection, doc, increment, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notify } from '@/services/notificationService';
import { notifySavers } from '@/services/listingService';

const actorOf = (profile) => ({ uid: profile.uid, name: profile.fullName });

/** Buyer sends a "request to buy / reserve". */
export async function createOrder({ listing, profile, note }) {
  const now = Date.now();
  const ref = await addDoc(collection(db, 'orders'), {
    listingId: listing.id, listingTitle: listing.title, listingImage: listing.thumb || null, price: listing.price,
    buyerUid: profile.uid, buyerName: profile.fullName, sellerUid: listing.sellerUid, sellerName: listing.sellerName,
    status: 'requested', note: (note || '').trim(), rated: false, createdAt: now, updatedAt: now,
  });
  await notify({ toUid: listing.sellerUid, actor: actorOf(profile), type: 'order', title: 'New buy request',
    body: `${profile.fullName} wants "${listing.title}".`, listingId: listing.id, orderId: ref.id });
  return ref.id;
}

/**
 * action: accept | decline | cancel (seller cancels an accepted order) | complete | buyerCancel
 * Seller actions also update the listing status (reserved / available / sold).
 */
export async function respondToOrder(order, action, profile, listing) {
  const now = Date.now();
  const orderRef = doc(db, 'orders', order.id);
  const listingRef = doc(db, 'listings', order.listingId);
  const batch = writeBatch(db);
  let status; let title; let body;

  if (action === 'accept') {
    status = 'accepted'; title = 'Request accepted'; body = `${order.sellerName} accepted your request for "${order.listingTitle}". Agree a meetup in chat.`;
    batch.update(listingRef, { status: 'reserved' });
  } else if (action === 'decline') {
    status = 'declined'; title = 'Request declined'; body = `${order.sellerName} declined your request for "${order.listingTitle}".`;
  } else if (action === 'cancel') {
    status = 'cancelled'; title = 'Order cancelled'; body = `${order.sellerName} cancelled the order for "${order.listingTitle}".`;
    batch.update(listingRef, { status: 'available' });
  } else if (action === 'complete') {
    status = 'completed'; title = 'Deal completed'; body = `Your purchase of "${order.listingTitle}" is complete. Please rate the seller!`;
    batch.update(listingRef, { status: 'sold' });
    batch.update(doc(db, 'users', order.sellerUid), { completedSales: increment(1) });
  } else if (action === 'buyerCancel') {
    status = 'cancelled';
  } else {
    throw new Error('Unknown action');
  }
  batch.update(orderRef, { status, updatedAt: now });
  await batch.commit();

  if (action === 'buyerCancel') {
    await notify({ toUid: order.sellerUid, actor: actorOf(profile), type: 'order', title: 'Request cancelled',
      body: `${order.buyerName} cancelled their request for "${order.listingTitle}".`, listingId: order.listingId, orderId: order.id });
    return;
  }
  await notify({ toUid: order.buyerUid, actor: actorOf(profile), type: 'order', title, body, listingId: order.listingId, orderId: order.id });
  if (action === 'complete' && listing) {
    await notifySavers({ ...listing, id: order.listingId }, 'sold', actorOf(profile), 'Item sold', `${order.listingTitle} has been sold.`);
  }
}
