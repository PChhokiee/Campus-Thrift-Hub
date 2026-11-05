import * as ImagePicker from 'expo-image-picker';
import * as IM from 'expo-image-manipulator';

/** Resize + compress an image URI and return a base64 JPEG string (works with old and new manipulator APIs). */
export async function compressUri(uri, { width = 800, quality = 0.55 } = {}) {
  if (typeof IM.manipulateAsync === 'function') {
    const r = await IM.manipulateAsync(uri, [{ resize: { width } }], { compress: quality, format: IM.SaveFormat.JPEG, base64: true });
    return r.base64;
  }
  const ctx = IM.ImageManipulator.manipulate(uri);
  ctx.resize({ width });
  const img = await ctx.renderAsync();
  const r = await img.saveAsync({ format: IM.SaveFormat.JPEG, compress: quality, base64: true });
  return r.base64;
}

/** Opens the gallery. Returns [{ full, thumb }] (full = 800px, thumb = 280px) as base64 strings. */
export async function pickImages({ max = 1, fullWidth = 800, thumbWidth = 280 } = {}) {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: max > 1,
    selectionLimit: max,
    quality: 1,
  });
  if (res.canceled) return [];
  const out = [];
  for (const a of res.assets.slice(0, max)) {
    const full = await compressUri(a.uri, { width: fullWidth, quality: 0.55 });
    const thumb = await compressUri(a.uri, { width: thumbWidth, quality: 0.5 });
    out.push({ full, thumb });
  }
  return out;
}

/** Square-ish avatar image (256px). */
export async function pickAvatar() {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
  if (res.canceled) return null;
  return compressUri(res.assets[0].uri, { width: 256, quality: 0.6 });
}
