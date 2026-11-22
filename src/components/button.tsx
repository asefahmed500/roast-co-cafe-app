import React, { useCallback, useRef, useState } from "react";
import { Animated, ActivityIndicator, Platform, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "@/components/typography";
import { Icon, type IconName } from "@/components/icons";
import { a11yState } from "@/components/a11y";
import { brand } from "@/theme";

/* ------------------------------------------------------------------ *
 * Premium button system — one source of truth for every interactive
 * control in the app. Tokens come from src/theme.ts; only interaction
 * shades live here so hover/active states can be animated.
 * ------------------------------------------------------------------ */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "soft"
  | "icon";

export type ButtonSize = "sm" | "md" | "lg";

type Tone = { bg: string; fg: string; border: string; hover: string; active: string };

const TONES: Record<Exclude<ButtonVariant, "icon">, Tone> = {
  primary: {
    bg: brand.espresso, fg: brand.onDark, border: brand.espresso,
    hover: "#3D2A20", active: "#241710",
  },
  secondary: {
    bg: brand.caramel, fg: brand.onDark, border: brand.caramel,
    hover: "#B87B35", active: "#A56C2C",
  },
  outline: {
    bg: brand.card, fg: brand.ink, border: brand.line,
    hover: "#F6ECDD", active: brand.latte,
  },
  ghost: {
    bg: "transparent", fg: brand.muted, border: "transparent",
    hover: "rgba(236,220,194,0.55)", active: brand.latte,
  },
  destructive: {
    bg: "#B5483A", fg: brand.onDark, border: "#B5483A",
    hover: "#9E3D31", active: "#873328",
  },
  link: {
    bg: "transparent", fg: brand.caramel, border: "transparent",
    hover: "#A9712F", active: brand.espresso,
  },
  soft: {
    bg: brand.latte, fg: brand.espresso, border: "transparent",
    hover: "#E2D0B4", active: "#D8C3A4",
  },
};

const SIZES: Record<ButtonSize, { height: number; padH: number; font: number; radius: number }> = {
  sm: { height: 36, padH: 14, font: 13, radius: 8 },
  md: { height: 42, padH: 18, font: 14, radius: 10 },
  lg: { height: 48, padH: 22, font: 15, radius: 12 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function useButtonMotion(disabled: boolean) {
  const scale = useRef(new Animated.Value(1)).current;
  const arrow = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const spring = useCallback((value: Animated.Value, to: number) => {
    Animated.spring(value, { toValue: to, useNativeDriver: Platform.OS !== "web", damping: 22, stiffness: 400, mass: 0.5 }).start();
  }, []);

  return {
    hovered,
    focused,
    setHovered,
    setFocused,
    arrow,
    spring,
    onPressIn: () => {
      if (disabled) return;
      spring(scale, 0.975);
    },
    onPressOut: () => spring(scale, 1),
    scale,
  };
}

const webTransition = Platform.OS === "web"
  ? ({ transition: "background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease" } as Record<string, unknown>)
  : {};

function focusRing(focused: boolean, fg: string): StyleProp<ViewStyle> {
  if (Platform.OS === "web") {
    return { boxShadow: focused ? `0 0 0 3px ${fg}40` : "none" } as StyleProp<ViewStyle>;
  }
  return focused ? { borderColor: fg, borderWidth: 2 } : {};
}

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  selected?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  accessibilityLabel?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  selected,
  fullWidth = false,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  className = "",
  style,
  hitSlop,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const { hovered, focused, setHovered, setFocused, arrow, spring, onPressIn, onPressOut, scale } = useButtonMotion(isDisabled);
  const tone = TONES[variant === "icon" ? "primary" : variant];
  const metrics = SIZES[size];
  const background = isDisabled
    ? (variant === "primary" || variant === "secondary" || variant === "destructive" ? brand.line : "transparent")
    : hovered ? tone.hover : tone.bg;
  const foreground = isDisabled ? brand.muted : tone.fg;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      {...a11yState(selected ?? false, { disabled: isDisabled, busy: loading })}
      {...(Platform.OS === "web" ? ({ "aria-disabled": isDisabled, "aria-busy": loading } as Record<string, unknown>) : {})}
      disabled={isDisabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onHoverIn={() => !isDisabled && (setHovered(true), spring(arrow, 3))}
      onHoverOut={() => (setHovered(false), spring(arrow, 0))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          height: metrics.height,
          paddingHorizontal: metrics.padH,
          borderRadius: metrics.radius,
          backgroundColor: background,
          borderColor: tone.border,
          borderWidth: variant === "primary" || variant === "secondary" || variant === "destructive" || variant === "outline" ? 1 : 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          ...webTransition,
          opacity: scale,
          transform: [{ scale }],
          ...(variant === "link" ? { paddingHorizontal: 0 } : {}),
          ...(fullWidth ? { alignSelf: "stretch" as const, width: "100%" as const } : {}),
        },
        focusRing(focused, tone.fg),
        style,
      ]}
      className={className}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : leftIcon ? (
        <Icon name={leftIcon} size={16} color={foreground} />
      ) : null}
      <Text
        numberOfLines={1}
        style={{
          color: foreground,
          fontSize: metrics.font,
          fontWeight: "600",
          letterSpacing: 0.1,
          textDecorationLine: variant === "link" && hovered ? "underline" : "none",
          opacity: loading ? 0.9 : 1,
        }}
      >
        {label}
      </Text>
      {!loading && rightIcon ? (
        <Animated.View style={{ transform: [{ translateX: arrow }] }}>
          <Icon name={rightIcon} size={16} color={foreground} />
        </Animated.View>
      ) : null}
    </AnimatedPressable>
  );
}

/** Wide, quiet action for secondary paths (empty states, dialogs, promos). */
export function SecondaryButton({
  label,
  onPress,
  className = "",
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Button
      label={label}
      onPress={onPress}
      variant="outline"
      size="md"
      fullWidth
      disabled={disabled}
      loading={loading}
      className={className}
    />
  );
}

/** Animated tappable surface for cards and list rows (not a labeled button). */
export function PressableSurface({
  children,
  onPress,
  accessibilityRole = "button",
  accessibilityLabel,
  className = "",
  style,
  ...rest
}: React.ComponentProps<typeof Pressable> & { children?: React.ReactNode }) {
  const { onPressIn, onPressOut, scale } = useButtonMotion(false);
  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[{ ...webTransition, opacity: scale, transform: [{ scale }] }, style as never]}
      className={className}
    >
      {children}
    </AnimatedPressable>
  );
}

export type IconButtonProps = {
  name: IconName;
  onPress?: () => void;
  accessibilityLabel?: string;
  variant?: "soft" | "outline" | "ghost" | "primary" | "secondary" | "destructive";
  size?: ButtonSize;
  active?: boolean;
  disabled?: boolean;
  role?: "button" | "tab" | "radio";
  className?: string;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
};

export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  variant = "soft",
  size = "md",
  active = false,
  disabled = false,
  role = "button",
  className = "",
  style,
  hitSlop,
}: IconButtonProps) {
  const isDisabled = disabled;
  const { hovered, focused, setHovered, setFocused, onPressIn, onPressOut, scale } = useButtonMotion(isDisabled);
  const tone = TONES[variant];
  const metrics = SIZES[size];
  const box = metrics.height;
  const background = isDisabled ? brand.line : active ? brand.caramelTint : hovered ? tone.hover : tone.bg;
  const iconColor = isDisabled ? brand.muted : active ? brand.caramel : tone.fg;

  return (
    <AnimatedPressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? name}
      {...a11yState(active, { disabled: isDisabled })}
      disabled={isDisabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onHoverIn={() => !isDisabled && setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          width: box,
          height: box,
          borderRadius: metrics.radius,
          backgroundColor: background,
          borderColor: active ? brand.caramel : tone.border,
          borderWidth: variant === "ghost" ? 0 : 1,
          alignItems: "center",
          justifyContent: "center",
          ...webTransition,
          opacity: scale,
          transform: [{ scale }],
        },
        focusRing(focused, active ? brand.caramel : tone.fg),
        style,
      ]}
      className={className}
    >
      <Icon name={name} size={size === "sm" ? 16 : size === "lg" ? 22 : 19} color={iconColor} />
    </AnimatedPressable>
  );
}
