import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:8082",
    channel: "chrome",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npx wrangler dev --port 8787",
      url: "http://127.0.0.1:8787/api/health",
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: "npx serve -s dist -l 8082",
      url: "http://127.0.0.1:8082",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
