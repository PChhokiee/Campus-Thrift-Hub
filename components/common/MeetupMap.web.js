import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';

// Web has no native map: show a note, the list below is the fallback (as in the proposal).
export default function MeetupMap() {
  const { styles } = useStyles(makeStyles);
  return <View style={styles.box}><Text style={styles.note}>The interactive map is available in the Android and iOS apps. Use the list below on web.</Text></View>;
}
const makeStyles = (c) => StyleSheet.create({
  box: { borderRadius: radius.card, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, padding: 16 },
  note: { color: c.muted, fontSize: fontSize.sm, textAlign: 'center' },
});
