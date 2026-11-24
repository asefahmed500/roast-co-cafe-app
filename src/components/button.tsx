import React from "react";
import { Platform, type StyleProp, type ViewStyle } from "react-native";
import {
  Button as GButton,
  ButtonSpinner as GButtonSpinner,
  ButtonText as GButtonText,
} from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Icon, type IconName } from "@/components/icons";
import { a11yState } from "@/components/a11y";

/* ------------------------------------------------------------------ *
 * App buttons built on Gluestack's compound Button primitive.
 * The public API is unchanged so every screen keeps working, while the
 * implementation now uses semantic tokens and ButtonText/ButtonIcon.
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

type GVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

const VARIANTS: Record<ButtonVariant, GVariant> = {
  primary: "default",
  secondary: "default",
  outline: "outline",
  ghost: "ghost",
  destructive: "destructive",
  link: "link",
  soft: "secondary",
  icon: "default",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 rounded-lg",
  md: "h-10 px-4 rounded-lg",
  lg: "h-12 px-5 rounded-xl",
};

/** Extra classes for brand variants that need a token the stock set lacks. */
const TONES: Partial<Record<ButtonVariant, string>> = {
  secondary:
    "bg-caramel border-caramel data-[hover=true]:bg-caramel/90 data-[active=true]:bg-caramel/90",
  outline: "bg-card",
  link: "px-0",
};

function webA11y(disabled: boolean, busy: boolean) {
  return Platform.OS === "web"
    ? ({ "aria-disabled": disabled, "aria-busy": busy } as Record<string, unknown>)
    : {};
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
  const classes = [
    SIZES[size],
    TONES[variant] ?? "",
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const iconTone =
    variant === "link" ? "text-caramel"
    : variant === "primary" || variant === "secondary" || variant === "destructive"
      ? "text-on-dark"
      : "text-ink";

  return (
    <GButton
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      {...a11yState(selected ?? false, { disabled: isDisabled, busy: loading })}
      {...webA11y(isDisabled, loading)}
      isDisabled={isDisabled}
      hitSlop={hitSlop}
      onPress={onPress}
      variant={VARIANTS[variant]}
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
      className={classes}
      style={style}
    >
      {loading ? <GButtonSpinner /> : null}
      {!loading && leftIcon ? <Icon name={leftIcon} size={16} className={iconTone} /> : null}
      <GButtonText>{label}</GButtonText>
      {!loading && rightIcon ? <Icon name={rightIcon} size={16} className={iconTone} /> : null}
    </GButton>
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

/** Gluestack Pressable for tappable cards and list rows. */
export function PressableSurface({
  children,
  className = "",
  accessibilityRole = "button",
  ...rest
}: React.ComponentProps<typeof Pressable> & { children?: React.ReactNode }) {
  return (
    <Pressable
      {...rest}
      accessibilityRole={accessibilityRole}
      {...({ role: accessibilityRole } as Record<string, unknown>)}
      className={`web:cursor-pointer web:transition-transform active:scale-[0.99] ${className}`}
    >
      {children}
    </Pressable>
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

const ICON_TONES: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  soft: "bg-secondary border-transparent",
  outline: "bg-card border-border",
  ghost: "bg-transparent border-transparent",
  primary: "bg-primary border-primary",
  secondary: "bg-caramel border-caramel",
  destructive: "bg-destructive border-destructive",
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
  const classes = [
    "web:cursor-pointer items-center justify-center",
    ICON_TONES[variant],
    active ? "bg-caramel-tint border-caramel" : "",
    size === "sm" ? "h-9 w-9" : size === "lg" ? "h-12 w-12" : "h-10 w-10",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <GButton
      accessibilityRole={role}
      role={role}
      accessibilityLabel={accessibilityLabel ?? name}
      {...a11yState(active, { disabled })}
      {...webA11y(disabled, false)}
      isDisabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      variant="ghost"
      className={classes}
      style={style}
    >
      <Icon name={name} size={size === "sm" ? 16 : size === "lg" ? 22 : 19} className={active ? "text-caramel" : "text-ink"} />
    </GButton>
  );
}
