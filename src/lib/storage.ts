import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SESSION_KEY = "roastco.session";
const CAFE_KEY = "roastco.cafe";
const favoritesKey = (userId: string) => `roastco.favorites.${userId}`;

/** Keychain/Keystore on native, localStorage on web (where SecureStore is unavailable). */
export async function readToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return typeof localStorage === "undefined" ? null : localStorage.getItem(SESSION_KEY);
    }
    return await SecureStore.getItemAsync(SESSION_KEY);
  } catch {
    return null;
  }
}

export async function writeToken(token: string | null): Promise<void> {
  await writePreference(SESSION_KEY, token);
}

/** Small cross-platform preference store for non-sensitive app settings. */
export async function readPreference(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return typeof localStorage === "undefined" ? null : localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function writePreference(key: string, value: string | null): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage === "undefined") return;
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
      return;
    }
    if (value === null) await SecureStore.deleteItemAsync(key);
    else await SecureStore.setItemAsync(key, value);
  } catch {
    // Preferences are best-effort; the app works with in-memory defaults.
  }
}

export async function readFavorites(userId: string): Promise<string[]> {
  const raw = await readPreference(favoritesKey(userId));
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function writeFavorites(userId: string, ids: string[]): Promise<void> {
  await writePreference(favoritesKey(userId), JSON.stringify(ids));
}

export { CAFE_KEY };
