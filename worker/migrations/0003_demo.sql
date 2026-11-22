-- Seeded demo account for exploring every screen with real API data.
-- Password: Demo12345! (PBKDF2-SHA256, 210k iterations). The demo login
-- endpoint is gated by the DEMO_ENABLED Worker variable.

INSERT OR IGNORE INTO users
  (id, email, name, password_hash, points, tier, coffee_stamps, created_at)
VALUES
  ('demo-user', 'demo@roastco.app', 'Maya Rahman',
   'pbkdf2$210000$ae43fc711882c9ad4103de5eaac51c33$0a25cc95cf1e3347509fcd51068d5bf6548864194d65c022d36d759bdded8cc7',
   1240, 'Gold', 5, '2026-01-01T09:00:00.000Z');

INSERT INTO carts (user_id, data, promo_code, updated_at)
VALUES (
  'demo-user',
  '[{"id":"caramel-latte","qty":2,"note":"M · Whole milk","options":{"size":"M","milk":"Whole"}},{"id":"butter-croissant","qty":1,"note":"Warmed","options":{"size":"M","milk":"Whole"}}]',
  'COFFEE10',
  strftime('%Y-%m-%dT%H:%M:%fZ','now')
)
ON CONFLICT(user_id) DO UPDATE SET
  data = excluded.data, promo_code = excluded.promo_code, updated_at = excluded.updated_at;

INSERT OR IGNORE INTO orders
  (id, order_number, user_id, cafe_id, mode, payment, payment_status, time_slot,
   items, subtotal, discount, total, promo_code, eta_minutes, created_at, idempotency_key)
VALUES (
  'demo-order-1', 900001, 'demo-user', 'gulshan-2', 'pickup', 'card', 'pending', 'ASAP',
  '[{"id":"caramel-latte","name":"Caramel Latte","qty":2,"note":"M · Whole milk","price":260},{"id":"butter-croissant","name":"Butter Croissant","qty":1,"note":"Warmed","price":150}]',
  670, 67, 603, 'COFFEE10', 10,
  strftime('%Y-%m-%dT%H:%M:%fZ','now'), NULL
);
