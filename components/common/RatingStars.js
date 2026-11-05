import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

// Pass onChange to make the stars tappable (rating input).
export default function RatingStars({ value, size = 16, onChange }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => {
        const name = value >= n ? 'star' : value >= n - 0.5 ? 'star-half' : 'star-outline';
        const icon = <Ionicons name={name} size={size} color={colors.star} />;
        return onChange ? (
          <TouchableOpacity key={n} onPress={() => onChange(n)} hitSlop={6} style={{ padding: 2 }} accessibilityLabel={`${n} star`}>{icon}</TouchableOpacity>
        ) : (
          <View key={n}>{icon}</View>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });
