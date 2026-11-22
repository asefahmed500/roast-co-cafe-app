/** Password hashing, opaque sessions and constant-time token comparison. */
import { first, run, type UserRow } from "./db";

const encoder = new TextEncoder();
const PBKDF2_ITERATIONS = 210_000;
const SESSION_BYTES = 32;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function sha256(data: ArrayBuffer | Uint8Array): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", data as BufferSource);
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, iterationsText, saltHex, hashHex] = stored.split("$");
    if (scheme !== "pbkdf2" || !iterationsText || !saltHex || !hashHex) return false;
    const iterations = Number(iterationsText);
    if (!Number.isInteger(iterations) || iterations < 1000 || iterations > 1_000_000) return false;

    const expected = fromHex(hashHex);
    const actual = await derive(password, fromHex(saltHex), iterations);
    if (actual.length !== expected.length) return false;

    // Hash both values to a fixed size, then compare in constant time.
    const [actualDigest, expectedDigest] = await Promise.all([sha256(actual), sha256(expected)]);
    return constantTimeEqual(new Uint8Array(actualDigest), new Uint8Array(expectedDigest));
  } catch {
    return false;
  }
}

async function hashToken(token: string): Promise<string> {
  return toHex(new Uint8Array(await sha256(encoder.encode(token))));
}

export async function createSession(
  db: D1Database,
  userId: string,
  ttlDays: number,
): Promise<string> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(SESSION_BYTES)));
  const tokenHash = await hashToken(token);
  const now = Date.now();
  await run(db, "DELETE FROM sessions WHERE expires_at <= ?", [now]);
  await run(
    db,
    "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    [tokenHash, userId, now + ttlDays * 86_400_000, new Date(now).toISOString()],
  );
  return token;
}

export async function destroySession(db: D1Database, token: string): Promise<void> {
  await run(db, "DELETE FROM sessions WHERE token_hash = ?", [await hashToken(token)]);
}

export async function userFromToken(db: D1Database, token: string): Promise<UserRow | null> {
  const tokenHash = await hashToken(token);
  return first<UserRow>(
    db,
    `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?`,
    [tokenHash, Date.now()],
  );
}

/** Constant-time byte comparison (length is already known to be fixed here). */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function bearerToken(header: string | null | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() ?? null;
}
