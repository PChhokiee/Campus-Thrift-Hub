import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';

export default function ErrorBanner({ message, onRetry }) {
  const { styles } = useStyles(makeStyles);
  if (!message) return null;
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
      {onRetry ? <TouchableOpacity onPress={onRetry}><Text style={styles.retry}>Retry</Text></TouchableOpacity> : null}
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  wrap: { backgroundColor: c.dangerBg, borderRadius: radius.input, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  text: { color: c.danger, fontSize: fontSize.sm, flex: 1 },
  retry: { color: c.danger, fontWeight: '700', marginLeft: 12 },
});
