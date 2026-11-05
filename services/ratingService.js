import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { evaluateTrusted } from '@/lib/trust';
import { notify } from '@/services/notificationService';

const avgOf = (docs) => {
  if (!docs.length) return { avg: 0, count: 0 };
  const sum = docs.reduce((n, d) => n + (d.data().stars || 0), 0);
  return { avg: Math.round((sum / docs.length) * 100) / 100, count: docs.length };
};

/** Recomputes seller + listing rating aggregates and the Trusted Seller flag (client-side, no Cloud Functions). */
export async function syncSellerStats(sellerUid, listingId) {
  const [sellerRatings, sellerSnap] = await Promise.all([
    getDocs(query(collection(db, 'ratings'), where('sellerUid', '==', sellerUid))),
    getDoc(doc(db, 'users', sellerUid)),
  ]);
  const seller = sellerSnap.exists() ? sellerSnap.data() : {};
  const s = avgOf(sellerRatings.docs);
  const trusted = !!seller.trustedManual || evaluateTrusted({
    completedSales: seller.completedSales || 0, ratingAvg: s.avg, upheldReports: seller.upheldReports || 0,
  });
  await updateDoc(doc(db, 'users', sellerUid), { ratingAvg: s.avg, ratingCount: s.count, trusted });

  const listings = await getDocs(query(collection(db, 'listings'), where('sellerUid', '==', sellerUid)));
  const batch = writeBatch(db);
  let lr = null;
  if (listingId) {
    lr = avgOf((await getDocs(query(collection(db, 'ratings'), where('listingId', '==', listingId)))).docs);
  }
  listings.docs.forEach((d) => {
    const patch = { sellerRatingAvg: s.avg, sellerTrusted: trusted };
    if (lr && d.id === listingId) { patch.ratingAvg = lr.avg; patch.ratingCount = lr.count; }
    batch.update(d.ref, patch);
  });
  await batch.commit();
  return { trusted, ...s };
}

/** Buyer rates the item + seller after a completed order (one rating per order). */
export async function submitRating({ order, stars, review, profile }) {
  await setDoc(doc(db, 'ratings', order.id), {
    orderId: order.id, listingId: order.listingId, listingTitle: order.listingTitle, sellerUid: order.sellerUid,
    buyerUid: profile.uid, buyerName: profile.fullName, stars, review: (review || '').trim(), createdAt: Date.now(),
  });
  await updateDoc(doc(db, 'orders', order.id), { rated: true, updatedAt: Date.now() });
  try { await syncSellerStats(order.sellerUid, order.listingId); } catch (e) { console.warn('[syncSellerStats]', e && e.message); }
  await notify({ toUid: order.sellerUid, actor: { uid: profile.uid, name: profile.fullName }, type: 'rating', title: 'New rating',
    body: `${profile.fullName} rated you ${stars}★ for "${order.listingTitle}".`, listingId: order.listingId, orderId: order.id });
}

export async function listSellerRatings(sellerUid) {
  const snap = await getDocs(query(collection(db, 'ratings'), where('sellerUid', '==', sellerUid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt);
}
