import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CAMPUS_LOCATIONS, CATEGORIES, CONDITIONS, CONTACT_METHODS } from '@/constants/campus';
import { MAX_IMAGES_PER_LISTING, CURRENCY } from '@/constants/config';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { createListing, getListingImages, updateListing } from '@/services/listingService';
import { pickImages } from '@/lib/images';
import { validateListing } from '@/lib/validation';
import { errorMessage, toImageSource } from '@/lib/utils';
import { showError, showSuccess } from '@/store/toastStore';
import { AppButton, AppInput, Chip, ErrorBanner, FormScroll, LoadingView } from '@/components/common';

// items: [{ full, thumb }]   thumb may be null for photos loaded from an existing listing
export default function ListingForm({ listing }) {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const { profile } = useAuth();
  const editing = !!listing;

  const [title, setTitle] = useState(listing ? listing.title : '');
  const [description, setDescription] = useState(listing ? listing.description : '');
  const [category, setCategory] = useState(listing ? listing.category : '');
  const [condition, setCondition] = useState(listing ? listing.condition : 'Good condition');
  const [isFree, setIsFree] = useState(listing ? listing.price === 0 : false);
  const [price, setPrice] = useState(listing && listing.price > 0 ? String(listing.price) : '');
  const [location, setLocation] = useState(listing ? listing.location : CAMPUS_LOCATIONS[0]);
  const [contactMethod, setContactMethod] = useState(listing ? listing.contactMethod : 'chat');
  const [items, setItems] = useState([]);
  const [imagesTouched, setImagesTouched] = useState(false);
  const [loadingImages, setLoadingImages] = useState(editing);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    getListingImages(listing.id, listing)
      .then((imgs) => setItems(imgs.map((full, i) => ({ full, thumb: i === 0 ? listing.thumb : null }))))
      .catch(() => {})
      .finally(() => setLoadingImages(false));
  }, [editing, listing]);

  const addPhotos = async () => {
    try {
      const room = MAX_IMAGES_PER_LISTING - items.length;
      if (room <= 0) return showError(`You can add up to ${MAX_IMAGES_PER_LISTING} photos.`);
      const picked = await pickImages({ max: room });
      if (picked.length) { setItems((p) => [...p, ...picked]); setImagesTouched(true); }
    } catch (e) { showError(errorMessage(e, 'Could not load that photo.')); }
  };
  const removePhoto = (i) => { setItems((p) => p.filter((_, idx) => idx !== i)); setImagesTouched(true); };

  const reset = () => {
    setTitle(''); setDescription(''); setCategory(''); setCondition('Good condition'); setIsFree(false); setPrice('');
    setLocation(CAMPUS_LOCATIONS[0]); setContactMethod('chat'); setItems([]); setErrors({}); setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    const e = validateListing({ title, description, category, price, isFree, imageCount: items.length });
    setErrors(e);
    if (Object.keys(e).length) return;
    const data = {
      title, description, category, condition, location, contactMethod,
      price: isFree ? 0 : Number(price),
      images: items.map((i) => i.full),
      thumb: items[0].thumb || items[0].full,
    };
    setBusy(true);
    try {
      if (editing) {
        await updateListing(listing, { ...data, images: imagesTouched ? data.images : undefined }, profile);
        showSuccess('Listing updated');
        router.replace(`/item/${listing.id}`);
      } else {
        const id = await createListing(data, profile);
        reset();
        showSuccess('Listing posted!');
        router.push(`/item/${id}`);
      }
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loadingImages) return <LoadingView message="Loading listing…" />;

  return (
    <FormScroll>
      <ErrorBanner message={formError} />
      <Text style={styles.label}>Photos ({items.length}/{MAX_IMAGES_PER_LISTING})</Text>
      <View style={styles.photos}>
        {items.map((it, i) => (
          <View key={i} style={styles.photoWrap}>
            <Image source={toImageSource(it.thumb || it.full)} style={styles.photo} />
            <TouchableOpacity style={styles.remove} onPress={() => removePhoto(i)} accessibilityLabel="Remove photo">
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {items.length < MAX_IMAGES_PER_LISTING ? (
          <TouchableOpacity style={[styles.photo, styles.add]} onPress={addPhotos} accessibilityLabel="Add photos">
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {errors.images ? <Text style={styles.err}>{errors.images}</Text> : null}

      <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Engineering Mathematics textbook" maxLength={80} error={errors.title} />
      <AppInput label="Description" value={description} onChangeText={setDescription} multiline placeholder="Describe the item, its age and any defects" maxLength={1000} error={errors.description} />

      <Text style={styles.label}>Category</Text>
      <View style={styles.wrap}>{CATEGORIES.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}</View>
      {errors.category ? <Text style={styles.err}>{errors.category}</Text> : null}

      <Text style={styles.label}>Condition</Text>
      <View style={styles.wrap}>{CONDITIONS.map((c) => <Chip key={c} label={c} selected={condition === c} onPress={() => setCondition(c)} />)}</View>

      <View style={styles.freeRow}>
        <Text style={styles.freeText}>Give it away for free</Text>
        <Switch value={isFree} onValueChange={setIsFree} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
      </View>
      {!isFree ? (
        <AppInput label={`Price (${CURRENCY})`} value={price} onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="e.g. 250" error={errors.price} />
      ) : null}

      <Text style={styles.label}>Campus location</Text>
      <View style={styles.wrap}>{CAMPUS_LOCATIONS.map((l) => <Chip key={l} label={l} selected={location === l} onPress={() => setLocation(l)} />)}</View>

      <Text style={styles.label}>Contact method</Text>
      <View style={styles.wrap}>{CONTACT_METHODS.map((m) => <Chip key={m.key} label={m.label} selected={contactMethod === m.key} onPress={() => setContactMethod(m.key)} />)}</View>

      <AppButton title={editing ? 'Save changes' : 'Post listing'} onPress={submit} loading={busy} style={{ marginTop: 16 }} />
      {editing ? <AppButton title="Cancel" variant="ghost" onPress={() => router.back()} style={{ marginTop: 6 }} /> : null}
    </FormScroll>
  );
}
const makeStyles = (c) => StyleSheet.create({
  label: { fontSize: fontSize.sm, fontWeight: '700', color: c.text, marginBottom: 8, marginTop: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  err: { color: c.danger, fontSize: fontSize.sm, marginBottom: 8 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  photoWrap: { position: 'relative' },
  photo: { width: 84, height: 84, borderRadius: radius.input, backgroundColor: c.card },
  add: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { color: c.primary, fontSize: fontSize.xs, fontWeight: '700' },
  remove: { position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: c.danger, alignItems: 'center', justifyContent: 'center' },
  freeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8, minHeight: 44 },
  freeText: { fontSize: fontSize.md, color: c.text, fontWeight: '600' },
});
