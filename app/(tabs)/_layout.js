import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/hooks/useData';

const icon = (name, nameOff) => ({ color, size, focused }) => <Ionicons name={focused ? name : nameOff} color={color} size={size} />;

export default function TabsLayout() {
  const { colors } = useTheme();
  const { unreadChats, pendingRequests } = useData();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.onPrimary },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: icon('search', 'search-outline') }} />
      <Tabs.Screen name="sell" options={{ title: 'Sell', tabBarIcon: icon('add-circle', 'add-circle-outline') }} />
      <Tabs.Screen name="chats" options={{ title: 'Chats', tabBarIcon: icon('chatbubbles', 'chatbubbles-outline'), tabBarBadge: unreadChats > 0 ? unreadChats : undefined }} />
      <Tabs.Screen name="favorites" options={{ title: 'Wishlist', tabBarIcon: icon('bookmark', 'bookmark-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person', 'person-outline'), tabBarBadge: pendingRequests > 0 ? pendingRequests : undefined }} />
    </Tabs>
  );
}
