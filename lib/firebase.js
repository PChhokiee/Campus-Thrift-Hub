import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '@/constants/config';

// If .env is not filled in yet, export nulls; the app shows a "setup needed" screen instead of crashing.
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  try {
    // Native: keep the user logged in between app launches using AsyncStorage.
    if (Platform.OS !== 'web' && typeof FirebaseAuth.getReactNativePersistence === 'function') {
      auth = FirebaseAuth.initializeAuth(app, {
        persistence: FirebaseAuth.getReactNativePersistence(AsyncStorage),
      });
    }
  } catch (e) {
    // initializeAuth throws if already initialized (Fast Refresh). Fall through to getAuth.
  }
  if (!auth) {
    auth = FirebaseAuth.getAuth(app);
    if (Platform.OS !== 'web' && typeof FirebaseAuth.getReactNativePersistence !== 'function') {
      console.warn('[firebase] getReactNativePersistence not found: login will not persist between launches.');
    }
  }
  db = getFirestore(app);
}

export { app, auth, db };
