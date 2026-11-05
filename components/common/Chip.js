import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';

export default function Chip({ label, selected, onPress, style }) {
  const { styles } = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected, style]} accessibilityRole="button" accessibilityState={{ selected: !!selected }}>
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}
const makeStyles = (c) => StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, marginRight: 8, marginBottom: 8 },
  selected: { backgroundColor: c.primary, borderColor: c.primary },
  text: { fontSize: fontSize.sm, color: c.text, fontWeight: '600' },
  textSelected: { color: c.onPrimary },
});
