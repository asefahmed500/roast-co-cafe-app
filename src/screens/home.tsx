import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/typography";
import { router } from "expo-router";
import { StatusLine, BottomNav, Button, Chip, RoundButton, SectionTitle, ProductCard } from "@/components/kit";
import { Illustration } from "@/components/illustrations";
import { categories } from "@/data/menu";
import { useAuth } from "@/context/auth";
import { useCatalog } from "@/context/catalog";
import { useCart } from "@/store/cart";
import { DEFAULT_OPTIONS, optionsLabel } from "../../shared/pricing";
import type { OrderDTO } from "../../shared/types";
import { api, errorMessage } from "@/lib/api";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen() {
  const [category, setCategory] = useState<string>("All");
  const [showNotifications, setShowNotifications] = useState(false);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const { user } = useAuth();
  const { menu, error } = useCatalog();
  const { addItem, count } = useCart();
  const popular = menu.filter((item) => category === "All" || item.category === category).slice(0, 4);

  const toggleNotifications = async () => {
    if (showNotifications) {
      setShowNotifications(false);
      return;
    }
    setShowNotifications(true);
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const result = await api.getOrders();
      setOrders(result.orders.slice(0, 3));
    } catch (caught) {
      setNotificationsError(errorMessage(caught));
    } finally {
      setNotificationsLoading(false);
    }
  };

  return (
    <Box className="flex-1 bg-background">
      <StatusLine />
      <Box className="flex-row items-center justify-between px-5 mt-1">
        <Box>
          <Text className="text-[12.5px] text-muted">{greeting()}</Text>
          <Text className="text-[19px] font-bold tracking-tight text-ink">{user?.name.split(" ")[0] ?? "there"}</Text>
        </Box>
        <RoundButton name="bell" onPress={() => void toggleNotifications()} />
      </Box>

      {showNotifications ? (
        <Box accessibilityLiveRegion="polite" className="mx-5 mt-3 bg-card rounded-[12px] p-3.5 border border-line">
          <Text className="text-[13px] font-bold text-ink">Order updates</Text>
          {notificationsLoading ? (
            <Text className="text-[12px] text-muted mt-1">Loading…</Text>
          ) : notificationsError ? (
            <Text className="text-[12px] text-destructive mt-1">{notificationsError}</Text>
          ) : orders.length === 0 ? (
            <Text className="text-[12px] text-muted mt-1">No order updates yet. Place an order to see it here.</Text>
          ) : (
            orders.map((order) => (
              <Box key={order.id} className="flex-row items-center justify-between mt-2">
                <Text className="text-[12px] text-ink">Order #{order.orderNumber}</Text>
                <Text className="text-[11.5px] font-semibold text-caramel capitalize">{order.status.replace("_", " ")}</Text>
              </Box>
            ))
          )}
        </Box>
      ) : null}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <Box className="px-5 mt-3.5">
          <Button
            label="Search coffee, pastry…"
            variant="soft"
            size="lg"
            fullWidth
            leftIcon="search"
            onPress={() => router.push("/menu")}
          />
        </Box>

        {error ? (
          <Box className="px-5 mt-2">
            <Text className="text-[11.5px] text-destructive">Offline menu — changes will sync when the server is back.</Text>
          </Box>
        ) : null}

        <Box className="px-5 mt-3.5">
          <Box className="bg-espresso rounded-[24px] h-[124px] p-4 relative overflow-hidden">
            <Text className="text-[10.5px] font-bold text-caramel tracking-[2px]">TODAY ONLY</Text>
            <Text className="text-[21px] font-bold leading-tight text-on-dark mt-1.5">
              10% off your order{"\n"}with COFFEE10
            </Text>
            <Box className="self-start mt-2.5">
              <Button label="Use code" variant="secondary" size="sm" onPress={() => router.push("/bag")} />
            </Box>
            <Box className="absolute right-1 top-2">
              <Illustration name="iced" size={104} />
            </Box>
          </Box>
        </Box>

        <Box className="px-5 mt-3.5 flex-row gap-2 flex-wrap">
          {categories.map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </Box>

        <Box className="px-5 mt-4">
          <SectionTitle title="Popular" action="See all" onAction={() => router.push("/menu")} />
        </Box>

        <Box className="px-5 mt-2.5 flex-row gap-3 flex-wrap">
          {popular.map((item) => (
            <Box key={item.id} className="w-[47%]">
              <ProductCard
                name={item.name}
                price={item.price}
                art={item.illustration}
                tint={item.tint}
                onPress={() => router.push(`/item/${item.id}` as never)}
                onAdd={() =>
                  addItem({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    note: optionsLabel(DEFAULT_OPTIONS),
                    options: DEFAULT_OPTIONS,
                    illustration: item.illustration,
                    tint: item.tint,
                  })
                }
              />
            </Box>
          ))}
        </Box>
      </ScrollView>

      <BottomNav active="home" count={count} />
    </Box>
  );
}
