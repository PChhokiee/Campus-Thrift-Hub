import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '@/store/toastStore';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';

// Global in-app banner (errors, success, and new-notification alerts).
export default function Toast() {
  const { styles, colors } = useStyles(makeStyles);
  const toast = useToastStore((s) => s.toast);
  const hide = useToastStore((s) => s.hide);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(hide, toast.type === 'error' ? 4500 : 3500);
    return () => clearTimeout(t);
  }, [toast, hide]);

  if (!toast) return null;
  const icon = toast.type === 'error' ? 'alert-circle' : toast.type === 'success' ? 'checkmark-circle' : 'notifications';
  const tone = toast.type === 'error' ? colors.danger : toast.type === 'success' ? colors.secondary : colors.primary;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.wrap, { top: insets.top + 8, borderLeftColor: tone }]}
      onPress={() => { hide(); if (toast.path) router.push(toast.path); }}
      accessibilityRole="alert"
    >
      <Ionicons name={icon} size={22} color={tone} />
      <Text style={styles.text} numberOfLines={3}>
        <Text style={{ fontWeight: '800' }}>{toast.title}</Text>
        {toast.body ? `\n${toast.body}` : ''}
      </Text>
    </TouchableOpacity>
  );
}
const makeStyles = (c, t) => StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, maxWidth: 600, alignSelf: 'center', zIndex: 100, flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.input, padding: 14, borderLeftWidth: 5, borderWidth: 1, borderColor: c.border, ...t.shadow },
  text: { flex: 1, marginLeft: 10, color: c.text, fontSize: fontSize.sm },
});
