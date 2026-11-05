import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { initials, toImageSource } from '@/lib/utils';

export default function Avatar({ uri, name = '', size = 44 }) {
  const { styles, colors } = useStyles(makeStyles);
  const src = toImageSource(uri);
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (src) return <Image source={src} style={[styles.img, box]} />;
  return (
    <View style={[styles.ph, box]}>
      <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: size * 0.38 }}>{initials(name)}</Text>
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  img: { backgroundColor: c.card },
  ph: { backgroundColor: c.secondary, alignItems: 'center', justifyContent: 'center' },
});
