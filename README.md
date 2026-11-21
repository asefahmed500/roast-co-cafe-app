# Roast & Co. — café app

A React Native (Expo) UI built from the 12-screen HTML design in `cafe-screens.html`.
Styled with gluestack-ui v5 tokens + NativeWind v5 (Tailwind v4), navigation with Expo Router.

## Run

```bash
npm install
npm start            # then press i (iOS) / a (Android) / w (web)
npm run ios
npm run android
```

Requires the Expo Go app or a development build for a physical device.

## Structure

```
src/
  app/                 # Expo Router routes (one file per screen)
    (app)/             # tabbed area: home, menu, bag, profile
    item/[id].tsx      # item detail
    order/[id].tsx     # order tracking
  screens/             # screen bodies (thin routes render these)
  components/
    ui/                # gluestack-ui v5 components (generated)
    kit.tsx            # shared app components (cards, nav, buttons, chips)
    icons.tsx          # SVG icons from the design
    illustrations.tsx  # cup / iced / croissant / cake / bean art
  data/menu.ts         # menu items, cafés, categories
  store/cart.tsx       # local cart state + totals + promo
  theme.ts             # token values mirrored in global.css
  global.css           # semantic color tokens (bg-background, text-ink, …)
```

## Design tokens

Colors are defined once in `src/global.css` as semantic Tailwind tokens
(`background`, `card`, `foreground`, `muted`, `espresso`, `caramel`, `latte`,
`sage`, `line`, …). Components use only these classes — no raw hex values.

## Implemented screens

1. Splash
2. Welcome 1 – Coffee your way
3. Welcome 2 – Order ahead
4. Sign in
5. Choose café
6. Home
7. Menu
8. Item detail
9. Your bag
10. Checkout
11. Order tracking
12. Rewards & profile

Interactions are local-state only: category filters, add-to-bag, quantity
steppers, promo code (`COFFEE10`), option selection, and place-order → tracking.
No backend is connected yet.
