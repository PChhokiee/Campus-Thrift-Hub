import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';

const LABELS = {
  available: 'Available', reserved: 'Reserved', sold: 'Sold',
  requested: 'Requested', accepted: 'Accepted', declined: 'Declined', cancelled: 'Cancelled', completed: 'Completed',
  open: 'Open', upheld: 'Upheld', dismissed: 'Dismissed',
};

export default function StatusPill({ status }) {
  const { styles, colors } = useStyles(makeStyles);
  const tone =
    ['available', 'accepted', 'completed', 'upheld'].includes(status) ? colors.secondary
    : ['reserved', 'requested', 'open'].includes(status) ? colors.warning
    : ['declined', 'cancelled'].includes(status) ? colors.danger
    : colors.muted;
  return (
    <View style={[styles.pill, { borderColor: tone }]}>
      <Text style={[styles.text, { color: tone }]}>{LABELS[status] || status}</Text>
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  pill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 2, backgroundColor: c.card },
  text: { fontSize: fontSize.xs, fontWeight: '700' },
});
