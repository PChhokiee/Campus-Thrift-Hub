import { CATEGORIES, CATEGORY_KEYWORDS } from '@/constants/campus';

export const defaultFilters = {
  query: '', category: 'All', minPrice: undefined, maxPrice: undefined, condition: undefined,
  minRating: 0, location: undefined, availableOnly: false, trustedOnly: false, freeOnly: false,
};

/** Number of filters set in the filter sheet (not counting search text / category chips). */
export function countSheetFilters(f) {
  let n = 0;
  if (f.minPrice !== undefined || f.maxPrice !== undefined) n++;
  if (f.condition) n++;
  if (f.minRating > 0) n++;
  if (f.location) n++;
  if (f.availableOnly) n++;
  if (f.trustedOnly) n++;
  if (f.freeOnly) n++;
  return n;
}

// "books" -> "book", "shoes" -> "shoe" so singular/plural both match
const stem = (t) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t);
const tokensOf = (q) => (q || '').toLowerCase().split(/\s+/).filter(Boolean).map(stem);
const keywordsOf = (category) => (CATEGORY_KEYWORDS[category] || []).join(' ');

/** Categories whose name or keywords match what the user typed (used for the "In category" chips). */
export function matchingCategories(query) {
  const tokens = tokensOf(query);
  if (!tokens.length) return [];
  return CATEGORIES.filter((c) => {
    const hay = `${c} ${keywordsOf(c)}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
}

function relevance(item, tokens) {
  const title = item.title.toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const cat = `${item.category || ''} ${keywordsOf(item.category)}`.toLowerCase();
  let score = 0;
  tokens.forEach((t) => {
    if (title.includes(t)) score += 3;
    if (cat.includes(t)) score += 2;
    if (desc.includes(t)) score += 1;
  });
  return score;
}

export function filterAndSort(listings, f, sort) {
  const tokens = tokensOf(f.query);
  let out = listings.filter((l) => {
    if (tokens.length) {
      // search matches the title, description, category name AND category keywords
      const hay = `${l.title} ${l.description} ${l.category} ${keywordsOf(l.category)}`.toLowerCase();
      if (!tokens.every((t) => hay.includes(t))) return false;
    }
    if (f.category && f.category !== 'All' && l.category !== f.category) return false;
    if (f.minPrice !== undefined && l.price < f.minPrice) return false;
    if (f.maxPrice !== undefined && l.price > f.maxPrice) return false;
    if (f.condition && l.condition !== f.condition) return false;
    if (f.minRating > 0 && !(l.ratingAvg >= f.minRating)) return false;
    if (f.location && l.location !== f.location) return false;
    if (f.availableOnly && l.status !== 'available') return false;
    if (f.trustedOnly && !l.sellerTrusted) return false;
    if (f.freeOnly && l.price !== 0) return false;
    return true;
  });
  const by = {
    newest: (a, b) => b.createdAt - a.createdAt,
    priceLow: (a, b) => a.price - b.price,
    priceHigh: (a, b) => b.price - a.price,
    topRated: (a, b) => (b.ratingAvg - a.ratingAvg) || (b.ratingCount - a.ratingCount) || (b.createdAt - a.createdAt),
    relevance: (a, b) => (relevance(b, tokens) - relevance(a, tokens)) || (b.createdAt - a.createdAt),
  };
  out = [...out].sort(by[sort] || by.newest);
  return out;
}