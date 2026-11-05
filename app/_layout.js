import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { LoadingView, Toast } from '@/components/common';
import ConfigMissing from '@/components/auth/ConfigMissing';
import { isFirebaseConfigured } from '@/constants/config';

// Central route protection:
//   signed out            -> welcome / (auth) screens only
//   signed in, unverified -> /verify-email only
//   signed in, verified   -> everything else
function Gate() {
  const { loading, user, verified } = useAuth();
  const { colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (loading || !navState?.key) return;
    const first = segments[0];
    const atWelcome = segments.length === 0;
    const inAuth = first === '(auth)';
    if (!user) {
      if (!atWelcome && !inAuth) router.replace('/');
    } else if (!verified) {
      if (first !== 'verify-email') router.replace('/verify-email');
    } else if (atWelcome || inAuth || first === 'verify-email') {
      router.replace('/home');
    }
  }, [loading, user, verified, segments, navState?.key, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      <Toast />
      {loading ? <View style={StyleSheet.absoluteFill}><LoadingView message="Loading…" /></View> : null}
    </View>
  );
}

function Themed() {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      {isFirebaseConfigured ? (
        <AuthProvider>
          <DataProvider>
            <Gate />
          </DataProvider>
        </AuthProvider>
      ) : (
        <ConfigMissing />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Themed />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
