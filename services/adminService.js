import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizeListing } from '@/lib/normalize';
import { syncSellerStats } from '@/services/ratingService';

export async function listAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() })).sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
}

export async function listAllListings() {
  const snap = await getDocs(collection(db, 'listings'));
  return snap.docs.map((d) => normalizeListing(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt);
}

export const setSuspended = (uid, suspended) => updateDoc(doc(db, 'users', uid), { suspended });

/** Manual Trusted Seller flag (the proposal's fallback when automatic badges are not used). */
export const setManualTrusted = (uid, on) => updateDoc(doc(db, 'users', uid), { trustedManual: on, trusted: on });

export const recalcTrust = (uid) => syncSellerStats(uid);

export const setListingFlagged = (id, flagged) => updateDoc(doc(db, 'listings', id), { flagged });
export const setListingRemoved = (id, removed) => updateDoc(doc(db, 'listings', id), { removed });
