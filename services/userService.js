import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}

export async function updateMyProfile(uid, patch) {
  await updateDoc(doc(db, 'users', uid), patch);
}

export async function blockUser(myUid, otherUid) {
  await updateDoc(doc(db, 'users', myUid), { blockedUids: arrayUnion(otherUid) });
}
export async function unblockUser(myUid, otherUid) {
  await updateDoc(doc(db, 'users', myUid), { blockedUids: arrayRemove(otherUid) });
}

export async function setNotificationPref(uid, type, enabled) {
  await updateDoc(doc(db, 'users', uid), { [`notificationPrefs.${type}`]: enabled });
}
