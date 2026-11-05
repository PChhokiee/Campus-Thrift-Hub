import { AppButton, AppInput, BottomSheet, RatingStars } from '@/components/common';
import { fontSize } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useStyles } from '@/hooks/useStyles';
import { errorMessage } from '@/lib/utils';
import { getMyRating, submitRating } from '@/services/ratingService';
import { showError, showSuccess } from '@/store/toastStore';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

/** listing = { id, title, sellerUid, sellerName }. order is optional. */
export default function RateSheet({ visible, onClose, listing, order }) {
  const { styles } = useStyles(makeStyles);
  const { profile } = useAuth();
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');
  const [existing, setExisting] = useState(false);
  const [busy, setBusy] = useState(false);

  // when opened, load my previous rating of this listing (so I can change it)
  useEffect(() => {
    if (!visible || !listing || !profile) return;
    getMyRating(listing.id, profile.uid)
      .then((r) => {
        if (r) { setStars(r.stars); setReview(r.review || ''); setExisting(true); }
        else { setStars(5); setReview(''); setExisting(false); }
      })
      .catch(() => {});
  }, [visible, listing && listing.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!listing) return;
    setBusy(true);
    try {
      await submitRating({ listing, order, stars, review, profile });
      showSuccess(existing ? 'Rating updated' : 'Thanks for your rating!');
      onClose();
    } catch (e) {
      showError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={existing ? 'Update your rating' : 'Rate this item'}>
      <Text style={styles.sub}>{listing ? `"${listing.title}" from ${listing.sellerName}` : ''}</Text>
      <RatingStars value={stars} size={36} onChange={setStars} />
      <AppInput label="Short review (optional)" value={review} onChangeText={setReview} multiline maxLength={300}
        placeholder="How was the item and the seller?" style={{ marginTop: 14 }} />
      <AppButton title={existing ? 'Update rating' : 'Submit rating'} onPress={submit} loading={busy} />
    </BottomSheet>
  );
}
const makeStyles = (c) => StyleSheet.create({ sub: { color: c.muted, fontSize: fontSize.sm, marginBottom: 12 } });