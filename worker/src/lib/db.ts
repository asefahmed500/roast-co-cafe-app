/** Thin, typed helpers around D1's prepared-statement API. */

export type D1Param = string | number | null | Uint8Array | ArrayBuffer;

function statement(db: D1Database, sql: string, params: D1Param[]) {
  const prepared = db.prepare(sql);
  return params.length ? prepared.bind(...params) : prepared;
}

export async function all<T>(db: D1Database, sql: string, params: D1Param[] = []): Promise<T[]> {
  const result = await statement(db, sql, params).all();
  return (result.results ?? []) as T[];
}

export async function first<T>(db: D1Database, sql: string, params: D1Param[] = []): Promise<T | null> {
  const row = await statement(db, sql, params).first();
  return (row as T | null) ?? null;
}

export async function run(db: D1Database, sql: string, params: D1Param[] = []): Promise<D1Result> {
  return statement(db, sql, params).run();
}

export type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  points: number;
  tier: string;
  coffee_stamps: number;
  created_at: string;
};

export type OrderRow = {
  id: string;
  order_number: number;
  user_id: string;
  cafe_id: string;
  mode: string;
  payment: string;
  time_slot: string;
  items: string;
  subtotal: number;
  discount: number;
  total: number;
  promo_code: string | null;
  payment_status: string;
  eta_minutes: number;
  created_at: string;
};

export type MenuRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  illustration: string;
  category: string;
  rating: number;
  reviews: number;
  minutes: number;
  tint: string;
};
