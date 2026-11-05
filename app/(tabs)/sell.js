import React from 'react';
import { Screen, ScreenHeader } from '@/components/common';
import ListingForm from '@/components/listings/ListingForm';

export default function Sell() {
  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Sell an item" />
      <ListingForm />
    </Screen>
  );
}
