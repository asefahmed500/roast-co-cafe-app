import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "@/components/typography";
import Svg, { Circle } from "react-native-svg";
import { router, useLocalSearchParams } from "expo-router";
import { StatusLine, TopBar, ErrorView, LoadingView, Button } from "@/components/kit";
import { Icon } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import type { OrderDTO, OrderStatus } from "../../shared/types";
import { api, errorMessage } from "@/lib/api";
import { useCatalog } from "@/context/catalog";

const statuses: OrderStatus[] = ["received", "brewing", "ready", "picked_up"];
const steps = [
  { title: "Order received", note: "We've got your order" },
  { title: "Brewing your drinks", note: "Barista is on it" },
  { title: "Ready for pickup", note: "Head to the counter" },
  { title: "Picked up", note: "Enjoy your coffee" },
];

export function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cafes } = useCatalog();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const result = await api.getOrder(id);
      setOrder(result.order);
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => { void load(); }, 5000);
    return () => clearInterval(timer);
  }, [load]);

  if (loading && !order) return <LoadingView label="Finding your order…" />;
  if (!order) return <ErrorView message={error ?? "We couldn't find that order."} onRetry={() => void load()} />;

  const activeIndex = statuses.indexOf(order.status);
  const progress = order.etaMinutes > 0
    ? Math.min(1, Math.max(0, (order.etaMinutes - order.minutesLeft) / order.etaMinutes))
    : 0;
  const summary = order.items.map((item) => `${item.qty} × ${item.name.split(" ")[0]}`).join(", ");
  const cafeName = cafes.find((cafe) => cafe.id === order.cafeId)?.name ?? order.cafeId;

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <TopBar title={`Order #${order.orderNumber}`} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="items-center mt-4">
          <View className="relative w-[150px] h-[150px] items-center justify-center">
            <Svg width={150} height={150} viewBox="0 0 150 150">
              <Circle cx="75" cy="75" r="62" fill="none" stroke="#EADFCC" strokeWidth="12" />
              <Circle
                cx="75"
                cy="75"
                r="62"
                fill="none"
                stroke="#C8873F"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${Math.round(390 * progress)} 390`}
                transform="rotate(-90 75 75)"
              />
            </Svg>
            <View className="absolute items-center">
              <Text className="text-[38px] font-bold leading-none tracking-tight text-ink">{order.minutesLeft}</Text>
              <Text className="text-[12px] text-muted mt-1">{order.minutesLeft === 0 ? "all done" : "min left"}</Text>
            </View>
          </View>
          <Text className="text-[12px] font-semibold text-caramel mt-2 capitalize">{order.status.replace("_", " ")}</Text>
        </View>

        <View className="px-5 mt-6">
          {steps.map((step, i) => {
            const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "todo";
            return (
              <View key={step.title} className="h-[46px] flex-row items-start relative">
                {i < steps.length - 1 ? (
                  <View className="absolute left-[11px] top-6 bottom-[-2px] w-[2px] bg-line" />
                ) : null}
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center z-10 ${
                    state === "done" ? "bg-sage" : state === "active" ? "bg-caramel ring-[5px] ring-caramel/20" : "bg-card border border-line"
                  }`}
                >
                  {state === "done" ? <Icon name="check" size={13} color="#FFFFFF" /> : null}
                  {state === "active" ? <View className="w-2 h-2 rounded-full bg-white" /> : null}
                </View>
                <View className="ml-3.5">
                  <Text className={`text-[14px] font-bold ${state === "todo" ? "text-muted" : "text-ink"}`}>{step.title}</Text>
                  {state !== "todo" ? <Text className="text-[11.5px] text-muted mt-0.5">{step.note}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>

        <View className="px-5 mt-auto pt-4">
          <View className="bg-card rounded-[20px] flex-row items-center p-3">
            <View className="w-11 h-11 rounded-2xl bg-latte items-center justify-center">
              <Illustration name="cup" size={34} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-[13px] font-bold">{summary}</Text>
              <Text className="text-[11.5px] text-muted mt-0.5">{cafeName} · ৳{order.total}</Text>
            </View>
          </View>
          <View className="mt-3">
            <Button label="Back to home" variant="outline" size="lg" fullWidth onPress={() => router.replace("/home")} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
