import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Divider as GDivider } from "@/components/ui/divider";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { brand } from "@/theme";
import { Text } from "@/components/typography";
import { Illustration } from "@/components/illustrations";
import type { IllustrationName } from "@/data/menu";
import { Button, IconButton, PressableSurface, SecondaryButton } from "@/components/button";
import { a11yState } from "@/components/a11y";

export { Button, IconButton, PressableSurface, SecondaryButton } from "@/components/button";
export type { ButtonProps, ButtonSize, ButtonVariant, IconButtonProps } from "@/components/button";
export { a11yState } from "@/components/a11y";

/** Data-driven decorative tints map to semantic surface tokens. */
const TINT_CLASSES: Record<string, string> = {
  "#ECDCC2": "bg-latte",
  "#DFE6D3": "bg-sage-tint",
  "#F6E8D3": "bg-caramel-tint",
};
export const tintClass = (tint: string): string => TINT_CLASSES[tint] ?? "bg-muted";

/* ---------- Layout ---------- */

export function Screen({
  children,
  dark = false,
  scroll = false,
  className = "",
}: {
  children: React.ReactNode;
  dark?: boolean;
  scroll?: boolean;
  className?: string;
}) {
  const content = (
    <Box className={`flex-1 ${dark ? "bg-espresso" : "bg-background"} ${className}`}>
      {children}
    </Box>
  );
  return scroll ? (
    <ScrollView className={`flex-1 ${dark ? "bg-espresso" : "bg-background"}`} showsVerticalScrollIndicator={false}>
      {content}
    </ScrollView>
  ) : (
    content
  );
}

/** Mock status bar from the design (9:41 + signal + battery). */
export function StatusLine({ dark = false }: { dark?: boolean }) {
  const insets = useSafeAreaInsets();
  const tone = dark ? "text-on-dark" : "text-ink";
  const fill = dark ? "bg-on-dark" : "bg-ink";
  return (
    <HStack
      // Dynamic safe-area inset cannot be expressed as a static className.
      style={{ paddingTop: Math.max(insets.top, 12) }}
      className={`px-7 pb-1 items-center justify-between ${tone}`}
    >
      <Text className={`text-[13px] font-bold ${tone}`}>9:41</Text>
      <HStack className="items-center gap-1.5">
        <SignalBars fill={fill} />
        <Battery fill={fill} />
      </HStack>
    </HStack>
  );
}

function SignalBars({ fill }: { fill: string }) {
  return (
    <HStack className="items-end gap-0.5 h-2.5">
      {[3, 5, 7, 10].map((h) => (
        <Box key={h} style={{ height: h }} className={`w-[3px] rounded-sm ${fill}`} />
      ))}
    </HStack>
  );
}

function Battery({ fill }: { fill: string }) {
  return (
    <HStack className="items-center gap-0.5">
      <Box className="w-[22px] h-[11px] rounded-[3px] border border-line-strong/40 p-[1.5px]">
        <Box className={`h-full w-[70%] rounded-[1px] ${fill}`} />
      </Box>
      <Box className={`w-[2px] h-1 rounded-r ${fill}/60`} />
    </HStack>
  );
}

/* ---------- Header ---------- */

export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <HStack className="px-5 items-center justify-between mt-1">
      <HStack className="items-center gap-3">
        <RoundButton name="back" onPress={onBack ?? (() => router.back())} />
        <Text className="text-[19px] font-bold tracking-tight text-ink">{title}</Text>
      </HStack>
      {right}
    </HStack>
  );
}

export function RoundButton({
  name,
  onPress,
  size = 40,
  tone = "light",
}: {
  name: import("@/components/icons").IconName;
  onPress?: () => void;
  size?: number;
  tone?: "light" | "caramel" | "outline";
}) {
  const variant = tone === "caramel" ? "secondary" : tone === "outline" ? "outline" : "soft";
  return (
    <IconButton
      name={name}
      onPress={onPress}
      accessibilityLabel={name}
      variant={variant}
      size={size >= 46 ? "lg" : "md"}
      style={{ width: size, height: size }}
    />
  );
}

/* ---------- Bottom navigation ---------- */

const tabRoutes: Record<string, { href: string; icon: import("@/components/icons").IconName }> = {
  home: { href: "/home", icon: "home" },
  menu: { href: "/menu", icon: "menu" },
  bag: { href: "/bag", icon: "bag" },
  profile: { href: "/profile", icon: "user" },
};

export function BottomNav({ active, count = 0 }: { active: keyof typeof tabRoutes; count?: number }) {
  const insets = useSafeAreaInsets();
  return (
    <HStack
      // Dynamic safe-area inset cannot be expressed as a static className.
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
      className="mt-auto bg-card rounded-t-[26px] justify-around items-start px-2 pt-3"
    >
      {(Object.keys(tabRoutes) as Array<keyof typeof tabRoutes>).map((key) => {
        const tab = tabRoutes[key];
        const isActive = active === key;
        return (
          <Box key={key} className="relative">
            <IconButton
              name={tab.icon}
              role="tab"
              active={isActive}
              variant="ghost"
              onPress={() => router.push(tab.href as never)}
              accessibilityLabel={key}
              style={{ width: 50, height: 44 }}
            />
            {key === "bag" && count > 0 ? (
              <Box className="absolute -top-1 right-1 bg-caramel rounded-full w-[17px] h-[17px] items-center justify-center">
                <Text className="text-on-dark text-[10px] font-bold">{count}</Text>
              </Box>
            ) : null}
          </Box>
        );
      })}
    </HStack>
  );
}

/* ---------- Controls ---------- */

export function Chip({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Button
      label={label}
      variant={active ? "primary" : "outline"}
      size="sm"
      selected={active}
      onPress={onPress}
    />
  );
}

export function Pill({
  label,
  active = false,
  onPress,
  className = "",
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Button
      label={label}
      variant={active ? "primary" : "outline"}
      size="sm"
      fullWidth
      selected={active}
      onPress={onPress}
      className={className}
    />
  );
}

export function PrimaryButton({
  label,
  onPress,
  variant = "dark",
  className = "",
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress?: () => void;
  variant?: "dark" | "caramel" | "outline";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Button
      label={label}
      variant={variant === "caramel" ? "secondary" : variant === "outline" ? "outline" : "primary"}
      size="lg"
      fullWidth
      disabled={disabled}
      loading={loading}
      rightIcon={variant === "outline" ? undefined : "chev"}
      className={className}
      onPress={onPress}
    />
  );
}

export function Stepper({
  value,
  onChange,
  compact = false,
}: {
  value: number;
  onChange: (next: number) => void;
  compact?: boolean;
}) {
  const size = compact ? 26 : 32;
  return (
    <HStack className="items-center gap-3">
      <IconButton
        name="minus"
        accessibilityLabel="Decrease quantity"
        variant="outline"
        size="sm"
        onPress={() => onChange(value - 1)}
        style={{ width: size, height: size }}
      />
      <Text className="text-[15px] font-bold min-w-[14px] text-center">{value}</Text>
      <IconButton
        name="plus"
        accessibilityLabel="Increase quantity"
        variant="secondary"
        size="sm"
        disabled={value >= 99}
        onPress={() => onChange(value + 1)}
        style={{ width: size, height: size }}
      />
    </HStack>
  );
}

export function Dots({ total = 3, active = 0 }: { total?: number; active?: number }) {
  return (
    <HStack className="items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          className={`rounded-full h-[7px] ${i === active ? "w-[22px] bg-caramel" : "w-[7px] bg-dots"}`}
        />
      ))}
    </HStack>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <HStack className="items-center justify-between">
      <Text className="text-[16px] font-bold">{title}</Text>
      {action ? <Button label={action} variant="link" size="sm" onPress={onAction} /> : null}
    </HStack>
  );
}

/* ---------- Cards ---------- */

export function ProductCard({
  name,
  price,
  art,
  tint,
  onAdd,
  onPress,
}: {
  name: string;
  price: number;
  art: IllustrationName;
  tint: string;
  onAdd?: () => void;
  onPress?: () => void;
}) {
  return (
    <Box className="flex-1 bg-card rounded-[20px] p-2.5">
      <PressableSurface onPress={onPress} accessibilityLabel={name}>
        <Box className={`h-[92px] rounded-[12px] items-center justify-center ${tintClass(tint)}`}>
          <Illustration name={art} size={74} />
        </Box>
        <Text className="font-bold text-[13.5px] mt-2">{name}</Text>
      </PressableSurface>
      <HStack className="items-center justify-between mt-1">
        <Text className="text-[14px] font-bold">৳{price}</Text>
        <IconButton
          name="plus"
          accessibilityLabel={`Add ${name}`}
          variant="secondary"
          size="sm"
          hitSlop={6}
          onPress={onAdd}
          style={{ width: 30, height: 30 }}
        />
      </HStack>
    </Box>
  );
}

export function MenuRow({
  name,
  description,
  price,
  art,
  tint,
  onAdd,
  onPress,
}: {
  name: string;
  description: string;
  price: number;
  art: IllustrationName;
  tint: string;
  onAdd?: () => void;
  onPress?: () => void;
}) {
  return (
    <Box className="bg-card rounded-[20px] flex-row items-center p-2.5">
      <PressableSurface onPress={onPress} accessibilityLabel={name} className="flex-1 flex-row items-center">
        <Box className={`w-14 h-14 rounded-2xl items-center justify-center ${tintClass(tint)}`}>
          <Illustration name={art} size={44} />
        </Box>
        <Box className="flex-1 ml-3">
          <Text className="font-bold text-[14px]">{name}</Text>
          <Text className="text-[11.5px] text-muted mt-0.5">{description}</Text>
          <Text className="text-[14px] font-bold mt-1">৳{price}</Text>
        </Box>
      </PressableSurface>
      <IconButton
        name="plus"
        accessibilityLabel={`Add ${name}`}
        variant="secondary"
        size="sm"
        hitSlop={6}
        onPress={onAdd}
        style={{ width: 34, height: 34, marginLeft: 8 }}
      />
    </Box>
  );
}

export function Divider() {
  return <GDivider orientation="horizontal" className="bg-line my-1" />;
}

/* ---------- Forms & states ---------- */

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  keyboardType = "default",
  autoCapitalize = "none",
  onSubmitEditing,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  secure?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words" | "sentences";
  onSubmitEditing?: () => void;
}) {
  return (
    <FormControl isInvalid={Boolean(error)} className="mb-3">
      <FormControlLabel>
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>
      <Input className="bg-card rounded-[18px] h-[52px] border-line">
        <InputField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={brand.placeholder}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={label}
          aria-label={label}
          className="text-[15px] text-ink"
        />
      </Input>
      {error ? (
        <FormControlError>
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
}

export function FormMessage({ message, tone = "error" }: { message: string | null; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <Box
      accessibilityLiveRegion="polite"
      className={`rounded-2xl px-4 py-3 mt-2 ${tone === "error" ? "bg-destructive/10" : "bg-sage/15"}`}
    >
      <Text className={`text-[13px] font-semibold ${tone === "error" ? "text-destructive" : "text-sage"}`}>
        {message}
      </Text>
    </Box>
  );
}

export function LoadingView({ label = "Loading…" }: { label?: string }) {
  return (
    <VStack className="flex-1 items-center justify-center gap-3" accessibilityRole="progressbar">
      <Spinner size="lg" />
      <Text className="text-[13px] text-muted">{label}</Text>
    </VStack>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <VStack className="flex-1 items-center justify-center px-8 gap-3">
      <Text className="text-[17px] font-bold text-ink text-center">Something went wrong</Text>
      <Text className="text-[13px] text-muted text-center">{message}</Text>
      {onRetry ? (
        <Button label="Try again" variant="primary" size="md" onPress={onRetry} className="mt-2 min-w-[160px]" />
      ) : null}
    </VStack>
  );
}

export function EmptyView({ title, message, action, onAction }: { title: string; message: string; action?: string; onAction?: () => void }) {
  return (
    <VStack className="flex-1 items-center justify-center px-10 gap-2">
      <Illustration name="cup" size={72} />
      <Text className="text-[17px] font-bold text-ink text-center mt-2">{title}</Text>
      <Text className="text-[13px] text-muted text-center">{message}</Text>
      {action ? (
        <Button label={action} variant="secondary" size="md" onPress={onAction} className="mt-3 min-w-[180px]" />
      ) : null}
    </VStack>
  );
}
