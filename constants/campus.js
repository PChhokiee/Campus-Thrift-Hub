export const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Clothes', 'Shoes', 'Home'];
export const CATEGORY_FILTERS = ['All', ...CATEGORIES];

export const CONDITIONS = ['New', 'Like new', 'Good condition', 'Fair'];

export const STATUS_LABELS = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
};

// Campus areas used for the "location" field and filter.
export const CAMPUS_LOCATIONS = ['On campus', 'Hostel', 'Library area', 'Academic block', 'Canteen area'];

export const REPORT_REASONS = [
  { key: 'spam', label: 'Spam or fake listing' },
  { key: 'inappropriate', label: 'Inappropriate content' },
  { key: 'scam', label: 'Scam or suspicious' },
  { key: 'harassment', label: 'Harassment' },
  { key: 'prohibited', label: 'Prohibited item' },
  { key: 'other', label: 'Other' },
];

// Safe meetup points. PLACEHOLDER coordinates near CST, Rinchending:
// replace with the real, admin-approved spots before user testing.
export const MEETUP_POINTS = [
  { id: 'library', name: 'Library entrance', description: 'Well-lit, busy during the day', latitude: 26.8645, longitude: 89.3925 },
  { id: 'canteen', name: 'Canteen front', description: 'Public area, lots of students', latitude: 26.8641, longitude: 89.3931 },
  { id: 'admin', name: 'Admin block lobby', description: 'Staff nearby, CCTV area', latitude: 26.8649, longitude: 89.3919 },
  { id: 'gate', name: 'Main gate security post', description: 'Security guard present', latitude: 26.8653, longitude: 89.3912 },
  { id: 'sports', name: 'Sports ground entrance', description: 'Open and visible', latitude: 26.8636, longitude: 89.3938 },
];
export const MAP_CENTER = { latitude: 26.8645, longitude: 89.3925, latitudeDelta: 0.006, longitudeDelta: 0.006 };

export const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'topRated', label: 'Top rated' },
  { key: 'priceLow', label: 'Price: low to high' },
  { key: 'priceHigh', label: 'Price: high to low' },
  { key: 'relevance', label: 'Relevance' },
];

export const CONTACT_METHODS = [
  { key: 'chat', label: 'In-app chat' },
  { key: 'meetup', label: 'Meetup only' },
  { key: 'either', label: 'Chat or meetup' },
];

export const RATING_FILTERS = [
  { value: 0, label: 'Any' },
  { value: 3, label: '3★ +' },
  { value: 4, label: '4★ +' },
  { value: 4.5, label: '4.5★ +' },
];

export const NOTIFICATION_LABELS = {
  like: 'Likes on my items',
  save: 'Saves / wishlist adds',
  rating: 'New ratings & reviews',
  comment: 'Comments on my items',
  message: 'New chat messages',
  priceDrop: 'Price drops on wishlist items',
  sold: 'Wishlist items marked sold',
  order: 'Buy requests & order updates',
};

export const MEETUP_DAYS = ['Today', 'Tomorrow', 'In 2 days'];
export const MEETUP_TIMES = ['9:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];
