import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { CAMPUS_LOCATIONS, CONDITIONS, RATING_FILTERS } from '@/constants/campus';
import { defaultFilters } from '@/lib/filters';
import { useStyles } from '@/hooks/useStyles';
import { fontSize } from '@/constants/theme';
import { AppButton, AppInput, BottomSheet, Chip } from '@/components/common';

export default function FilterSheet({ visible, onClose, filters, onApply }) {
  const { styles, colors } = useStyles(makeStyles);
  const [d, setD] = useState(filters);
  const [minP, setMinP] = useState('');
  const [maxP, setMaxP] = useState('');

  useEffect(() => {
    if (visible) {
      setD(filters);
      setMinP(filters.minPrice !== undefined ? String(filters.minPrice) : '');
      setMaxP(filters.maxPrice !== undefined ? String(filters.maxPrice) : '');
    }
  }, [visible, filters]);

  const digits = (s) => s.replace(/[^0-9]/g, '');
  const apply = () => {
    onApply({ ...d, minPrice: minP ? Number(minP) : undefined, maxPrice: maxP ? Number(maxP) : undefined });
    onClose();
  };
  const reset = () => {
    setD({ ...defaultFilters, query: d.query, category: d.category });
    setMinP(''); setMaxP('');
  };
  const Row = ({ label, value, onValueChange }) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
    </View>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filters">
      <Text style={styles.h}>Price range (Nu.)</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}><AppInput value={minP} onChangeText={(t) => setMinP(digits(t))} placeholder="Min" keyboardType="number-pad" /></View>
        <View style={{ flex: 1 }}><AppInput value={maxP} onChangeText={(t) => setMaxP(digits(t))} placeholder="Max" keyboardType="number-pad" /></View>
      </View>

      <Text style={styles.h}>Condition</Text>
      <View style={styles.wrap}>
        <Chip label="Any" selected={!d.condition} onPress={() => setD({ ...d, condition: undefined })} />
        {CONDITIONS.map((c) => <Chip key={c} label={c} selected={d.condition === c} onPress={() => setD({ ...d, condition: c })} />)}
      </View>

      <Text style={styles.h}>Minimum rating</Text>
      <View style={styles.wrap}>
        {RATING_FILTERS.map((r) => <Chip key={r.label} label={r.label} selected={d.minRating === r.value} onPress={() => setD({ ...d, minRating: r.value })} />)}
      </View>

      <Text style={styles.h}>Campus location</Text>
      <View style={styles.wrap}>
        <Chip label="Anywhere" selected={!d.location} onPress={() => setD({ ...d, location: undefined })} />
        {CAMPUS_LOCATIONS.map((l) => <Chip key={l} label={l} selected={d.location === l} onPress={() => setD({ ...d, location: l })} />)}
      </View>

      <Row label="Available items only" value={d.availableOnly} onValueChange={(v) => setD({ ...d, availableOnly: v })} />
      <Row label="Trusted sellers only" value={d.trustedOnly} onValueChange={(v) => setD({ ...d, trustedOnly: v })} />
      <Row label="Free items only" value={d.freeOnly} onValueChange={(v) => setD({ ...d, freeOnly: v })} />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
        <AppButton title="Reset" variant="outline" onPress={reset} style={{ flex: 1 }} />
        <AppButton title="Apply" onPress={apply} style={{ flex: 1 }} />
      </View>
    </BottomSheet>
  );
}
const makeStyles = (c) => StyleSheet.create({
  h: { fontSize: fontSize.md, fontWeight: '700', color: c.text, marginTop: 14, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  switchLabel: { fontSize: fontSize.md, color: c.text },
});
