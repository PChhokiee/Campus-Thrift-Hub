import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';

export default function AppInput({ label, error, helper, secureTextEntry, style, ...rest }) {
  const { styles, colors } = useStyles(makeStyles);
  const [hidden, setHidden] = useState(!!secureTextEntry);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, !!error && styles.fieldError]}>
        <TextInput
          placeholderTextColor={colors.muted}
          style={[styles.input, rest.multiline && styles.multiline, style]}
          secureTextEntry={hidden}
          {...rest}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel="Toggle password visibility">
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}
const makeStyles = (c) => StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: c.text, marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: radius.input, paddingHorizontal: 14 },
  fieldError: { borderColor: c.danger },
  input: { flex: 1, minHeight: 48, fontSize: fontSize.md, color: c.text },
  multiline: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  error: { color: c.danger, fontSize: fontSize.sm, marginTop: 4 },
  helper: { color: c.muted, fontSize: fontSize.sm, marginTop: 4 },
});
