import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenHeader } from '@/components/common';
import MeetupMap from '@/components/common/MeetupMap';
import { MEETUP_POINTS } from '@/constants/campus';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

export default function MeetupPoints() {
  const { styles, colors } = useStyles(makeStyles);
  const router = useRouter();
  const [selected, setSelected] = useState(MEETUP_POINTS[0].id);

  const openMaps = (p) => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`).catch(() => {});

  return (
    <Screen>
      <ScreenHeader title="Safe meetup points" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <Text style={styles.intro}>Meet only at these well-lit, public campus locations. In a chat, tap the 📍 button to suggest one.</Text>
        <MeetupMap points={MEETUP_POINTS} selectedId={selected} onSelect={setSelected} height={280} />
        <View style={{ marginTop: 16 }}>
          {MEETUP_POINTS.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.row, selected === p.id && styles.rowOn]} onPress={() => setSelected(p.id)} accessibilityRole="button">
              <Ionicons name="location" size={22} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.desc}>{p.description}</Text>
              </View>
              <TouchableOpacity onPress={() => openMaps(p)} hitSlop={8} accessibilityLabel={`Open ${p.name} in Maps`}>
                <Ionicons name="navigate-circle-outline" size={28} color={colors.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  intro: { fontSize: fontSize.md, color: c.muted, marginBottom: 14, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 14, marginBottom: 10 },
  rowOn: { borderColor: c.primary },
  name: { fontSize: fontSize.md, fontWeight: '800', color: c.text },
  desc: { fontSize: fontSize.sm, color: c.muted, marginTop: 2 },
});
