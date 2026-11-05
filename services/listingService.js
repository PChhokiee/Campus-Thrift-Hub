import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, onSnapshot, updateDoc, writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizeListing } from '@/lib/normalize';
import { notify } from '@/services/notificationService';

const MAX_IMAGE_CHARS = 900000; // Firestore documents are limited to 1 MB

const actorOf = (profile) => ({ uid: profile.uid, name: profile.fullName });

export async function getListing(id) {
  const snap = await getDoc(doc(db, 'listings', id));
  return snap.exists() ? normalizeListing(snap.id, snap.data()) : null;
}

/** Full-size images live in listingImages/{id} so the feed stays light. Falls back to old Android data. */
export async function getListingImages(id, fallbackListing) {
  try {
    const snap = await getDoc(doc(db, 'listingImages', id));
    if (snap.exists() && Array.isArray(snap.data().images) && snap.data().images.length) return snap.data().images;
  } catch (e) { /* fall through */ }
  const raw = await getDoc(doc(db, 'listings', id));
  const d = raw.exists() ? raw.data() : {};
  if (Array.isArray(d.images) && d.images.length) return d.images;
  if (d.imageBase64) return [d.imageBase64];
  return fallbackListing && fallbackListing.thumb ? [fallbackListing.thumb] : [];
}

function assertImageSize(images) {
  const total = images.reduce((n, s) => n + s.length, 0);
  if (total > MAX_IMAGE_CHARS) throw new Error('Photos are too large together. Remove one photo and try again.');
}

/** input: { title, description, category, condition, price, location, contactMethod, images:[base64], thumb } */
export async function createListing(input, profile) {
  assertImageSize(input.images);
  const ref = doc(collection(db, 'listings'));
  const batch = writeBatch(db);
  batch.set(ref, {
    title: input.title.trim(), description: input.description.trim(), category: input.category,
    condition: input.condition, price: input.price, location: input.location, contactMethod: input.contactMethod,
    thumb: input.thumb, imageCount: input.images.length, status: 'available',
    sellerUid: profile.uid, sellerName: profile.fullName, sellerTrusted: !!profile.trusted, sellerRatingAvg: profile.ratingAvg || 0,
    likeCount: 0, commentCount: 0, ratingAvg: 0, ratingCount: 0, flagged: false, removed: false, createdAt: Date.now(),
  });
  batch.set(doc(db, 'listingImages', ref.id), { listingId: ref.id, images: input.images });
  await batch.commit();
  return ref.id;
}

/** Edit a listing. Notifies wishlist savers when the price is lowered. */
export async function updateListing(prev, input, profile) {
  if (input.images) assertImageSize(input.images);
  const patch = {
    title: input.title.trim(), description: input.description.trim(), category: input.category,
    condition: input.condition, price: input.price, location: input.location, contactMethod: input.contactMethod,
  };
  const batch = writeBatch(db);
  if (input.images) {
    patch.thumb = input.thumb;
    patch.imageCount = input.images.length;
    batch.set(doc(db, 'listingImages', prev.id), { listingId: prev.id, images: input.images });
  }
  batch.update(doc(db, 'listings', prev.id), patch);
  await batch.commit();
  if (input.price < prev.price) {
    await notifySavers({ ...prev, ...patch }, 'priceDrop', actorOf(profile),
      'Price drop!', `${patch.title} is now ${input.price === 0 ? 'free' : `Nu.${input.price}`} (was Nu.${prev.price}).`);
  }
}

export async function setListingStatus(listing, status, profile) {
  await updateDoc(doc(db, 'listings', listing.id), { status });
  if (status === 'sold') {
    await notifySavers(listing, 'sold', actorOf(profile), 'Item sold', `${listing.title} has been marked as sold.`);
  }
}

export async function deleteListing(id) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'listings', id));
  batch.delete(doc(db, 'listingImages', id));
  await batch.commit();
}

export async function notifySavers(listing, type, actor, title, body) {
  try {
    const snap = await getDocs(collection(db, 'listings', listing.id, 'savedBy'));
    await Promise.all(snap.docs.map((d) => notify({ toUid: d.id, actor, type, title, body, listingId: listing.id })));
  } catch (e) { console.warn('[notifySavers]', e && e.message); }
}

/** Wishlist / bookmark. Writes both the user's list and the listing's saver list. */
export async function toggleSave(profile, listing, currentlySaved) {
  const batch = writeBatch(db);
  const mine = doc(db, 'users', profile.uid, 'saved', listing.id);
  const theirs = doc(db, 'listings', listing.id, 'savedBy', profile.uid);
  if (currentlySaved) {
    batch.delete(mine); batch.delete(theirs);
  } else {
    batch.set(mine, { listingId: listing.id, priceAtSave: listing.price, savedAt: Date.now() });
    batch.set(theirs, { uid: profile.uid, savedAt: Date.now() });
  }
  await batch.commit();
  if (!currentlySaved) {
    await notify({ toUid: listing.sellerUid, actor: actorOf(profile), type: 'save', title: 'Saved to a wishlist',
      body: `${profile.fullName} saved "${listing.title}".`, listingId: listing.id });
  }
}

export async function toggleLike(profile, listing, currentlyLiked) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'listings', listing.id), { likeCount: increment(currentlyLiked ? -1 : 1) });
  const mine = doc(db, 'users', profile.uid, 'likes', listing.id);
  if (currentlyLiked) batch.delete(mine); else batch.set(mine, { listingId: listing.id, likedAt: Date.now() });
  await batch.commit();
  if (!currentlyLiked) {
    await notify({ toUid: listing.sellerUid, actor: actorOf(profile), type: 'like', title: 'New like',
      body: `${profile.fullName} liked "${listing.title}".`, listingId: listing.id });
  }
}

export async function addComment(listing, profile, text) {
  await addDoc(collection(db, 'listings', listing.id, 'comments'), {
    listingId: listing.id, authorUid: profile.uid, authorName: profile.fullName, text: text.trim(), createdAt: Date.now(),
  });
  await updateDoc(doc(db, 'listings', listing.id), { commentCount: increment(1) });
  await notify({ toUid: listing.sellerUid, actor: actorOf(profile), type: 'comment', title: 'New comment',
    body: `${profile.fullName}: ${text.trim().slice(0, 80)}`, listingId: listing.id });
}

export async function deleteComment(listingId, commentId) {
  await deleteDoc(doc(db, 'listings', listingId, 'comments', commentId));
  await updateDoc(doc(db, 'listings', listingId), { commentCount: increment(-1) });
}

export function subscribeComments(listingId, cb, onError) {
  return onSnapshot(collection(db, 'listings', listingId, 'comments'), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.createdAt - b.createdAt);
    cb(list);
  }, onError);
}
