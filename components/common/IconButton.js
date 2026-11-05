import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import CountBadge from './CountBadge';

export default function IconButton({ icon, onPress, badge, color, size = 24, label }) {
  const { styles, colors } = useStyles(makeStyles);
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn} accessibilityRole="button" accessibilityLabel={label || icon} hitSlop={6}>
      <Ionicons name={icon} size={size} color={color || colors.text} />
      {badge ? <View style={styles.badge}><CountBadge count={badge} /></View> : null}
    </TouchableOpacity>
  );
}
const makeStyles = () => StyleSheet.create({
  btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 2, right: 0 },
});
