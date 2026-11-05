import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, Screen, ScreenHeader } from '@/components/common';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useData } from '@/hooks/useData';
import { markAllNotificationsRead, markNotificationRead } from '@/services/notificationService';
import { timeAgo } from '@/lib/utils';

const ICONS = {
  like: 'heart', save: 'bookmark', rating: 'star', comment: 'chatbubble', message: 'chatbubbles',
  priceDrop: 'trending-down', sold: 'checkmark-done', order: 'receipt',
};

export default function Notifications() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const { notifications, unreadNotifs } = useData();

  const open = async (n) => {
    if (!n.read) markNotificationRead(n.id).catch(() => {});
    if (n.chatId) router.push(`/chat/${n.chatId}`);
    else if (n.orderId) router.push(`/orders/${n.orderId}`);
    else if (n.listingId) router.push(`/item/${n.listingId}`);
  };

  return (
    <Screen>
      <ScreenHeader title="Notifications" onBack={() => router.back()}
        right={unreadNotifs ? <TouchableOpacity onPress={() => markAllNotificationsRead(notifications).catch(() => {})} style={{ padding: 8 }}><Text style={styles.markAll}>Read all</Text></TouchableOpacity> : null} />
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center' }}><EmptyState icon="notifications-off-outline" title="No notifications yet" message="Likes, saves, ratings, comments, messages and price drops show up here." /></View>}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, !item.read && styles.unread]} onPress={() => open(item)} accessibilityRole="button">
            <View style={styles.icon}><Ionicons name={ICONS[item.type] || 'notifications'} size={20} color={colors.primary} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            </View>
            {!item.read ? <View style={styles.dot} /> : null}
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  markAll: { color: c.primary, fontWeight: '700', fontSize: fontSize.sm },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 12, marginBottom: 10 },
  unread: { borderColor: c.primary },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.badgeBg, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.md, fontWeight: '800', color: c.text },
  body: { fontSize: fontSize.sm, color: c.muted, marginTop: 2 },
  time: { fontSize: fontSize.xs, color: c.muted, marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary, marginLeft: 8 },
});
