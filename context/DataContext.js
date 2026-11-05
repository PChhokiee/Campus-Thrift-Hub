import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { collection, limit, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { normalizeListing } from '@/lib/normalize';
import { useToastStore } from '@/store/toastStore';

export const DataContext = createContext(null);

const EMPTY = {
  allListings: [], saved: {}, liked: new Set(), chats: [], notifications: [], blockedBy: [],
  buyerOrders: [], sellerOrders: [], loaded: false, error: null,
};

/**
 * One set of real-time Firestore listeners shared by the whole app (only active when the
 * user is signed in AND email-verified). Avoids queries that need composite indexes: filtering/sorting is done here.
 */
export function DataProvider({ children }) {
  const { user, verified, profile } = useAuth();
  const uid = user ? user.uid : null;
  const active = !!uid && verified;
  const [s, setS] = useState(EMPTY);
  const seenNotifs = useRef(null);

  useEffect(() => {
    if (!active) { setS(EMPTY); seenNotifs.current = null; return undefined; }
    const unsubs = [];
    const fail = (name) => (e) => {
      console.warn(`[data:${name}]`, e && e.message);
      setS((p) => ({ ...p, loaded: true, error: p.error || (e && e.code === 'permission-denied'
        ? 'Permission denied by Firestore. Publish the security rules from firestore.rules in the Firebase console.'
        : `Could not load data (${name}). Check your internet connection.`) }));
    };
    const listen = (q, name, handler) => unsubs.push(onSnapshot(q, handler, fail(name)));

    listen(query(collection(db, 'listings'), limit(300)), 'listings', (snap) =>
      setS((p) => ({ ...p, loaded: true, error: null, allListings: snap.docs.map((d) => normalizeListing(d.id, d.data())) })));
    listen(collection(db, 'users', uid, 'saved'), 'saved', (snap) => {
      const map = {}; snap.docs.forEach((d) => { map[d.id] = d.data(); });
      setS((p) => ({ ...p, saved: map }));
    });
    listen(collection(db, 'users', uid, 'likes'), 'likes', (snap) =>
      setS((p) => ({ ...p, liked: new Set(snap.docs.map((d) => d.id)) })));
    listen(query(collection(db, 'chats'), where('participants', 'array-contains', uid)), 'chats', (snap) =>
      setS((p) => ({ ...p, chats: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })));
    listen(query(collection(db, 'notifications'), where('toUid', '==', uid), limit(100)), 'notifications', (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt);
      if (seenNotifs.current === null) {
        seenNotifs.current = new Set(list.map((n) => n.id)); // baseline: don't toast old notifications
      } else {
        list.forEach((n) => {
          if (!seenNotifs.current.has(n.id)) {
            seenNotifs.current.add(n.id);
            if (!n.read) {
              const path = n.chatId ? `/chat/${n.chatId}` : n.orderId ? `/orders/${n.orderId}` : n.listingId ? `/item/${n.listingId}` : '/notifications';
              useToastStore.getState().show({ title: n.title, body: n.body, type: 'info', path });
            }
          }
        });
      }
      setS((p) => ({ ...p, notifications: list }));
    });
    listen(query(collection(db, 'users'), where('blockedUids', 'array-contains', uid)), 'blocks', (snap) =>
      setS((p) => ({ ...p, blockedBy: snap.docs.map((d) => d.id) })));
    listen(query(collection(db, 'orders'), where('buyerUid', '==', uid)), 'orders-buyer', (snap) =>
      setS((p) => ({ ...p, buyerOrders: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })));
    listen(query(collection(db, 'orders'), where('sellerUid', '==', uid)), 'orders-seller', (snap) =>
      setS((p) => ({ ...p, sellerOrders: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })));

    return () => unsubs.forEach((u) => u());
  }, [active, uid]);

  const value = useMemo(() => {
    const myBlocked = (profile && profile.blockedUids) || [];
    const hiddenUids = new Set([...myBlocked, ...s.blockedBy]); // blocked either way: can't see or message each other
    const listings = s.allListings.filter((l) => !l.removed && !hiddenUids.has(l.sellerUid));
    const listingsById = {};
    s.allListings.forEach((l) => { listingsById[l.id] = l; });
    const chats = s.chats
      .filter((c) => c.lastMessage && !c.participants.some((p) => p !== uid && hiddenUids.has(p)))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    const orders = [...s.buyerOrders, ...s.sellerOrders]
      .filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return {
      loaded: s.loaded, error: s.error,
      allListings: s.allListings, listings, listingsById, hiddenUids,
      saved: s.saved, liked: s.liked, chats, notifications: s.notifications, orders,
      unreadNotifs: s.notifications.filter((n) => !n.read).length,
      unreadChats: chats.reduce((n, c) => n + ((c.unread && c.unread[uid]) || 0), 0),
      pendingRequests: s.sellerOrders.filter((o) => o.status === 'requested').length,
    };
  }, [s, profile, uid]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
