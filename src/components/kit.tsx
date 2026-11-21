import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import { Icon, type IconName } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import type { IllustrationName } from "@/data/menu";

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
  const bg = tone === "caramel" ? "bg-caramel" : tone === "outline" ? "bg-transparent border border-line" : "bg-card";
  const stroke = tone === "caramel" ? "#FFFFFF" : "#2B1D16";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => ({ width: size, height: size, opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] })}
      className={`rounded-full items-center justify-center ${bg}`}
    >
      <Icon name={name} size={size * 0.5} color={stroke} />
    </Pressable>
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
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => router.push(tab.href as never)}
            style={({ pressed }) => ({ width: 50, height: 44, opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] })}
            className={`rounded-2xl items-center justify-center ${isActive ? "bg-caramel-tint" : ""}`}
          >
            <Icon name={tab.icon} size={22} color={isActive ? "#C8873F" : "#B09A85"} />
            {key === "bag" && count > 0 ? (
              <View className="absolute -top-1 right-1 bg-caramel rounded-full w-[17px] h-[17px] items-center justify-center">
                <Text className="text-white text-[10px] font-bold">{count}</Text>
              </View>
            ) : null}
          </Pressable>
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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] })}
      className={`px-4 py-2 rounded-full ${active ? "bg-espresso" : "bg-card border border-line"}`}
    >
      <Text className={`text-[12.5px] font-semibold ${active ? "text-white" : "text-ink"}`}>{label}</Text>
    </Pressable>
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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] })}
      className={`flex-1 py-2.5 rounded-xl ${active ? "bg-espresso" : "bg-card border border-line"} ${className}`}
    >
      <Text className={`text-center text-[12.5px] font-semibold ${active ? "text-white" : "text-ink"}`}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  variant = "dark",
  className = "",
}: {
  label: string;
  onPress?: () => void;
  variant?: "dark" | "caramel" | "outline";
  className?: string;
}) {
  const bg = variant === "caramel" ? "bg-caramel" : variant === "outline" ? "bg-transparent border border-line" : "bg-espresso";
  const text = variant === "outline" ? "text-ink" : "text-white";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}
      className={`h-[52px] rounded-full items-center justify-center flex-row gap-2 ${bg} ${className}`}
    >
      <Text className={`text-[15px] font-semibold ${text}`}>{label}</Text>
      {variant !== "outline" ? <Icon name="chev" size={17} color="#FFFFFF" /> : null}
    </Pressable>
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        onPress={() => onChange(value - 1)}
        style={({ pressed }) => ({ width: size, height: size, opacity: pressed ? 0.6 : 1 })}
        className="rounded-full border border-line items-center justify-center"
      >
        <Icon name="minus" size={13} color="#8A7566" />
      </Pressable>
      <Text className="text-[15px] font-bold min-w-[14px] text-center">{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={() => onChange(value + 1)}
        style={({ pressed }) => ({ width: size, height: size, opacity: pressed ? 0.6 : 1 })}
        className="rounded-full bg-caramel items-center justify-center"
      >
        <Icon name="plus" size={13} color="#FFFFFF" />
      </Pressable>
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
      {action ? (
        <Pressable onPress={onAction} accessibilityRole="button">
          <Text className="text-[12.5px] font-semibold text-caramel">{action}</Text>
        </Pressable>
      ) : null}
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
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View style={{ backgroundColor: tint }} className="h-[92px] rounded-[15px] items-center justify-center">
          <Illustration name={art} size={74} />
        </View>
        <Text className="font-bold text-[13.5px] mt-2">{name}</Text>
      </Pressable>
      <View className="flex-row items-center justify-between mt-1">
        <Text className="text-[14px] font-bold">৳{price}</Text>
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel={`Add ${name}`}
          hitSlop={6}
          className="bg-caramel rounded-full w-[26px] h-[26px] items-center justify-center"
        >
          <Icon name="plus" size={14} color="#FFFFFF" />
        </Pressable>
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
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        className="flex-1 flex-row items-center"
      >
        <View style={{ backgroundColor: tint }} className="w-14 h-14 rounded-2xl items-center justify-center">
          <Illustration name={art} size={44} />
        </View>
        <View className="flex-1 ml-3">
          <Text className="font-bold text-[14px]">{name}</Text>
          <Text className="text-[11.5px] text-muted mt-0.5">{description}</Text>
          <Text className="text-[14px] font-bold mt-1">৳{price}</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel={`Add ${name}`}
        hitSlop={6}
        className="bg-caramel rounded-full w-7 h-7 items-center justify-center ml-2"
      >
        <Icon name="plus" size={15} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

export function Divider() {
  return <View className="h-px bg-line my-1" />;
}
