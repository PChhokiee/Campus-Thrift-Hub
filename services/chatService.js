import { addDoc, collection, doc, getDoc, increment, limit, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notify } from '@/services/notificationService';
import { MEETUP_POINTS } from '@/constants/campus';

export const chatIdFor = (listingId, buyerUid) => `${listingId}_${buyerUid}`;
export function parseChatId(chatId) {
  const i = chatId.lastIndexOf('_');
  return { listingId: chatId.slice(0, i), buyerUid: chatId.slice(i + 1) };
}

/**
 * Sends a message. The chat document is created on the buyer's first message.
 * Throws if a user tries to message themselves or someone blocked.
 */
export async function sendMessage({ chatId, listing, me, text, type = 'text', meetup = null, hiddenUids }) {
  const isSeller = me.uid === listing.sellerUid;
  const { buyerUid } = parseChatId(chatId);
  const otherUid = isSeller ? buyerUid : listing.sellerUid;
  if (!otherUid || otherUid === me.uid) throw new Error("You can't message yourself about your own listing.");
  if (hiddenUids && hiddenUids.has(otherUid)) throw new Error("You can't message this user.");

  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) {
    if (isSeller) throw new Error('Wait for the buyer to start the conversation.');
    await setDoc(chatRef, {
      id: chatId, listingId: listing.id, listingTitle: listing.title,
      buyerUid: me.uid, buyerName: me.fullName, sellerUid: listing.sellerUid, sellerName: listing.sellerName,
      participants: [me.uid, listing.sellerUid], lastMessage: '', lastMessageAt: 0,
      unread: { [me.uid]: 0, [listing.sellerUid]: 0 },
    });
  }
  const now = Date.now();
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderUid: me.uid, senderName: me.fullName, text, type, meetup, createdAt: now,
  });
  const preview = type === 'meetup' ? '📍 Meetup suggestion' : text.slice(0, 80);
  await updateDoc(chatRef, { lastMessage: preview, lastMessageAt: now, [`unread.${otherUid}`]: increment(1) });
  await notify({ toUid: otherUid, actor: { uid: me.uid, name: me.fullName }, type: 'message', title: me.fullName,
    body: `${preview} · ${listing.title}`, chatId, listingId: listing.id });
}

export async function markChatRead(chatId, uid) {
  await updateDoc(doc(db, 'chats', chatId), { [`unread.${uid}`]: 0 });
}

export function subscribeMessages(chatId, cb, onError) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'desc'), limit(200));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

/** The other participant accepts or declines a suggested meetup. */
export async function respondToMeetup({ chatId, message, status, me, listing }) {
  await updateDoc(doc(db, 'chats', chatId, 'messages', message.id), { meetup: { ...message.meetup, status } });
  const point = MEETUP_POINTS.find((p) => p.id === message.meetup.pointId);
  await notify({ toUid: message.senderUid, actor: { uid: me.uid, name: me.fullName }, type: 'message',
    title: status === 'accepted' ? 'Meetup accepted' : 'Meetup declined',
    body: `${me.fullName} ${status} the meetup at ${point ? point.name : 'the suggested point'}.`, chatId, listingId: listing ? listing.id : null });
}
