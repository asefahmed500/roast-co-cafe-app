import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/typography";
import { router } from "expo-router";
import { StatusLine, BottomNav, FormMessage, Button, PressableSurface } from "@/components/kit";
import { Icon, type IconName } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import { useAuth } from "@/context/auth";
import { errorMessage } from "@/lib/api";
import { useCart } from "@/store/cart";
import { nextTier } from "../../shared/loyalty";

const rows: Array<{ icon: IconName; label: string; href: string }> = [
  { icon: "clock", label: "Order history", href: "/order-history" },
  { icon: "heart", label: "Favourites", href: "/favorites" },
];

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stamps = Math.min(8, user?.coffeeStamps ?? 0);
  const points = user?.points ?? 0;
  const upcoming = nextTier(points);

  const onSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <Box className="flex-1 bg-background">
      <StatusLine />
      <Box className="px-5 flex-row items-center justify-between mt-1">
        <Box className="flex-row items-center gap-3">
          <Box className="w-[46px] h-[46px] rounded-full bg-caramel items-center justify-center">
            <Text className="text-[17px] font-bold text-on-dark">{(user?.name ?? "G").charAt(0).toUpperCase()}</Text>
          </Box>
          <Box>
            <Text className="text-[17px] font-bold text-ink">{user?.name ?? "Guest"}</Text>
            <Text className="text-[11.5px] text-muted mt-0.5">{user?.tier ?? "Bronze"} member</Text>
          </Box>
        </Box>
        <Text className="text-[11.5px] text-muted">{user?.email ?? ""}</Text>
      </Box>

      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Box className="bg-espresso rounded-[24px] p-4.5">
          <Text className="text-[11px] font-bold text-caramel tracking-[1.5px]">POINTS</Text>
          <Text className="text-[32px] font-bold tracking-tight text-on-dark mt-0.5">{points.toLocaleString()}</Text>
          <Box className="h-[7px] rounded-full bg-on-dark/15 mt-3 overflow-hidden">
            <Box
              // Runtime-derived percentage cannot be a static className.
              style={{ width: `${Math.min(100, (points / (upcoming?.min ?? 4000)) * 100)}%` }}
              className="h-full rounded-full bg-caramel"
            />
          </Box>
          <Text className="text-[11.5px] text-on-dark-muted mt-2">
            {upcoming ? `${upcoming.min - points} points to ${upcoming.name}` : "Top tier reached"}
          </Text>
        </Box>

        <Box className="mt-4">
          <Box className="flex-row items-center justify-between">
            <Text className="text-[14px] font-bold text-ink">Coffee card</Text>
            <Text className="text-[12.5px] text-muted">{stamps} of 8</Text>
          </Box>
          <Box className="bg-card rounded-[20px] mt-2 p-3.5 flex-row flex-wrap justify-between gap-y-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Box
                key={i}
                className={`w-[46px] h-[46px] rounded-full items-center justify-center ${
                  i < stamps ? "bg-latte" : "border border-dashed border-line-strong/80"
                }`}
              >
                {i < stamps ? <Illustration name="bean" size={30} /> : null}
              </Box>
            ))}
          </Box>
        </Box>

        <Box className="mt-3.5 gap-2">
          {rows.map((row) => (
            <PressableSurface
              key={row.label}
              onPress={() => router.push(row.href as never)}
              accessibilityLabel={row.label}
              className="bg-card rounded-[10px] h-[46px] flex-row items-center px-3.5 gap-3"
            >
              <Icon name={row.icon} size={17} className="text-caramel" />
              <Text className="flex-1 text-[13.5px] font-semibold text-ink">{row.label}</Text>
              <Icon name="chev" size={17} className="text-muted" />
            </PressableSurface>
          ))}
          <Button
            label={busy ? "Signing out…" : "Sign out"}
            variant="outline"
            size="md"
            fullWidth
            loading={busy}
            onPress={() => void onSignOut()}
            className="mt-1"
          />
          <FormMessage message={error} />
        </Box>
      </ScrollView>

      <BottomNav active="profile" count={count} />
    </Box>
  );
}
