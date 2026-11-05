import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { fontSize } from '@/constants/theme';
import BottomSheet from './BottomSheet';

// actions: [{ label, icon, onPress, destructive }]
export default function MenuSheet({ visible, onClose, title, actions }) {
  const { styles, colors } = useStyles(makeStyles);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {actions.map((a) => (
        <TouchableOpacity
          key={a.label}
          style={styles.row}
          onPress={() => { onClose(); setTimeout(a.onPress, 250); }}
          accessibilityRole="button"
        >
          <Ionicons name={a.icon || 'ellipse-outline'} size={22} color={a.destructive ? colors.danger : colors.text} />
          <Text style={[styles.label, a.destructive && { color: colors.danger }]}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </BottomSheet>
  );
}
const makeStyles = (c) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
  label: { marginLeft: 14, fontSize: fontSize.md, color: c.text, fontWeight: '600' },
});
