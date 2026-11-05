import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';

/** const { styles, colors } = useStyles(makeStyles);   where makeStyles = (c, theme) => StyleSheet.create({...}) */
export function useStyles(make) {
  const theme = useTheme();
  const styles = useMemo(() => make(theme.colors, theme), [theme, make]);
  return { styles, colors: theme.colors, isDark: theme.isDark, theme };
}
