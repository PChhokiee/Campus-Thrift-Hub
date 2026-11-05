import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { REPORT_REASONS } from '@/constants/campus';
import { fontSize } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { submitReport } from '@/services/reportService';
import { showError, showSuccess } from '@/store/toastStore';
import { errorMessage } from '@/lib/utils';
import { AppButton, AppInput, BottomSheet } from '@/components/common';

// target = { type: 'listing'|'comment'|'user', id, ownerUid, listingId?, label }
export default function ReportSheet({ visible, onClose, target }) {
  const { styles, colors } = useStyles(makeStyles);
  const { profile } = useAuth();
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason) return showError('Please choose a reason.');
    setBusy(true);
    try {
      await submitReport({ target, reason, details, profile });
      showSuccess('Report sent. An admin will review it.');
      setReason(null); setDetails('');
      onClose();
    } catch (e) {
      showError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`Report ${target ? target.type : ''}`}>
      {target && target.label ? <Text style={styles.sub} numberOfLines={2}>{target.label}</Text> : null}
      {REPORT_REASONS.map((r) => (
        <TouchableOpacity key={r.key} style={styles.row} onPress={() => setReason(r.key)} accessibilityRole="radio" accessibilityState={{ selected: reason === r.key }}>
          <Ionicons name={reason === r.key ? 'radio-button-on' : 'radio-button-off'} size={22} color={reason === r.key ? colors.primary : colors.muted} />
          <Text style={styles.label}>{r.label}</Text>
        </TouchableOpacity>
      ))}
      <AppInput label="Details (optional)" value={details} onChangeText={setDetails} multiline maxLength={400} style={{ marginTop: 10 }} />
      <AppButton title="Send report" variant="danger" onPress={submit} loading={busy} />
    </BottomSheet>
  );
}
const makeStyles = (c) => StyleSheet.create({
  sub: { color: c.muted, fontSize: fontSize.sm, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 46 },
  label: { marginLeft: 12, fontSize: fontSize.md, color: c.text },
});
