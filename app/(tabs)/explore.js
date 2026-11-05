import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, Chip, CountBadge, EmptyState, ErrorBanner, LoadingView, Screen } from '@/components/common';
import FilterSheet from '@/components/listings/FilterSheet';
import ListingGrid from '@/components/listings/ListingGrid';
import { CATEGORY_FILTERS, SORT_OPTIONS } from '@/constants/campus';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useData } from '@/hooks/useData';
import { useFilterStore } from '@/store/filterStore';
import { countSheetFilters, filterAndSort } from '@/lib/filters';

export default function Explore() {
  const { styles, colors } = useStyles(makeStyles);
  const { listings, loaded, error } = useData();
  const { filters, sort, setFilters, setSort, reset } = useFilterStore();
  const [sheet, setSheet] = useState(false);

  const results = useMemo(() => filterAndSort(listings, filters, sort), [listings, filters, sort]);
  const sheetCount = countSheetFilters(filters);
  const anyFilter = sheetCount > 0 || filters.query || filters.category !== 'All';

  const header = (
    <View>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            style={styles.input}
            value={filters.query}
            onChangeText={(t) => setFilters({ query: t })}
            placeholder="Search title, description, category…"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            autoCorrect={false}
          />
          {filters.query ? (
            <TouchableOpacity onPress={() => setFilters({ query: '' })} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setSheet(true)} accessibilityLabel="Open filters">
          <Ionicons name="options-outline" size={22} color={colors.onPrimary} />
          {sheetCount ? <CountBadge count={sheetCount} style={styles.filterBadge} /> : null}
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CATEGORY_FILTERS.map((c) => <Chip key={c} label={c} selected={filters.category === c} onPress={() => setFilters({ category: c })} />)}
        <Chip label="Trusted sellers" selected={filters.trustedOnly} onPress={() => setFilters({ trustedOnly: !filters.trustedOnly })} />
        <Chip label="Free" selected={filters.freeOnly} onPress={() => setFilters({ freeOnly: !filters.freeOnly })} />
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {SORT_OPTIONS.map((o) => <Chip key={o.key} label={o.label} selected={sort === o.key} onPress={() => setSort(o.key)} />)}
      </ScrollView>

      <ErrorBanner message={error} />
      <View style={styles.countRow}>
        <Text style={styles.count}>{results.length} {results.length === 1 ? 'item' : 'items'}</Text>
        {anyFilter ? <TouchableOpacity onPress={reset} hitSlop={8}><Text style={styles.clear}>Clear all</Text></TouchableOpacity> : null}
      </View>
    </View>
  );

  return (
    <Screen edges={['top']}>
      {!loaded ? <LoadingView message="Loading listings…" /> : (
        <ListingGrid
          data={results}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <EmptyState icon="search-outline" title="No items found" message="Try different keywords or clear some filters."
              actionLabel={anyFilter ? 'Clear filters' : undefined} onAction={anyFilter ? reset : undefined} />
          }
        />
      )}
      <FilterSheet visible={sheet} onClose={() => setSheet(false)} filters={filters} onApply={setFilters} />
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, gap: 10 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, minHeight: 48 },
  input: { flex: 1, marginLeft: 8, fontSize: fontSize.md, color: c.text, minHeight: 46 },
  filterBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: c.secondary },
  chips: { paddingHorizontal: 16, paddingTop: 12, alignItems: 'center' },
  sortLabel: { fontSize: fontSize.sm, color: c.muted, marginRight: 8, marginBottom: 8, fontWeight: '700' },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 6, marginBottom: 12 },
  count: { fontSize: fontSize.sm, color: c.muted },
  clear: { fontSize: fontSize.sm, color: c.primary, fontWeight: '700' },
});
