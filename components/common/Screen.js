import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

export default function Screen({ children, style, edges = ['top', 'bottom'] }) {
  const { colors } = useTheme();
  return <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.background }, style]}>{children}</SafeAreaView>;
}
