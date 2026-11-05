import React from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useActions } from '@/hooks/useActions';
import ListingCard from './ListingCard';

const GAP = 12;

/** Responsive grid: 2 columns on phones, 3-4 on tablets / web. */
export default function ListingGrid({ data, ListHeaderComponent, ListEmptyComponent, contentPadding = 16 }) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { isSaved, toggleSave } = useActions();
  const cols = width >= 1000 ? 4 : width >= 640 ? 3 : 2;
  const usable = Math.min(width, 1200) - contentPadding * 2 - GAP * (cols - 1);
  const itemWidth = Math.floor(usable / cols);

  return (
    <FlatList
      key={cols}
      data={data}
      keyExtractor={(i) => i.id}
      numColumns={cols}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      columnWrapperStyle={cols > 1 ? { gap: GAP, paddingHorizontal: contentPadding, marginBottom: GAP, alignSelf: 'center' } : undefined}
      contentContainerStyle={{ paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <ListingCard
          item={item}
          width={itemWidth}
          saved={isSaved(item.id)}
          onToggleSave={() => toggleSave(item)}
          onPress={() => router.push(`/item/${item.id}`)}
        />
      )}
      ItemSeparatorComponent={cols === 1 ? () => <View style={{ height: GAP }} /> : undefined}
    />
  );
}
