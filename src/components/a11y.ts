/**
 * Native uses `accessibilityState`; React Native Web 0.21 reads the flat
 * `accessibilityChecked` / `accessibilitySelected` props instead. Supplying
 * both keeps radios, tabs and chips correctly announced on every platform.
 */
export function a11yState(
  active: boolean,
  extra?: { disabled?: boolean; busy?: boolean },
): {
  accessibilityState: { selected: boolean; checked: boolean; disabled?: boolean; busy?: boolean };
  accessibilityChecked: boolean;
  accessibilitySelected: boolean;
} {
  return {
    accessibilityState: { selected: active, checked: active, ...extra },
    accessibilityChecked: active,
    accessibilitySelected: active,
  };
}
