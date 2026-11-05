import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isFirebaseConfigured } from '@/constants/config';
import { isCampusEmail } from '@/lib/validation';
import {
  authErrorMessage, defaultProfile, ensureUserProfile, loginUser, logoutUser, registerUser,
  reloadAuthUser, resendVerificationEmail, sendPasswordReset,
} from '@/services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, profile: null, verified: false, notice: null });
  const profileUnsub = useRef(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setState((s) => ({ ...s, loading: false }));
      return undefined;
    }
    const stopProfile = () => { if (profileUnsub.current) { profileUnsub.current(); profileUnsub.current = null; } };

    const unsub = onAuthStateChanged(auth, async (u) => {
      stopProfile();
      if (!u) {
        setState((s) => ({ loading: false, user: null, profile: null, verified: false, notice: s.notice }));
        return;
      }
      // Safety net: sessions from non-campus accounts (e.g. old Android test users) are rejected.
      if (!isCampusEmail(u.email || '')) {
        await logoutUser();
        setState({ loading: false, user: null, profile: null, verified: false, notice: 'Only campus email accounts can use Thrift Hub.' });
        return;
      }
      let first = true;
      try {
        await ensureUserProfile(u); // creates users/{uid} if missing (new sign-ups, legacy accounts)
      } catch (e) {
        console.warn('[auth] profile create failed:', authErrorMessage(e));
      }
      // Live profile: blocks, notification settings, badge and rating update instantly.
      profileUnsub.current = onSnapshot(
        doc(db, 'users', u.uid),
        async (snap) => {
          const profile = snap.exists() ? { ...defaultProfile(u), ...snap.data(), uid: u.uid } : defaultProfile(u);
          if (profile.suspended) {
            await logoutUser();
            setState({ loading: false, user: null, profile: null, verified: false, notice: 'This account has been suspended.' });
            return;
          }
          setState({ loading: false, user: u, profile, verified: u.emailVerified, notice: null });
          first = false;
        },
        (err) => {
          console.warn('[auth] profile listener:', authErrorMessage(err));
          if (first) setState({ loading: false, user: u, profile: defaultProfile(u), verified: u.emailVerified, notice: null });
        }
      );
    });
    return () => { unsub(); stopProfile(); };
  }, []);

  const refreshUser = useCallback(async () => {
    const verified = await reloadAuthUser();
    setState((s) => ({ ...s, verified, user: auth.currentUser }));
    return verified;
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isAdmin: state.profile?.role === 'admin',
      signUp: registerUser,
      signIn: loginUser,
      signOut: logoutUser,
      sendReset: sendPasswordReset,
      resendVerification: resendVerificationEmail,
      refreshUser,
    }),
    [state, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
