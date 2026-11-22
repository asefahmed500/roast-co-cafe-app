import { spawnSync } from "node:child_process";

// Build the web bundle against the local Worker so E2E uses real API data.
const env = { ...process.env, EXPO_PUBLIC_API_URL: "http://127.0.0.1:8787" };
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["expo", "export", "--platform", "web"], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
