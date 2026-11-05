import { CURRENCY } from '@/constants/config';

export const formatPrice = (price) => (price <= 0 ? 'Free' : `${CURRENCY}${price.toLocaleString()}`);

export function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Accepts a URL, a data URI, a file URI, or a raw base64 string (Android-app format). */
export function toImageSource(value) {
  if (!value) return undefined;
  if (/^(https?:|data:|file:|content:)/.test(value)) return { uri: value };
  return { uri: `data:image/jpeg;base64,${value}` };
}

export const initials = (name) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';

export const errorMessage = (e, fallback = 'Something went wrong. Please try again.') =>
  e instanceof Error && e.message ? e.message : fallback;

export function formatDateTime(ts) {
  const d = new Date(ts);
  return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export const pluralize = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
export const ratingText = (avg, count) => (count > 0 ? `${avg.toFixed(1)} (${count})` : 'No ratings yet');
