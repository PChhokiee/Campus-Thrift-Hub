import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { toImageSource } from '@/lib/utils';

export default function ImageGallery({ images, fallback }) {
  const { styles, colors } = useStyles(makeStyles);
  const { width } = useWindowDimensions();
  const w = Math.min(width, 640);
  const [index, setIndex] = useState(0);
  const list = images && images.length ? images : fallback ? [fallback] : [];
  const h = Math.round(w * 0.85);

  if (!list.length) {
    return <View style={[styles.empty, { width: w, height: h }]}><Ionicons name="image-outline" size={48} color={colors.muted} /></View>;
  }
  return (
    <View style={{ width: w, alignSelf: 'center' }}>
      <FlatList
        data={list}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / w))}
        renderItem={({ item }) => <Image source={toImageSource(item)} style={{ width: w, height: h }} resizeMode="cover" />}
      />
      {list.length > 1 ? (
        <View style={styles.dots}>
          {list.map((_, i) => <View key={i} style={[styles.dot, i === index && styles.dotOn]} />)}
        </View>
      ) : null}
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  empty: { alignSelf: 'center', backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, marginHorizontal: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  dotOn: { backgroundColor: '#fff', width: 9, height: 9, borderRadius: 5 },
});
