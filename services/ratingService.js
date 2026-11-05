import { db } from '@/lib/firebase';
import { evaluateTrusted } from '@/lib/trust';
import { notify } from '@/services/notificationService';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';

const avgOf = (docs) => {
  if (!docs.length) return { avg: 0, count: 0 };
  const sum = docs.reduce((n, d) => n + (d.data().stars || 0), 0);
  return { avg: Math.round((sum / docs.length) * 100) / 100, count: docs.length };
};

/** One rating per person per listing: document id = listingId_userUid */
export const ratingId = (listingId, uid) => `${listingId}_${uid}`;

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

/** My existing rating of a listing (or null). */
export async function getMyRating(listingId, uid) {
  const snap = await getDoc(doc(db, 'ratings', ratingId(listingId, uid)));
  return snap.exists() ? snap.data() : null;
}

/**
 * Any signed-in (verified) user can rate any listing that is not their own.
 * Rating again simply updates the previous rating.
 * listing = { id, title, sellerUid, sellerName }; order is optional (marks that order as rated).
 */
export async function submitRating({ listing, order, stars, review, profile }) {
  if (!listing || !listing.sellerUid) throw new Error('This listing cannot be rated.');
  if (listing.sellerUid === profile.uid) throw new Error("You can't rate your own listing.");
  const previous = await getMyRating(listing.id, profile.uid);
  await setDoc(doc(db, 'ratings', ratingId(listing.id, profile.uid)), {
    listingId: listing.id, listingTitle: listing.title, sellerUid: listing.sellerUid,
    buyerUid: profile.uid, buyerName: profile.fullName || 'Student', stars,
    review: (review || '').trim(), orderId: order ? order.id : null,
    createdAt: previous ? previous.createdAt : Date.now(), updatedAt: Date.now(),
  });
  if (order) {
    try { await updateDoc(doc(db, 'orders', order.id), { rated: true, updatedAt: Date.now() }); } catch (e) { console.warn('[order rated]', e && e.message); }
  }
  try { await syncSellerStats(listing.sellerUid, listing.id); } catch (e) { console.warn('[syncSellerStats]', e && e.message); }
  if (!previous) {
    await notify({ toUid: listing.sellerUid, actor: { uid: profile.uid, name: profile.fullName }, type: 'rating', title: 'New rating',
      body: `${profile.fullName} rated "${listing.title}" ${stars}★.`, listingId: listing.id, orderId: order ? order.id : undefined });
  }
}

export async function listSellerRatings(sellerUid) {
  const snap = await getDocs(query(collection(db, 'ratings'), where('sellerUid', '==', sellerUid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt);
}