import { addDoc, collection, deleteDoc, doc, getDocs, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/** target = { type: 'listing'|'comment'|'user', id, ownerUid, listingId? } */
export async function submitReport({ target, reason, details, profile }) {
  await addDoc(collection(db, 'reports'), {
    targetType: target.type, targetId: target.id, targetOwnerUid: target.ownerUid || '', listingId: target.listingId || null,
    label: target.label || '', reporterUid: profile.uid, reporterName: profile.fullName,
    reason, details: (details || '').trim(), status: 'open', createdAt: Date.now(),
  });
}

export async function listReports() {
  const snap = await getDocs(collection(db, 'reports'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt);
}

/** Admin decision. 'upheld' counts against the owner (affects Trusted Seller) and can remove the content. */
export async function resolveReport(report, decision, removeContent) {
  await updateDoc(doc(db, 'reports', report.id), { status: decision, resolvedAt: Date.now() });
  if (decision !== 'upheld') return;
  if (report.targetOwnerUid) {
    await updateDoc(doc(db, 'users', report.targetOwnerUid), { upheldReports: increment(1), trusted: false });
  }
  if (!removeContent) return;
  if (report.targetType === 'listing') await updateDoc(doc(db, 'listings', report.targetId), { removed: true });
  if (report.targetType === 'comment' && report.listingId) {
    await deleteDoc(doc(db, 'listings', report.listingId, 'comments', report.targetId));
  }
}
