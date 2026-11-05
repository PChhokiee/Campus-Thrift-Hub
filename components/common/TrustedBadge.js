import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';

export default function TrustedBadge({ compact }) {
  const { styles, colors } = useStyles(makeStyles);
  return (
    <View style={styles.badge} accessibilityLabel="Trusted seller">
      <Ionicons name="shield-checkmark" size={compact ? 12 : 14} color={colors.secondary} />
      {!compact && <Text style={styles.text}>Trusted Seller</Text>}
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.badgeBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { marginLeft: 4, fontSize: fontSize.xs, fontWeight: '700', color: c.secondary },
});
