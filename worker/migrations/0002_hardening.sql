-- Hardening: persisted promo, honest payment state, idempotency and indexes.

ALTER TABLE carts ADD COLUMN promo_code TEXT;
ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency
  ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_category
  ON menu_items(active, category, sort_order);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
