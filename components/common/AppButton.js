import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';

// variant: primary | secondary | outline | danger | dangerOutline | ghost
export default function AppButton({ title, onPress, variant = 'primary', loading, disabled, icon, style, small }) {
  const { styles, colors } = useStyles(makeStyles);
  const isDisabled = disabled || loading;
  const filled = variant === 'primary' || variant === 'secondary' || variant === 'danger';
  const fg = filled ? colors.onPrimary : variant === 'dangerOutline' ? colors.danger : colors.primary;
  const bg = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.secondary },
    danger: { backgroundColor: colors.danger },
    outline: { borderWidth: 1.5, borderColor: colors.primary },
    dangerOutline: { borderWidth: 1.5, borderColor: colors.danger },
    ghost: {},
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [styles.base, small && styles.small, bg, isDisabled && styles.disabled, pressed && styles.pressed, style]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[styles.text, small && styles.textSmall, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
const makeStyles = () => StyleSheet.create({
  base: { minHeight: 50, borderRadius: radius.button, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  small: { minHeight: 40, paddingHorizontal: 16 },
  text: { fontSize: fontSize.md, fontWeight: '700' },
  textSmall: { fontSize: fontSize.sm },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
