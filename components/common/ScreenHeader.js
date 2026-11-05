import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { fontSize } from '@/constants/theme';
import IconButton from './IconButton';

export default function ScreenHeader({ title, subtitle, onBack, right }) {
  const { styles } = useStyles(makeStyles);
  return (
    <View style={styles.row}>
      <View style={styles.side}>{onBack ? <IconButton icon="chevron-back" size={26} onPress={onBack} label="Go back" /> : null}</View>
      <View style={styles.mid}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, minHeight: 52 },
  side: { width: 48 },
  mid: { flex: 1, alignItems: 'center' },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: c.text },
  sub: { fontSize: fontSize.xs, color: c.muted, marginTop: 1 },
});
