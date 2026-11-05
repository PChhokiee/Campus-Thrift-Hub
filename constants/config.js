// ---------------------------------------------------------------------------
// App-wide configuration. Edit values here, not in screens.
// ---------------------------------------------------------------------------

// Allowed campus email suffixes. Example valid address: 02240164.cst@rub.edu.bt
// Add more entries if other RUB colleges/staff should be allowed.
export const CAMPUS_EMAIL_DOMAINS = ['.cst@rub.edu.bt'];
export const CAMPUS_EMAIL_EXAMPLE = '02240164.cst@rub.edu.bt';

export const CAMPUS_NAME = 'College of Science and Technology';
export const CURRENCY = 'Nu.';

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_IMAGES_PER_LISTING = 5;
export const MAX_IMAGE_DIMENSION = 800; // same as Android ImageUtils
export const IMAGE_QUALITY = 0.55; // same as Android JPEG quality 55

// Trusted Seller rules (from proposal)
export const TRUSTED_SELLER = {
  minCompletedSales: 5,
  minAverageRating: 4.5,
  maxUpheldReports: 0,
};

// Set true to run the whole app on in-memory mock data (no Firebase needed).
export const USE_MOCK_DATA = false;

// Firebase web config: copy values into .env (see .env.example)
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);
