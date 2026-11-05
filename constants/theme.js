// Light = original Android palette. Dark = warm dark variant of the same palette.
export const lightColors = {
  background: '#F5EEDD', card: '#F3E9D8', surface: '#FFFFFF',
  primary: '#B15A38', onPrimary: '#FFFFFF', secondary: '#71835A',
  text: '#3B2E25', muted: '#8A7B6C', border: '#E3D6C2',
  danger: '#B3261E', dangerBg: '#FBE9E7', warning: '#C98A1B', success: '#71835A',
  badgeBg: '#E6EBDD', overlay: 'rgba(59,46,37,0.45)', tabBar: '#F3E9D8', star: '#E0A526',
};
export const darkColors = {
  background: '#171310', card: '#241E19', surface: '#2D2620',
  primary: '#D9805B', onPrimary: '#1A120C', secondary: '#9DB080',
  text: '#F3E9D8', muted: '#A89886', border: '#3D332A',
  danger: '#F2766B', dangerBg: '#3B211E', warning: '#E3AE45', success: '#9DB080',
  badgeBg: '#2C3625', overlay: 'rgba(0,0,0,0.6)', tabBar: '#1F1A16', star: '#F0B94A',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { input: 12, card: 16, button: 28, pill: 999 };
export const fontSize = { xs: 12, sm: 13, md: 15, lg: 18, xl: 22, xxl: 28 };

export const shadowFor = (isDark) =>
  isDark ? {} : { shadowColor: '#3B2E25', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 };
