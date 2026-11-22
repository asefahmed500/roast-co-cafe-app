import { applyD1Migrations } from "cloudflare:test";
import { env } from "cloudflare:workers";

type TestEnv = {
  DB: D1Database;
  TEST_MIGRATIONS: Array<{ name: string; queries: string[] }>;
};

// Setup files run outside per-test storage isolation. applyD1Migrations()
// only applies migrations that have not run yet, so repeated calls are safe.
await applyD1Migrations((env as unknown as TestEnv).DB, (env as unknown as TestEnv).TEST_MIGRATIONS);
