import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, Screen } from '@/components/common';
import { useStyles } from '@/hooks/useStyles';
import { fontSize } from '@/constants/theme';

// Welcome screen (ported from the Android WelcomeActivity)
export default function Welcome() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  return (
    <Screen style={{ padding: 24 }}>
      <View style={styles.center}>
        <View style={styles.logo}><Ionicons name="leaf" size={44} color={colors.onPrimary} /></View>
        <Text style={styles.title}>Thrift Hub</Text>
        <Text style={styles.tagline}>A little less new. A lot more you.</Text>
        <Text style={styles.sub}>Buy and sell second-hand items with verified students on campus.</Text>
      </View>
      <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
        <AppButton title="Get Started" onPress={() => router.push('/register')} />
        <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 16, alignItems: 'center', minHeight: 44, justifyContent: 'center' }}>
          <Text style={styles.link}>Already have an account? <Text style={{ fontWeight: '700', color: colors.primary }}>Sign in</Text></Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 88, height: 88, borderRadius: 44, backgroundColor: c.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 34, fontWeight: '800', color: c.text },
  tagline: { fontSize: fontSize.lg, color: c.primary, marginTop: 8, fontWeight: '600', textAlign: 'center' },
  sub: { fontSize: fontSize.md, color: c.muted, marginTop: 12, textAlign: 'center', paddingHorizontal: 16 },
  link: { fontSize: fontSize.md, color: c.muted },
});
