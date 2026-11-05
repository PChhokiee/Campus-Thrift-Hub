import React, { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Chip, EmptyState, ErrorBanner, IconButton, LoadingView, Screen, SectionHeader } from '@/components/common';
import ListingCard from '@/components/listings/ListingCard';
import { CATEGORY_FILTERS } from '@/constants/campus';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { useActions } from '@/hooks/useActions';
import { useFilterStore } from '@/store/filterStore';
import { Ionicons } from '@expo/vector-icons';

function Row({ data, onOpen }) {
  const { isSaved, toggleSave } = useActions();
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      renderItem={({ item }) => (
        <ListingCard item={item} width={160} saved={isSaved(item.id)} onToggleSave={() => toggleSave(item)} onPress={() => onOpen(item.id)} />
      )}
    />
  );
}

export default function Home() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const { profile } = useAuth();
  const { listings, loaded, error, unreadNotifs } = useData();
  const reset = useFilterStore((s) => s.reset);
  const setFilters = useFilterStore((s) => s.setFilters);
  const setSort = useFilterStore((s) => s.setSort);

  const open = (id) => router.push(`/item/${id}`);
  const goExplore = (filters, sort) => { reset(); if (filters) setFilters(filters); if (sort) setSort(sort); router.navigate('/explore'); };

  const sections = useMemo(() => {
    const avail = listings.filter((l) => l.status !== 'sold');
    return {
      newest: [...avail].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10),
      top: avail.filter((l) => l.ratingCount > 0).sort((a, b) => (b.ratingAvg - a.ratingAvg) || (b.ratingCount - a.ratingCount)).slice(0, 10),
      free: avail.filter((l) => l.price === 0).slice(0, 10),
      trusted: avail.filter((l) => l.sellerTrusted).slice(0, 10),
    };
  }, [listings]);

  const first = (profile?.fullName || 'there').split(' ')[0];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.navigate('/profile')} accessibilityLabel="Open profile">
            <Avatar uri={profile?.profilePicBase64} name={profile?.fullName} size={44} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.hello}>Hi, {first} 👋</Text>
            <Text style={styles.sub}>Find something you'll love</Text>
          </View>
          <IconButton icon="notifications-outline" badge={unreadNotifs} onPress={() => router.push('/notifications')} label="Notifications" />
        </View>

        <TouchableOpacity style={styles.search} onPress={() => goExplore()} accessibilityRole="search" accessibilityLabel="Search items">
          <Ionicons name="search" size={20} color={colors.muted} />
          <Text style={styles.searchText}>Search books, electronics, furniture…</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14 }}>
          {CATEGORY_FILTERS.filter((c) => c !== 'All').map((c) => <Chip key={c} label={c} onPress={() => goExplore({ category: c })} />)}
        </ScrollView>

        <ErrorBanner message={error} />
        {!loaded ? <View style={{ height: 240 }}><LoadingView message="Loading listings…" /></View> : null}
        {loaded && listings.length === 0 ? (
          <EmptyState icon="pricetags-outline" title="No listings yet." message="Be the first to sell something on campus!" actionLabel="+ Sell an item" onAction={() => router.navigate('/sell')} />
        ) : null}

        {sections.newest.length ? (
          <>
            <SectionHeader title="Newest" actionLabel="See all" onAction={() => goExplore(null, 'newest')} />
            <Row data={sections.newest} onOpen={open} />
          </>
        ) : null}
        {sections.top.length ? (
          <>
            <SectionHeader title="Top rated" actionLabel="See all" onAction={() => goExplore(null, 'topRated')} />
            <Row data={sections.top} onOpen={open} />
          </>
        ) : null}
        {sections.trusted.length ? (
          <>
            <SectionHeader title="From Trusted Sellers" actionLabel="See all" onAction={() => goExplore({ trustedOnly: true })} />
            <Row data={sections.trusted} onOpen={open} />
          </>
        ) : null}
        {sections.free.length ? (
          <>
            <SectionHeader title="Free stuff" actionLabel="See all" onAction={() => goExplore({ freeOnly: true })} />
            <Row data={sections.free} onOpen={open} />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  hello: { fontSize: fontSize.xl, fontWeight: '800', color: c.text },
  sub: { fontSize: fontSize.sm, color: c.muted },
  search: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, backgroundColor: c.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: c.border, paddingHorizontal: 16, minHeight: 48 },
  searchText: { marginLeft: 10, color: c.muted, fontSize: fontSize.md },
});
