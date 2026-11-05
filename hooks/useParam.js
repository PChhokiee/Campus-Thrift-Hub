import { useLocalSearchParams } from 'expo-router';

/** Returns a route param as a plain string (expo-router can give arrays). */
export function useParam(name) {
  const p = useLocalSearchParams();
  const v = p[name];
  return Array.isArray(v) ? v[0] : v;
}
