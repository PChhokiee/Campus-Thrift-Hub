import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, IconButton, LoadingView, MenuSheet, Screen, ScreenHeader } from '@/components/common';
import MessageBubble from '@/components/chat/MessageBubble';
import MeetupSheet from '@/components/chat/MeetupSheet';
import ReportSheet from '@/components/listings/ReportSheet';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useParam } from '@/hooks/useParam';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { getListing } from '@/services/listingService';
import { markChatRead, parseChatId, respondToMeetup, sendMessage, subscribeMessages } from '@/services/chatService';
import { blockUser } from '@/services/userService';
import { showError, showSuccess } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage } from '@/lib/utils';

export default function ChatScreen() {
  const { styles, colors } = useStyles(makeStyles);
  const chatId = useParam('chatId');
  const router = useRouter();
  const { user, profile } = useAuth();
  const { chats, listingsById, hiddenUids, loaded } = useData();
  const { listingId, buyerUid } = parseChatId(chatId || '_');

  const [fetched, setFetched] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [menu, setMenu] = useState(false);
  const [meetup, setMeetup] = useState(false);
  const [report, setReport] = useState(null);

  const listing = listingsById[listingId] || fetched;
  const chat = chats.find((c) => c.id === chatId);

  useEffect(() => {
    if (!listingsById[listingId] && loaded && !fetched) getListing(listingId).then(setFetched).catch(() => {});
  }, [listingId, listingsById, loaded, fetched]);

  useEffect(() => {
    if (!chatId) return undefined;
    return subscribeMessages(chatId, setMessages, () => setMessages([])); // no chat yet -> permission error -> empty list
  }, [chatId]);

  const unread = chat && chat.unread ? chat.unread[user.uid] || 0 : 0;
  useEffect(() => { if (unread > 0) markChatRead(chatId, user.uid).catch(() => {}); }, [unread, chatId, user.uid]);

  const info = useMemo(() => {
    if (!listing) return null;
    const iAmSeller = user.uid === listing.sellerUid;
    const otherUid = iAmSeller ? buyerUid : listing.sellerUid;
    const otherName = chat ? (iAmSeller ? chat.buyerName : chat.sellerName) : iAmSeller ? 'Buyer' : listing.sellerName;
    return { iAmSeller, otherUid, otherName };
  }, [listing, chat, user.uid, buyerUid]);

  if (!listing || !info) return <LoadingView message="Opening chat…" />;

  const selfChat = info.otherUid === user.uid;
  const blocked = hiddenUids.has(info.otherUid);

  const send = async (payload) => {
    setSending(true);
    try {
      await sendMessage({ chatId, listing, me: profile, hiddenUids, ...payload });
      if (payload.type !== 'meetup') setText('');
    } catch (e) { showError(errorMessage(e)); } finally { setSending(false); }
  };

  const respond = async (message, status) => {
    try { await respondToMeetup({ chatId, message, status, me: profile, listing }); } catch (e) { showError(errorMessage(e)); }
  };

  const block = async () => {
    if (!(await confirmDialog({ title: `Block ${info.otherName}?`, message: "You won't be able to message each other.", confirmText: 'Block', destructive: true }))) return;
    try { await blockUser(user.uid, info.otherUid); showSuccess('User blocked'); router.back(); } catch (e) { showError(errorMessage(e)); }
  };

  const actions = [
    { label: 'View listing', icon: 'pricetag-outline', onPress: () => router.push(`/item/${listing.id}`) },
    { label: `View ${info.otherName}'s profile`, icon: 'person-outline', onPress: () => router.push(`/profile/${info.otherUid}`) },
    { label: 'Report user', icon: 'flag-outline', onPress: () => setReport({ type: 'user', id: info.otherUid, ownerUid: info.otherUid, label: info.otherName }) },
    { label: 'Block user', icon: 'ban-outline', destructive: true, onPress: block },
  ];

  if (selfChat) {
    return <Screen><ScreenHeader title="Chat" onBack={() => router.back()} /><EmptyState icon="information-circle-outline" title="This is your own listing" message="You can't message yourself. Buyers' chats appear in the Chats tab." actionLabel="Go back" onAction={() => router.back()} /></Screen>;
  }

  return (
    <Screen>
      <ScreenHeader title={info.otherName} subtitle={listing.title} onBack={() => router.back()} right={<IconButton icon="ellipsis-horizontal" onPress={() => setMenu(true)} label="Chat options" />} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={messages}
          inverted
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingVertical: 10, flexGrow: 1 }}
          ListEmptyComponent={<View style={{ transform: [{ scaleY: -1 }], flex: 1, justifyContent: 'center' }}><EmptyState icon="chatbubble-ellipses-outline" title="Say hello 👋" message={`Ask ${info.otherName} about "${listing.title}". Never share your phone number or pay in advance.`} /></View>}
          renderItem={({ item }) => <MessageBubble message={item} mine={item.senderUid === user.uid} onRespond={respond} />}
        />
        {blocked ? (
          <Text style={styles.blocked}>You can't message this user.</Text>
        ) : (
          <View style={styles.composer}>
            <IconButton icon="location-outline" color={colors.primary} onPress={() => setMeetup(true)} label="Suggest meetup" />
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message…"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.send, (!text.trim() || sending) && { opacity: 0.4 }]}
              disabled={!text.trim() || sending}
              onPress={() => send({ text: text.trim(), type: 'text' })}
              accessibilityLabel="Send message"
            >
              <Ionicons name="send" size={20} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
      <MenuSheet visible={menu} onClose={() => setMenu(false)} title={info.otherName} actions={actions} />
      <MeetupSheet visible={meetup} onClose={() => setMeetup(false)} onSend={(m) => send({ text: '', type: 'meetup', meetup: m })} />
      <ReportSheet visible={!!report} onClose={() => setReport(null)} target={report} />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  composer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 6, paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, backgroundColor: c.background },
  input: { flex: 1, maxHeight: 110, minHeight: 44, backgroundColor: c.surface, borderRadius: 22, borderWidth: 1, borderColor: c.border, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 11, fontSize: fontSize.md, color: c.text },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  blocked: { textAlign: 'center', color: c.muted, padding: 16, backgroundColor: c.card, borderRadius: radius.input, margin: 12 },
});
