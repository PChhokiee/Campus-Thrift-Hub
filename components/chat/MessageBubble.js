import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MEETUP_POINTS } from '@/constants/campus';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { formatTime } from '@/lib/utils';
import { AppButton } from '@/components/common';

export default function MessageBubble({ message, mine, onRespond }) {
  const { styles, colors } = useStyles(makeStyles);
  const isMeetup = message.type === 'meetup' && message.meetup;
  const point = isMeetup ? MEETUP_POINTS.find((p) => p.id === message.meetup.pointId) : null;
  const status = isMeetup ? message.meetup.status : null;

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs, isMeetup && styles.meetup]}>
        {isMeetup ? (
          <>
            <View style={styles.meetHead}>
              <Ionicons name="location" size={18} color={mine ? colors.onPrimary : colors.primary} />
              <Text style={[styles.meetTitle, mine && styles.textMine]}>Meetup suggestion</Text>
            </View>
            <Text style={[styles.text, mine && styles.textMine]}>{point ? point.name : 'Campus point'}</Text>
            <Text style={[styles.sub, mine && styles.subMine]}>{message.meetup.time}</Text>
            {status === 'pending' && !mine ? (
              <View style={styles.actions}>
                <AppButton title="Accept" small onPress={() => onRespond(message, 'accepted')} style={{ flex: 1 }} />
                <AppButton title="Decline" small variant="outline" onPress={() => onRespond(message, 'declined')} style={{ flex: 1 }} />
              </View>
            ) : (
              <Text style={[styles.status, mine && styles.subMine]}>
                {status === 'accepted' ? '✓ Accepted' : status === 'declined' ? '✕ Declined' : 'Waiting for reply…'}
              </Text>
            )}
          </>
        ) : (
          <Text style={[styles.text, mine && styles.textMine]}>{message.text}</Text>
        )}
        <Text style={[styles.time, mine && styles.subMine]}>{formatTime(message.createdAt)}</Text>
      </View>
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  row: { paddingHorizontal: 12, marginVertical: 3, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  mine: { backgroundColor: c.primary, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: c.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: c.border },
  meetup: { minWidth: 220 },
  text: { fontSize: fontSize.md, color: c.text },
  textMine: { color: c.onPrimary },
  sub: { fontSize: fontSize.sm, color: c.muted, marginTop: 2 },
  subMine: { color: c.onPrimary, opacity: 0.85 },
  time: { fontSize: 11, color: c.muted, alignSelf: 'flex-end', marginTop: 4 },
  meetHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  meetTitle: { marginLeft: 6, fontSize: fontSize.sm, fontWeight: '800', color: c.primary },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  status: { marginTop: 8, fontSize: fontSize.sm, fontWeight: '700', color: c.text },
});
