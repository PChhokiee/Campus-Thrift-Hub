import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

// Admin routes are protected: normal users are sent back to Home.
export default function AdminLayout() {
  const { isAdmin } = useAuth();
  const { colors } = useTheme();
  if (!isAdmin) return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
