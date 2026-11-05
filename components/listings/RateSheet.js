import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { fontSize } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { submitRating } from '@/services/ratingService';
import { showError, showSuccess } from '@/store/toastStore';
import { errorMessage } from '@/lib/utils';
import { AppButton, AppInput, BottomSheet, RatingStars } from '@/components/common';

export default function RateSheet({ visible, onClose, order }) {
  const { styles } = useStyles(makeStyles);
  const { profile } = useAuth();
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!order) return;
    setBusy(true);
    try {
      await submitRating({ order, stars, review, profile });
      showSuccess('Thanks for your rating!');
      setReview(''); setStars(5);
      onClose();
    } catch (e) {
      showError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Rate this deal">
      <Text style={styles.sub}>{order ? `"${order.listingTitle}" from ${order.sellerName}` : ''}</Text>
      <RatingStars value={stars} size={36} onChange={setStars} />
      <AppInput label="Short review (optional)" value={review} onChangeText={setReview} multiline maxLength={300}
        placeholder="How was the item and the seller?" style={{ marginTop: 14 }} />
      <AppButton title="Submit rating" onPress={submit} loading={busy} />
    </BottomSheet>
  );
}
const makeStyles = (c) => StyleSheet.create({ sub: { color: c.muted, fontSize: fontSize.sm, marginBottom: 12 } });
