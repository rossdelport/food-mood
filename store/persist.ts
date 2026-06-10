// Tiny AsyncStorage JSON helpers shared by the persisted stores.
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadJSON<T>(key: string): Promise<T | null> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}
