export const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Clothes', 'Shoes', 'Home'];
export const CATEGORY_FILTERS = ['All', ...CATEGORIES];

export const CONDITIONS = ['New', 'Like new', 'Good condition', 'Fair'];

export const STATUS_LABELS = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
};

// Location used for the "location" field and filter.
export const CAMPUS_LOCATIONS = ['College of Science and Technology, Phuentsholing'];

// Words people may type that should find a category (search by category).
export const CATEGORY_KEYWORDS = {
  Books: ['book', 'textbook', 'novel', 'notes', 'guide', 'reference'],
  Electronics: ['electronic', 'laptop', 'phone', 'mobile', 'charger', 'gadget', 'calculator', 'earphone', 'headphone'],
  Furniture: ['table', 'chair', 'desk', 'bed', 'shelf', 'cupboard', 'mattress'],
  Clothes: ['clothing', 'cloth', 'shirt', 'jacket', 'dress', 'jeans', 'gho', 'kira', 'uniform', 'hoodie'],
  Shoes: ['shoe', 'sneaker', 'boot', 'sandal', 'footwear', 'slipper'],
  Home: ['kitchen', 'household', 'appliance', 'cooker', 'bucket', 'utensil'],
};

export const REPORT_REASONS = [
  { key: 'spam', label: 'Spam or fake listing' },
  { key: 'inappropriate', label: 'Inappropriate content' },
  { key: 'scam', label: 'Scam or suspicious' },
  { key: 'harassment', label: 'Harassment' },
  { key: 'prohibited', label: 'Prohibited item' },
  { key: 'other', label: 'Other' },
];

// Safe meetup points at CST, Rinchending (Phuentsholing).
// NOTE: coordinates are approximate (campus centre is 26.8503, 89.3940).
// Open Google Maps, long-press the exact spot and copy its latitude/longitude to fine-tune each point.
export const MEETUP_POINTS = [
  { id: 'library', name: 'Library entrance', description: 'Well-lit, busy during the day', latitude: 26.8506, longitude: 89.3937 },
  { id: 'canteen', name: 'Canteen front', description: 'Public area, lots of students', latitude: 26.8500, longitude: 89.3944 },
  { id: 'admin', name: 'Admin block lobby', description: 'Staff nearby, CCTV area', latitude: 26.8508, longitude: 89.3942 },
  { id: 'gate', name: 'Main gate security post', description: 'Security guard present', latitude: 26.8499, longitude: 89.3934 },
  { id: 'sports', name: 'Sports ground entrance', description: 'Open and visible', latitude: 26.8497, longitude: 89.3947 },
];
export const MAP_CENTER = { latitude: 26.8503, longitude: 89.3940, latitudeDelta: 0.006, longitudeDelta: 0.006 };

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