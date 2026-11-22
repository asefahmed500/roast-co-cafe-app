# Roast & Co. — full-stack café app

A production-oriented, cross-platform coffee ordering app. The UI is an Expo /
React Native app (iOS, Android and web) built from the 12-screen design in
`cafe-screens.html`. The backend is a Cloudflare Worker with Hono, a Cloudflare
D1 (SQLite) database, email/password sessions, Zod validation, rate limiting and
integration tests that run inside the Workers runtime.

## Architecture

```
Expo Router app (src/app, src/screens)
   │  typed API client (src/lib/api.ts)
   │  AuthProvider · CatalogProvider · CafeProvider · CartProvider
   ▼
Cloudflare Worker (worker/src/index.ts, Hono)
   │  D1 binding "DB"
   ▼
D1 tables: users, sessions, cafes, menu_items, promos, carts, orders, rate_limits
```

Security choices:

- Passwords are hashed with PBKDF2-SHA256 (210k iterations, per-user salt).
- Sessions are opaque 256-bit tokens; only their SHA-256 hash is stored, and
  tokens are compared in constant time. Sessions expire (7 days by default).
- Prices are recomputed from `menu_items` on the server — client-sent prices
  are ignored.
- All request bodies are validated with shared Zod schemas.
- Auth endpoints are rate limited per IP.
- Security headers + configurable CORS are applied to `/api/*`.

## Run locally

```bash
npm install
cp .env.example .env          # optional; defaults to http://localhost:8787

# Terminal 1 — API on http://localhost:8787
npm run db:migrate:local
npm run worker:dev

# Terminal 2 — app
npm start                     # i / a / w, or `npm run web`
```

For a physical device set `EXPO_PUBLIC_API_URL` in `.env` to your machine's LAN
address (`http://192.168.x.x:8787`) and allow port 8787 through your firewall.
The Android emulator uses `http://10.0.2.2:8787`.

## Quality checks

```bash
npm run typecheck   # TypeScript across app + Worker + tests
npm test            # 11 Workers-runtime integration tests (Vitest plugin)
npm run test:e2e    # builds web bundle + 10 Playwright E2E tests (Chrome)
npm run web:export  # production web bundle
```

The API suite covers health/menu seeding, validation errors (including
malformed JSON), registration and login, session invalidation, rate limiting,
cart/promo persistence, option surcharges, loyalty updates, idempotent order
creation, café validation, pricing and ownership/IDOR checks.

The Playwright suite runs against the **built** web bundle and a real local
Worker against D1. It covers onboarding, validation, duplicate accounts, login,
session restore, protected-route redirects, cross-account cart isolation,
café search/selection, menu filters/search, notifications, favourites, loading
states and the complete order workflow (options → promo → checkout → tracking →
history → cleared cart). Each test uses an isolated client IP so auth rate
limits do not interfere.

## Deploy the API

1. Create the D1 databases in Cloudflare:

   ```bash
   npx wrangler d1 create roast-co-db
   npx wrangler d1 create roast-co-db-staging
   ```

2. Copy each returned `database_id` into the matching entry in
   `wrangler.jsonc` (replace the `00000000-…` placeholders). Set
   `ALLOWED_ORIGIN` to your web app origin (comma-separated list allowed).

3. Apply migrations and deploy:

   ```bash
   npm run db:migrate:local
   npm run db:migrate:staging
   npm run db:migrate:remote
   npm run worker:deploy:staging
   npm run worker:deploy
   ```

4. Set the production API URL in `app.json` → `extra.apiUrl` and in
   `eas.json` build profiles (or pass `EXPO_PUBLIC_API_URL` as an EAS secret).

`wrangler secret put` is available for future secrets; the current API needs
none beyond the Wrangler-managed D1 binding. Workers Logs and Traces are enabled
in `wrangler.jsonc`, and requests emit structured JSON logs.

## Build the apps

```bash
npm install -g eas-cli
eas login
eas init                       # once, links the EAS project id
eas build --profile preview --platform all
eas build --profile production --platform all
```

`eas.json` defines development, preview and production profiles. Submit with
`eas submit --platform ios` / `android` after configuring store credentials.

## API reference

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Liveness |
| POST | `/api/auth/register` | – | Create account, returns token + user |
| POST | `/api/auth/login` | – | Sign in |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/auth/logout` | Bearer | Revoke session |
| GET | `/api/menu`, `/api/menu/:id` | – | Catalog |
| GET | `/api/cafes`, `/api/promos/:code` | – | Locations / promo lookup |
| GET/PUT | `/api/cart` | Bearer | Server-side cart |
| POST/GET | `/api/orders` | Bearer | Place / list orders |
| GET | `/api/orders/:id` | Bearer | Live order status (derived from time) |

Errors use `{ "error": { "code", "message", "issues?" } }`. Validation issues
carry a `path` and `message` for form field mapping.

## Screens

Splash, Welcome 1–2, Sign in, Sign up, Choose café, Home, Menu, Item detail,
Bag, Checkout, Order tracking, Order history, Rewards & profile. All screens
use semantic color tokens from `src/global.css`; raw hex values are confined to
illustrations and theme constants.

## Notes

- The order progress is derived from `created_at` and the chosen ETA, so the
  tracking screen advances naturally without a background job.
- `COFFEE10` is seeded as a 10% promo. Add more rows to `promos` via a new
  migration. Promo selection is persisted with the cart, so totals survive a
  refresh.
- The UI falls back to the bundled menu/café data when the API is unreachable,
  showing a small offline notice instead of a blank screen.
- Favourites are persisted per user; loyalty points/tier/stamps are updated by
  the API when an order is placed.
- Payments are **recorded, not charged**: there is no payment gateway
  integration in this build. Checkout states this explicitly and orders carry a
  `payment_status` (`pending` / `pay_at_counter`).
- Not implemented (no credentials/provider configured): email verification,
  password reset, push/email notifications, roles/permissions, staff fulfilment
  UI, refunds/cancellation, reports/exports. There are no AI features in this
  application.
