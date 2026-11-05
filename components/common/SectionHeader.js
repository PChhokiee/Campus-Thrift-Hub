import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { fontSize } from '@/constants/theme';

export default function SectionHeader({ title, actionLabel, onAction }) {
  const { styles } = useStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? <TouchableOpacity onPress={onAction} hitSlop={8}><Text style={styles.action}>{actionLabel}</Text></TouchableOpacity> : null}
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10, paddingHorizontal: 16 },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: c.text },
  action: { fontSize: fontSize.sm, fontWeight: '700', color: c.primary },
});
