import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/common';
import { useStyles } from '@/hooks/useStyles';
import { fontSize } from '@/constants/theme';

export default function ConfigMissing() {
  const { styles } = useStyles(makeStyles);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={styles.h}>Firebase is not configured yet</Text>
        <Text style={styles.p}>1. Open the file named .env in your project folder.</Text>
        <Text style={styles.p}>2. Paste your Firebase Web app values (API key and App ID).</Text>
        <Text style={styles.p}>3. Stop the server (Ctrl + C) and run: npx expo start -c</Text>
        <Text style={styles.p}>Values come from Firebase Console → Project settings → Your apps → Web app.</Text>
      </ScrollView>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  h: { fontSize: fontSize.xl, fontWeight: '800', color: c.text, marginBottom: 16 },
  p: { fontSize: fontSize.md, color: c.text, marginBottom: 10, lineHeight: 22 },
});
