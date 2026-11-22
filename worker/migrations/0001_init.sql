-- Roast & Co. initial schema + seed data.
-- Applied with: npm run db:migrate:local  /  npm run db:migrate:remote

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  points        INTEGER NOT NULL DEFAULT 0,
  tier          TEXT NOT NULL DEFAULT 'Bronze',
  coffee_stamps INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cafes (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  distance   TEXT NOT NULL,
  tint       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  price        INTEGER NOT NULL,
  illustration TEXT NOT NULL,
  category     TEXT NOT NULL,
  rating       REAL NOT NULL,
  reviews      INTEGER NOT NULL,
  minutes      INTEGER NOT NULL,
  tint         TEXT NOT NULL,
  active       INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS promos (
  code    TEXT PRIMARY KEY COLLATE NOCASE,
  percent INTEGER NOT NULL,
  active  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS carts (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data       TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id           TEXT PRIMARY KEY,
  order_number INTEGER NOT NULL UNIQUE,
  user_id      TEXT NOT NULL REFERENCES users(id),
  cafe_id      TEXT NOT NULL,
  mode         TEXT NOT NULL,
  payment      TEXT NOT NULL,
  time_slot    TEXT NOT NULL,
  items        TEXT NOT NULL,
  subtotal     INTEGER NOT NULL,
  discount     INTEGER NOT NULL,
  total        INTEGER NOT NULL,
  promo_code   TEXT,
  eta_minutes  INTEGER NOT NULL,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);

-- Cafés
INSERT OR IGNORE INTO cafes (id, name, address, distance, tint, sort_order) VALUES
  ('gulshan-2', 'Gulshan 2', 'Road 11 · Open until 11 pm', '0.8 km', '#F6E8D3', 1),
  ('banani', 'Banani', 'Road 27 · Open until 10 pm', '2.1 km', '#ECDCC2', 2),
  ('dhanmondi', 'Dhanmondi', 'Road 8 · Open until 11 pm', '4.6 km', '#ECDCC2', 3);

-- Menu
INSERT OR IGNORE INTO menu_items
  (id, name, description, price, illustration, category, rating, reviews, minutes, tint, sort_order)
VALUES
  ('caramel-latte', 'Caramel Latte', 'Espresso, steamed milk, caramel', 260, 'cup', 'Hot', 4.8, 126, 5, '#ECDCC2', 1),
  ('iced-americano', 'Iced Americano', 'Double shot over ice', 190, 'iced', 'Cold', 4.7, 84, 4, '#DFE6D3', 2),
  ('butter-croissant', 'Butter Croissant', 'Baked fresh every morning', 150, 'croi', 'Bakery', 4.9, 210, 3, '#DFE6D3', 3),
  ('choco-cake', 'Choco Cake', 'Dark chocolate, soft sponge', 280, 'cake', 'Bakery', 4.6, 58, 3, '#ECDCC2', 4),
  ('cappuccino', 'Cappuccino', 'Rich espresso, airy milk foam', 240, 'cup', 'Hot', 4.7, 97, 5, '#ECDCC2', 5),
  ('iced-latte', 'Iced Latte', 'Chilled espresso and milk', 260, 'iced', 'Cold', 4.8, 143, 4, '#DFE6D3', 6),
  ('espresso', 'Espresso', 'A bold, single origin shot', 160, 'bean', 'Hot', 4.5, 64, 2, '#ECDCC2', 7),
  ('green-tea', 'Green Tea', 'Steamed leaves, light and fresh', 180, 'cup', 'Tea', 4.4, 39, 3, '#DFE6D3', 8);

-- Promotions
INSERT OR IGNORE INTO promos (code, percent, active) VALUES ('COFFEE10', 10, 1);
