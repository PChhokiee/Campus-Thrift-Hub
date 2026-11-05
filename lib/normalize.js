// Converts Firestore documents into clean objects. Also reads OLD Android-app listings
// (fields: name, imageBase64, sellerId...) so existing data keeps showing.
const millis = (v) => (typeof v === 'number' ? v : v && typeof v.toMillis === 'function' ? v.toMillis() : 0);

export function normalizeListing(id, d) {
  const legacyImg = d.imageBase64 || (Array.isArray(d.images) && d.images[0]) || null;
  return {
    id,
    title: d.title ?? d.name ?? 'Untitled',
    description: d.description ?? '',
    category: d.category ?? '',
    condition: d.condition ?? 'Good condition',
    price: Number(d.price) || 0,
    location: d.location ?? 'On campus',
    thumb: d.thumb ?? legacyImg,
    imageCount: d.imageCount ?? (legacyImg ? 1 : 0),
    contactMethod: d.contactMethod ?? 'chat',
    status: d.status ?? (d.sold ? 'sold' : 'available'),
    sellerUid: d.sellerUid ?? d.sellerId ?? d.userId ?? d.uid ?? '',
    sellerName: d.sellerName ?? d.userName ?? 'Student',
    sellerTrusted: !!d.sellerTrusted,
    sellerRatingAvg: Number(d.sellerRatingAvg) || 0,
    likeCount: Math.max(0, Number(d.likeCount) || 0),
    commentCount: Math.max(0, Number(d.commentCount) || 0),
    ratingAvg: Number(d.ratingAvg) || 0,
    ratingCount: Number(d.ratingCount) || 0,
    flagged: !!d.flagged,
    removed: !!d.removed,
    createdAt: millis(d.createdAt ?? d.timestamp),
  };
}

export const docToObj = (snap) => ({ id: snap.id, ...snap.data() });
