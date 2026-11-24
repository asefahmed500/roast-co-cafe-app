/**
 * Roast & Co. design tokens — single source of truth.
 * Values are ported from cafe-screens.html so every screen shares one palette.
 */

export const brand = {
  background: "#F7F1E6",
  card: "#FFFAF2",
  ink: "#2B1D16",
  muted: "#8A7566",
  espresso: "#2F1F17",
  caramel: "#C8873F",
  latte: "#ECDCC2",
  sage: "#7D9168",
  line: "#EADFCC",
  sageTint: "#DFE6D3",
  caramelTint: "#F6E8D3",
  onDark: "#FFFFFF",
  onDarkMuted: "#CDB8A0",
  // Supporting roles mirrored from global.css semantic tokens. Raw values live
  // here only because a few native props (placeholderTextColor, SVG stroke,
  // ActivityIndicator color) require a concrete color string.
  placeholder: "#B09A85",
  lineStrong: "#D8C4A4",
  caramelDeep: "#9B7B60",
  map: "#E8DFCC",
  dots: "#D9C8AC",
  segment: "#E8DCC5",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
  full: 9999,
} as const;

export const type = {
  display: { fontSize: 30, fontWeight: "700" as const, letterSpacing: -0.6 },
  title1: { fontSize: 27, fontWeight: "700" as const, letterSpacing: -0.7 },
  title2: { fontSize: 19, fontWeight: "700" as const, letterSpacing: -0.4 },
  title3: { fontSize: 16, fontWeight: "700" as const },
  body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 21 },
  bodyBold: { fontSize: 14, fontWeight: "700" as const },
  caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 17 },
  captionBold: { fontSize: 12, fontWeight: "700" as const },
  overline: { fontSize: 10, fontWeight: "700" as const, letterSpacing: 1 },
} as const;

export const motion = {
  press: 120,
  feedback: 180,
  transition: 240,
  sheet: 360,
} as const;

/** Convenience color aliases used by semantic-token naming in global.css. */
export const colorToken: Record<keyof typeof brand, string> = brand;
