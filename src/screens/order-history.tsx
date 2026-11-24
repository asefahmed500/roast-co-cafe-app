import React, { useCallback, useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { FlatList } from "@/components/ui/flat-list";
import { Text } from "@/components/typography";
import { router } from "expo-router";
import { StatusLine, TopBar, EmptyView, ErrorView, LoadingView, PressableSurface } from "@/components/kit";
import type { OrderDTO } from "../../shared/types";
import { api, errorMessage } from "@/lib/api";

export function OrderHistoryScreen() {
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await api.getOrders();
      setOrders(result.orders);
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <Box className="flex-1 bg-background">
      <StatusLine />
      <TopBar title="Order history" />

      {orders === null ? (
        error ? <ErrorView message={error} onRetry={() => void load()} /> : <LoadingView label="Loading your orders…" />
      ) : orders.length === 0 ? (
        <EmptyView title="No orders yet" message="Your placed orders will appear here." action="Browse menu" onAction={() => router.replace("/menu")} />
      ) : (
        <Box className="flex-1 mt-3.5">
          <FlatList
            data={orders}
            keyExtractor={(order) => order.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            ItemSeparatorComponent={() => <Box className="h-2.5" />}
            renderItem={({ item: order }) => (
              <PressableSurface
                onPress={() => router.push(`/order/${order.id}`)}
                accessibilityLabel={`Order ${order.orderNumber}`}
                className="bg-card rounded-[12px] p-3.5"
              >
                <Box className="flex-row items-center justify-between">
                  <Text className="text-[14px] font-bold text-ink">Order #{order.orderNumber}</Text>
                  <Text className="text-[12px] font-bold text-caramel capitalize">{order.status.replace("_", " ")}</Text>
                </Box>
                <Text className="text-[11.5px] text-muted mt-1" numberOfLines={1}>
                  {order.items.map((item) => `${item.qty} × ${item.name}`).join(", ")}
                </Text>
                <Box className="flex-row items-center justify-between mt-2">
                  <Text className="text-[11.5px] text-muted">{new Date(order.createdAt).toLocaleDateString()}</Text>
                  <Text className="text-[14px] font-bold text-ink">৳{order.total}</Text>
                </Box>
              </PressableSurface>
            )}
          />
        </Box>
      )}
    </Box>
  );
}
