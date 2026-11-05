import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { addComment, deleteComment, subscribeComments } from '@/services/listingService';
import { showError } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage, timeAgo } from '@/lib/utils';
import { AppButton, AppInput, MenuSheet } from '@/components/common';
import ReportSheet from './ReportSheet';

export default function CommentsSection({ listing }) {
  const { styles, colors } = useStyles(makeStyles);
  const { profile, isAdmin } = useAuth();
  const { hiddenUids } = useData();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [menuFor, setMenuFor] = useState(null);
  const [reportFor, setReportFor] = useState(null);

  useEffect(() => subscribeComments(listing.id, setComments, () => {}), [listing.id]);

  const visible = comments.filter((c) => !hiddenUids.has(c.authorUid));

  const post = async () => {
    if (text.trim().length < 1) return;
    setBusy(true);
    try { await addComment(listing, profile, text); setText(''); } catch (e) { showError(errorMessage(e)); } finally { setBusy(false); }
  };

  const remove = async (c) => {
    if (await confirmDialog({ title: 'Delete comment?', confirmText: 'Delete', destructive: true })) {
      try { await deleteComment(listing.id, c.id); } catch (e) { showError(errorMessage(e)); }
    }
  };

  const actionsFor = (c) => {
    const acts = [];
    if (c.authorUid !== profile.uid) {
      acts.push({ label: 'Report comment', icon: 'flag-outline', onPress: () => setReportFor({ type: 'comment', id: c.id, ownerUid: c.authorUid, listingId: listing.id, label: c.text }) });
    }
    if (c.authorUid === profile.uid || listing.sellerUid === profile.uid || isAdmin) {
      acts.push({ label: 'Delete comment', icon: 'trash-outline', destructive: true, onPress: () => remove(c) });
    }
    return acts;
  };

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.h}>Comments & questions ({visible.length})</Text>
      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <AppInput value={text} onChangeText={setText} placeholder="Ask a question or leave a comment…" maxLength={300} />
        </View>
        <AppButton title="Post" small onPress={post} loading={busy} disabled={!text.trim()} style={{ marginBottom: 14, marginLeft: 8 }} />
      </View>
      {visible.length === 0 ? <Text style={styles.empty}>No comments yet. Be the first to ask something.</Text> : null}
      {visible.map((c) => (
        <View key={c.id} style={styles.comment}>
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{c.authorName}{c.authorUid === listing.sellerUid ? ' · Seller' : ''} <Text style={styles.time}>{timeAgo(c.createdAt)}</Text></Text>
            <Text style={styles.body}>{c.text}</Text>
          </View>
          {actionsFor(c).length ? (
            <TouchableOpacity onPress={() => setMenuFor(c)} hitSlop={10} accessibilityLabel="Comment options">
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
      <MenuSheet visible={!!menuFor} onClose={() => setMenuFor(null)} title="Comment" actions={menuFor ? actionsFor(menuFor) : []} />
      <ReportSheet visible={!!reportFor} onClose={() => setReportFor(null)} target={reportFor} />
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  h: { fontSize: fontSize.lg, fontWeight: '800', color: c.text, marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start' },
  empty: { color: c.muted, fontSize: fontSize.sm, marginBottom: 8 },
  comment: { flexDirection: 'row', backgroundColor: c.card, borderRadius: radius.input, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: c.border },
  author: { fontSize: fontSize.sm, fontWeight: '700', color: c.text },
  time: { fontWeight: '400', color: c.muted },
  body: { fontSize: fontSize.md, color: c.text, marginTop: 4 },
});
