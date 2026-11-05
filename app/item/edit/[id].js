import React from 'react';
import { useRouter } from 'expo-router';
import { EmptyState, LoadingView, Screen, ScreenHeader } from '@/components/common';
import ListingForm from '@/components/listings/ListingForm';
import { useParam } from '@/hooks/useParam';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';

export default function EditItem() {
  const id = useParam('id');
  const router = useRouter();
  const { user } = useAuth();
  const { listingsById, loaded } = useData();
  const listing = listingsById[id];

  if (!loaded) return <LoadingView />;
  if (!listing || listing.sellerUid !== user.uid) {
    return (
      <Screen>
        <ScreenHeader title="Edit listing" onBack={() => router.back()} />
        <EmptyState icon="lock-closed-outline" title="You can only edit your own listings" actionLabel="Go back" onAction={() => router.back()} />
      </Screen>
    );
  }
  return (
    <Screen>
      <ScreenHeader title="Edit listing" onBack={() => router.back()} />
      <ListingForm listing={listing} />
    </Screen>
  );
}
