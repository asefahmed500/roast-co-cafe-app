/** Small D1-backed sliding-window limiter for expensive public endpoints. */
import { first, run } from "./db";

type RateRow = { window_start: number; count: number };

export async function allow(
  db: D1Database,
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const now = Date.now();
  const row = await first<RateRow>(db, "SELECT window_start, count FROM rate_limits WHERE key = ?", [key]);

  if (!row || now - row.window_start >= windowMs) {
    await run(
      db,
      `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
       ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = 1`,
      [key, now],
    );
    await run(db, "DELETE FROM rate_limits WHERE window_start < ?", [now - windowMs * 2]);
    return true;
  }

  if (row.count >= limit) return false;
  await run(db, "UPDATE rate_limits SET count = count + 1 WHERE key = ?", [key]);
  return true;
}
