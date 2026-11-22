import React from "react";
import { Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from "react-native";

/** Loaded in src/app/_layout.tsx via expo-font. */
export const APP_FONT = "Geist";

/** Geist everywhere, with Android's extra text padding removed for tighter typography. */
export function Text(props: TextProps) {
  return <RNText {...props} style={[{ fontFamily: APP_FONT, includeFontPadding: false }, props.style]} />;
}

/** TextInput counterpart so typed text matches the rest of the UI. */
export function TextInput(props: TextInputProps) {
  return <RNTextInput {...props} style={[{ fontFamily: APP_FONT, includeFontPadding: false }, props.style]} />;
}
