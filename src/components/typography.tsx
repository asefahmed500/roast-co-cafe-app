import React from "react";
import { StyleSheet } from "react-native";
import { Text as GText } from "@/components/ui/text";

/** Loaded in src/app/_layout.tsx via expo-font. */
export const APP_FONT = "Geist";

type AppTextProps = React.ComponentProps<typeof GText>;

/**
 * App text is a Gluestack Text with the bundled Geist family applied.
 * The inline font style is intentional: expo-font registers the family at
 * runtime, so it cannot be expressed as a static CSS token.
 */
export function Text(props: AppTextProps) {
  return (
    <GText
      {...props}
      style={StyleSheet.flatten([
        { fontFamily: APP_FONT, includeFontPadding: false },
        props.style,
      ])}
    />
  );
}
