import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

/**
 * Set EXPO_PUBLIC_API_URL when running against a deployed Worker. The value in
 * app.json `extra.apiUrl` is used for EAS builds, with localhost as a fallback
 * for the simulator/web. A physical device needs your machine's LAN address.
 */
const localApi = "http://127.0.0.1:8787";

const configured =
  process.env.EXPO_PUBLIC_API_URL ??
  (__DEV__ ? localApi : extra?.apiUrl ?? localApi);

export const API_URL = configured.replace(/\/$/, "");
