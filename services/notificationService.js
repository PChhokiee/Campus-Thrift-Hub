import { addDoc, collection, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Creates an in-app notification for another user. Never throws: a failed
 * notification must not break the action that triggered it.
 * actor = { uid, name }
 */
export async function notify({ toUid, actor, type, title, body, listingId, chatId, orderId }) {
  try {
    if (!toUid || !actor || toUid === actor.uid) return;
    const snap = await getDoc(doc(db, 'users', toUid));
    const u = snap.exists() ? snap.data() : {};
    if (u.notificationPrefs && u.notificationPrefs[type] === false) return; // user switched this type off
    if ((u.blockedUids || []).includes(actor.uid)) return;
    await addDoc(collection(db, 'notifications'), {
      toUid, fromUid: actor.uid, type, title, body: body || '',
      listingId: listingId || null, chatId: chatId || null, orderId: orderId || null,
      read: false, createdAt: Date.now(),
    });
  } catch (e) {
    console.warn('[notify]', e && e.message);
  }
}

export async function markNotificationRead(id) {
  await updateDoc(doc(db, 'notifications', id), { read: true });
}

export async function markAllNotificationsRead(list) {
  const unread = list.filter((n) => !n.read).slice(0, 400);
  if (!unread.length) return;
  const batch = writeBatch(db);
  unread.forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
  await batch.commit();
}
