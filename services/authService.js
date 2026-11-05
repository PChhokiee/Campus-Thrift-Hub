import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { CAMPUS_NAME } from '@/constants/config';
import { normalizeEmail, validateCampusEmail, validateName, validatePassword } from '@/lib/validation';

const NOTIFICATION_TYPES = ['like', 'save', 'rating', 'comment', 'message', 'priceDrop', 'sold', 'order'];

export function defaultProfile(user, extras = {}) {
  const prefs = {};
  NOTIFICATION_TYPES.forEach((t) => (prefs[t] = true));
  return {
    uid: user.uid,
    fullName: extras.fullName || user.displayName || '',
    email: normalizeEmail(user.email || ''),
    college: CAMPUS_NAME,
    year: extras.year || '',
    department: extras.department || '',
    bio: '',
    contactPreference: 'chat',
    profilePicBase64: null,
    role: 'user',
    blockedUids: [],
    ratingAvg: 0,
    ratingCount: 0,
    completedSales: 0,
    upheldReports: 0,
    trusted: false,
    notificationPrefs: prefs,
    createdAt: Date.now(),
  };
}

/** Friendly messages for Firebase Auth error codes. */
export function authErrorMessage(e) {
  const code = e && e.code ? String(e.code) : '';
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists. Try signing in.';
    case 'auth/invalid-email': return 'That email address is not valid.';
    case 'auth/weak-password': return 'Password is too weak. Use at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials': return 'Incorrect email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed': return 'Network error. Check your internet connection and try again.';
    case 'auth/user-disabled': return 'This account has been disabled. Contact an admin.';
    case 'permission-denied':
    case 'firestore/permission-denied': return 'Permission denied. Make sure your Firestore security rules are published.';
    default: return (e && e.message) || 'Something went wrong. Please try again.';
  }
}

/** Reads users/{uid}; creates it if missing (new sign-ups and legacy Android accounts). */
export async function ensureUserProfile(user, extras = {}) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const defaults = defaultProfile(user, extras);
  if (snap.exists()) {
    // merge defaults so older documents (from the Android app) get the new fields
    return { ...defaults, ...snap.data(), uid: user.uid };
  }
  await setDoc(ref, defaults);
  return defaults;
}

export async function registerUser({ fullName, email, password, year, department }) {
  const nameErr = validateName(fullName);
  if (nameErr) throw new Error(nameErr);
  const emailErr = validateCampusEmail(email); // strict campus-only check
  if (emailErr) throw new Error(emailErr);
  const pwErr = validatePassword(password);
  if (pwErr) throw new Error(pwErr);

  const cred = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
  await updateProfile(cred.user, { displayName: fullName.trim() });
  await ensureUserProfile(cred.user, { fullName: fullName.trim(), year, department });
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function loginUser({ email, password }) {
  const emailErr = validateCampusEmail(email);
  if (emailErr) throw new Error(emailErr);
  if (!password) throw new Error('Please enter your password.');
  const cred = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
  return cred.user;
}

export async function logoutUser() {
  await fbSignOut(auth);
}

export async function sendPasswordReset(email) {
  const emailErr = validateCampusEmail(email);
  if (emailErr) throw new Error(emailErr);
  await sendPasswordResetEmail(auth, normalizeEmail(email));
}

export async function resendVerificationEmail() {
  if (!auth.currentUser) throw new Error('You are signed out. Please sign in again.');
  await sendEmailVerification(auth.currentUser);
}

/** Reloads the user and refreshes the ID token so Firestore rules see email_verified = true. */
export async function reloadAuthUser() {
  const u = auth.currentUser;
  if (!u) return false;
  await u.reload();
  if (u.emailVerified) await u.getIdToken(true);
  return u.emailVerified;
}
