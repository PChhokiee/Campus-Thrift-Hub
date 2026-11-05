import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

export default function CountBadge({ count, style }) {
  const { styles } = useStyles(makeStyles);
  if (!count) return null;
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  badge: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  text: { color: c.onPrimary, fontSize: 11, fontWeight: '800' },
});
