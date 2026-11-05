import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, shadowFor } from '@/constants/theme';

const KEY = 'thrifthub.themeMode'; // 'system' | 'light' | 'dark'
const ThemeContext = createContext({ mode: 'system', setMode: () => {}, isDark: false, colors: lightColors, shadow: shadowFor(false) });

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (v === 'light' || v === 'dark' || v === 'system') setModeState(v); }).catch(() => {});
  }, []);

  const setMode = useCallback((m) => { setModeState(m); AsyncStorage.setItem(KEY, m).catch(() => {}); }, []);
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const value = useMemo(
    () => ({ mode, setMode, isDark, colors: isDark ? darkColors : lightColors, shadow: shadowFor(isDark) }),
    [mode, setMode, isDark]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
