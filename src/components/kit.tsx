import React from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Text, TextInput } from "@/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import type { IconName } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import type { IllustrationName } from "@/data/menu";
import { Button, IconButton, PressableSurface, SecondaryButton } from "@/components/button";
import { a11yState } from "@/components/a11y";

export { Button, IconButton, PressableSurface, SecondaryButton } from "@/components/button";
export type { ButtonProps, ButtonSize, ButtonVariant, IconButtonProps } from "@/components/button";
export { a11yState } from "@/components/a11y";

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
  const content = <View className={`flex-1 ${dark ? "bg-espresso" : "bg-background"} ${className}`}>{children}</View>;
  return scroll ? <ScrollView className={`flex-1 ${dark ? "bg-espresso" : "bg-background"}`} showsVerticalScrollIndicator={false}>{content}</ScrollView> : content;
}

/** Mock status bar from the design (9:41 + signal + battery). */
export function StatusLine({ dark = false }: { dark?: boolean }) {
  const insets = useSafeAreaInsets();
  const tone = dark ? "text-white" : "text-ink";
  return (
    <View style={{ paddingTop: Math.max(insets.top, 12) }} className={`px-7 pb-1 flex-row items-center justify-between ${tone}`}>
      <Text className={`text-[13px] font-bold ${tone}`}>9:41</Text>
      <View className="flex-row items-center gap-1.5">
        <SignalBars color={dark ? "#FFFFFF" : "#2B1D16"} />
        <Battery color={dark ? "#FFFFFF" : "#2B1D16"} />
      </View>
    </View>
  );
}

function SignalBars({ color }: { color: string }) {
  return (
    <View className="flex-row items-end gap-[2px] h-[10px]">
      {[3, 5, 7, 10].map((h) => (
        <View key={h} style={{ height: h, backgroundColor: color }} className="w-[3px] rounded-sm" />
      ))}
    </View>
  );
}

function Battery({ color }: { color: string }) {
  return (
    <View className="flex-row items-center gap-[2px]">
      <View style={{ borderColor: color }} className="w-[22px] h-[11px] rounded-[3px] border opacity-60 p-[1.5px]">
        <View style={{ backgroundColor: color }} className="h-full w-[70%] rounded-[1px]" />
      </View>
      <View style={{ backgroundColor: color }} className="w-[2px] h-[4px] rounded-r opacity-60" />
    </View>
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
    <View className="px-5 flex-row items-center justify-between mt-1">
      <View className="flex-row items-center gap-3">
        <RoundButton name="back" onPress={onBack ?? (() => router.back())} />
        <Text className="text-[19px] font-bold tracking-tight text-ink">{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function RoundButton({
  name,
  onPress,
  size = 40,
  tone = "light",
}: {
  name: IconName;
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

const tabRoutes: Record<string, { href: string; icon: IconName }> = {
  home: { href: "/home", icon: "home" },
  menu: { href: "/menu", icon: "menu" },
  bag: { href: "/bag", icon: "bag" },
  profile: { href: "/profile", icon: "user" },
};

export function BottomNav({ active, count = 0 }: { active: keyof typeof tabRoutes; count?: number }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="mt-auto bg-card rounded-t-[26px] flex-row justify-around items-start px-2 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
      {(Object.keys(tabRoutes) as Array<keyof typeof tabRoutes>).map((key) => {
        const tab = tabRoutes[key];
        const isActive = active === key;
        return (
          <View key={key} className="relative">
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
              <View className="absolute -top-1 right-1 bg-caramel rounded-full w-[17px] h-[17px] items-center justify-center">
                <Text className="text-white text-[10px] font-bold">{count}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
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
    <View className="flex-row items-center gap-3">
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
    </View>
  );
}

export function Dots({ total = 3, active = 0 }: { total?: number; active?: number }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} className={`rounded-full h-[7px] ${i === active ? "w-[22px] bg-caramel" : "w-[7px] bg-[#D9C8AC]"}`} />
      ))}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[16px] font-bold">{title}</Text>
      {action ? <Button label={action} variant="link" size="sm" onPress={onAction} /> : null}
    </View>
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
    <View className="flex-1 bg-card rounded-[20px] p-2.5">
      <PressableSurface onPress={onPress} accessibilityLabel={name}>
        <View style={{ backgroundColor: tint }} className="h-[92px] rounded-[12px] items-center justify-center">
          <Illustration name={art} size={74} />
        </View>
        <Text className="font-bold text-[13.5px] mt-2">{name}</Text>
      </PressableSurface>
      <View className="flex-row items-center justify-between mt-1">
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
      </View>
    </View>
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
    <View className="bg-card rounded-[20px] flex-row items-center p-2.5">
      <PressableSurface onPress={onPress} accessibilityLabel={name} className="flex-1 flex-row items-center">
        <View style={{ backgroundColor: tint }} className="w-14 h-14 rounded-2xl items-center justify-center">
          <Illustration name={art} size={44} />
        </View>
        <View className="flex-1 ml-3">
          <Text className="font-bold text-[14px]">{name}</Text>
          <Text className="text-[11.5px] text-muted mt-0.5">{description}</Text>
          <Text className="text-[14px] font-bold mt-1">৳{price}</Text>
        </View>
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
    </View>
  );
}

export function Divider() {
  return <View className="h-px bg-line my-1" />;
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
    <View className="mb-3">
      <Text className="text-[13px] font-bold mb-2 text-ink">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B09A85"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={label}
        className={`bg-card rounded-[18px] h-[52px] px-4 text-[15px] text-ink border ${error ? "border-destructive" : "border-line"}`}
      />
      {error ? <Text className="text-[12px] text-destructive mt-1">{error}</Text> : null}
    </View>
  );
}

export function FormMessage({ message, tone = "error" }: { message: string | null; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <View className={`rounded-2xl px-4 py-3 mt-2 ${tone === "error" ? "bg-destructive/10" : "bg-sage/15"}`}>
      <Text className={`text-[13px] font-semibold ${tone === "error" ? "text-destructive" : "text-sage"}`}>{message}</Text>
    </View>
  );
}

export function LoadingView({ label = "Loading…" }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3" accessibilityRole="progressbar">
      <ActivityIndicator size="large" color="#C8873F" />
      <Text className="text-[13px] text-muted">{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3">
      <Text className="text-[17px] font-bold text-ink text-center">Something went wrong</Text>
      <Text className="text-[13px] text-muted text-center">{message}</Text>
      {onRetry ? (
        <Button label="Try again" variant="primary" size="md" onPress={onRetry} className="mt-2 min-w-[160px]" />
      ) : null}
    </View>
  );
}

export function EmptyView({ title, message, action, onAction }: { title: string; message: string; action?: string; onAction?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-10 gap-2">
      <Illustration name="cup" size={72} />
      <Text className="text-[17px] font-bold text-ink text-center mt-2">{title}</Text>
      <Text className="text-[13px] text-muted text-center">{message}</Text>
      {action ? (
        <Button label={action} variant="secondary" size="md" onPress={onAction} className="mt-3 min-w-[180px]" />
      ) : null}
    </View>
  );
}
