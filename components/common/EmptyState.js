import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { fontSize } from '@/constants/theme';
import AppButton from './AppButton';

export default function EmptyState({ icon = 'leaf-outline', title, message, actionLabel, onAction }) {
  const { styles, colors } = useStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={48} color={colors.secondary} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.msg}>{message}</Text> : null}
      {actionLabel && onAction ? <AppButton title={actionLabel} onPress={onAction} style={{ marginTop: 16 }} /> : null}
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { marginTop: 12, fontSize: fontSize.lg, fontWeight: '700', color: c.text, textAlign: 'center' },
  msg: { marginTop: 6, fontSize: fontSize.md, color: c.muted, textAlign: 'center' },
});
