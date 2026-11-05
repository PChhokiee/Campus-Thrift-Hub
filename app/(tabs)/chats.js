import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, CountBadge, EmptyState, Screen, ScreenHeader } from '@/components/common';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { timeAgo } from '@/lib/utils';

export default function Chats() {
  const { styles } = useStyles(makeStyles);
  const router = useRouter();
  const { user } = useAuth();
  const { chats } = useData();

  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Chats" />
      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyState icon="chatbubbles-outline" title="No conversations yet" message="Open an item and tap “Message Seller” to start chatting." />
          </View>
        }
        renderItem={({ item }) => {
          const iAmBuyer = item.buyerUid === user.uid;
          const otherName = iAmBuyer ? item.sellerName : item.buyerName;
          const unread = (item.unread && item.unread[user.uid]) || 0;
          return (
            <TouchableOpacity style={styles.row} onPress={() => router.push(`/chat/${item.id}`)} accessibilityRole="button">
              <Avatar name={otherName} size={48} />
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={styles.name} numberOfLines={1}>{otherName}</Text>
                <Text style={styles.item} numberOfLines={1}>{item.listingTitle}</Text>
                <Text style={[styles.last, unread > 0 && styles.lastUnread]} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.time}>{timeAgo(item.lastMessageAt)}</Text>
                <CountBadge count={unread} style={{ marginTop: 6 }} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: radius.card, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: c.border },
  name: { fontSize: fontSize.md, fontWeight: '800', color: c.text },
  item: { fontSize: fontSize.xs, color: c.primary, fontWeight: '600', marginTop: 1 },
  last: { fontSize: fontSize.sm, color: c.muted, marginTop: 3 },
  lastUnread: { color: c.text, fontWeight: '700' },
  time: { fontSize: fontSize.xs, color: c.muted },
});
