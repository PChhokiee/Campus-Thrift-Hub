import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MEETUP_DAYS, MEETUP_POINTS, MEETUP_TIMES } from '@/constants/campus';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { AppButton, BottomSheet, Chip } from '@/components/common';
import MeetupMap from '@/components/common/MeetupMap';

export default function MeetupSheet({ visible, onClose, onSend }) {
  const { styles, colors } = useStyles(makeStyles);
  const [pointId, setPointId] = useState(MEETUP_POINTS[0].id);
  const [day, setDay] = useState(MEETUP_DAYS[0]);
  const [time, setTime] = useState(MEETUP_TIMES[1]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Suggest a meetup point">
      <MeetupMap points={MEETUP_POINTS} selectedId={pointId} onSelect={setPointId} height={200} />
      <View style={{ marginTop: 10 }}>
        {MEETUP_POINTS.map((p) => (
          <TouchableOpacity key={p.id} style={styles.row} onPress={() => setPointId(p.id)} accessibilityRole="radio" accessibilityState={{ selected: pointId === p.id }}>
            <Ionicons name={pointId === p.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={pointId === p.id ? colors.primary : colors.muted} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.desc}>{p.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.h}>Day</Text>
      <View style={styles.wrap}>{MEETUP_DAYS.map((d) => <Chip key={d} label={d} selected={day === d} onPress={() => setDay(d)} />)}</View>
      <Text style={styles.h}>Time</Text>
      <View style={styles.wrap}>{MEETUP_TIMES.map((t) => <Chip key={t} label={t} selected={time === t} onPress={() => setTime(t)} />)}</View>
      <AppButton title="Send suggestion" onPress={() => { onSend({ pointId, time: `${day} · ${time}`, status: 'pending' }); onClose(); }} style={{ marginTop: 12 }} />
    </BottomSheet>
  );
}
const makeStyles = (c) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingVertical: 6 },
  name: { fontSize: fontSize.md, fontWeight: '700', color: c.text },
  desc: { fontSize: fontSize.sm, color: c.muted },
  h: { fontSize: fontSize.md, fontWeight: '700', color: c.text, marginTop: 12, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
