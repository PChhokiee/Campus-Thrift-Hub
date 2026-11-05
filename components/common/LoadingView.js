import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

export default function LoadingView({ message }) {
  const { styles, colors } = useStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: c.background },
  msg: { marginTop: 12, color: c.muted },
});
