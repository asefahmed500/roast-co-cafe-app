import React, { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusLine, TopBar, Pill, PrimaryButton, EmptyView, FormMessage, IconButton, PressableSurface, a11yState } from "@/components/kit";
import { Icon, type IconName } from "@/components/icons";
import { useCafe } from "@/context/cafe";
import { api, errorMessage } from "@/lib/api";
import { useCart } from "@/store/cart";

const payments: Array<{ id: "bkash" | "nagad" | "card" | "cash"; label: string; icon?: IconName }> = [
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "card", label: "Card", icon: "card" },
  { id: "cash", label: "Cash at counter" },
];
const slots = ["ASAP", "15 min", "30 min"] as const;

export function CheckoutScreen() {
  const [mode, setMode] = useState<"pickup" | "dine">("pickup");
  const [time, setTime] = useState(0);
  const [payment, setPayment] = useState<(typeof payments)[number]["id"]>("bkash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKey = useRef(crypto.randomUUID());
  const { selectedCafe } = useCafe();
  const { lines, total, promoCode, clear } = useCart();

  const placeOrder = async () => {
    if (lines.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const order = await api.createOrder({
        cafeId: selectedCafe?.id ?? "gulshan-2",
        mode,
        payment,
        timeSlot: slots[time],
        promoCode: promoCode ?? undefined,
        idempotencyKey: idempotencyKey.current,
        items: lines.map(({ id, qty, note, options }) => ({ id, qty, note, options })),
      });
      clear();
      router.replace(`/order/${order.id}`);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  if (lines.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <StatusLine />
        <TopBar title="Checkout" />
        <EmptyView title="Nothing to check out" message="Add a few items to your bag first." action="Browse menu" onAction={() => router.replace("/menu")} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <TopBar title="Checkout" />

      <ScrollView className="flex-1 mt-3.5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View className="flex-row bg-[#E8DCC5] rounded-2xl p-1">
          <Pill label="Pickup" active={mode === "pickup"} onPress={() => setMode("pickup")} className="shadow-none" />
          <Pill label="Dine-in" active={mode === "dine"} onPress={() => setMode("dine")} className="bg-transparent border-0 shadow-none" />
        </View>

        <View className="bg-card rounded-[20px] flex-row items-center px-3.5 py-3 mt-3">
          <View className="w-10 h-10 rounded-full bg-caramel-tint items-center justify-center">
            <Icon name="pin" size={20} color="#C8873F" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="font-bold text-[14px]">{selectedCafe?.name ?? "Gulshan 2"}</Text>
            <Text className="text-[11.5px] text-muted mt-0.5">{selectedCafe?.address ?? "Road 11 · Counter pickup"}</Text>
          </View>
          <IconButton
            name="chev"
            variant="ghost"
            size="sm"
            accessibilityLabel="Change café"
            hitSlop={6}
            onPress={() => router.push("/choose-cafe?return=/checkout" as never)}
          />
        </View>

        <Text className="text-[13px] font-bold mt-5 mb-2 text-ink">Pickup time</Text>
        <View className="flex-row gap-2">
          {slots.map((label, i) => (
            <Pill key={label} label={label} active={time === i} onPress={() => setTime(i)} />
          ))}
        </View>

        <Text className="text-[13px] font-bold mt-5 mb-2 text-ink">Payment</Text>
        <View className="gap-2">
          {payments.map((p) => {
            const active = payment === p.id;
            return (
              <PressableSurface
                key={p.id}
                onPress={() => setPayment(p.id)}
                accessibilityRole="radio"
                accessibilityLabel={p.label}
                {...a11yState(active)}
                className={`bg-card rounded-[12px] h-12 flex-row items-center px-3.5 gap-2.5 ${active ? "border-2 border-caramel" : "border border-line"}`}
              >
                {p.icon ? <Icon name={p.icon} size={18} color="#8A7566" /> : null}
                <Text className="flex-1 text-[13.5px] font-bold">{p.label}</Text>
                <View className={`w-5 h-5 rounded-full items-center justify-center ${active ? "bg-caramel" : "border border-line"}`}>
                  {active ? <Icon name="check" size={12} color="#FFFFFF" /> : null}
                </View>
              </PressableSurface>
            );
          })}
        </View>

        <Text className="text-[11px] text-muted mt-3">
          Payment method is recorded with your order. No card or mobile-wallet charge is made in this build.
        </Text>

        <FormMessage message={error} />
      </ScrollView>

      <View className="px-5 pb-8 pt-2">
        <PrimaryButton
          label={`Place order · ৳${total}`}
          variant="caramel"
          loading={busy}
          onPress={() => void placeOrder()}
        />
      </View>
    </View>
  );
}
