import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { StatusLine, TopBar, Stepper, PrimaryButton, Divider, EmptyView, FormMessage, Button } from "@/components/kit";
import { Icon } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import { useCart } from "@/store/cart";

export function BagScreen() {
  const {
    lines, count, subtotal, discount, total, promoApplied, promoCode,
    setQty, applyPromo, removePromo,
  } = useCart();
  const [code, setCode] = useState("COFFEE10");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const onApplyPromo = async () => {
    setApplying(true);
    setPromoError(null);
    const ok = await applyPromo(code);
    if (!ok) setPromoError("That code isn't valid. Try COFFEE10.");
    setApplying(false);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <TopBar title={`Your bag (${count})`} />

      {lines.length === 0 ? (
        <EmptyView
          title="Your bag is empty"
          message="Add something delicious from the menu and it will show up here."
          action="Browse menu"
          onAction={() => router.push("/menu")}
        />
      ) : (
        <>
          <ScrollView className="flex-1 mt-3.5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
            <View className="gap-2.5">
              {lines.map((line) => (
                <View key={line.id} className="bg-card rounded-[20px] flex-row items-center p-2.5">
                  <View style={{ backgroundColor: line.tint }} className="w-11 h-11 rounded-2xl items-center justify-center">
                    <Illustration name={line.illustration} size={36} />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-bold text-[14px]">{line.name}</Text>
                    <Text className="text-[11.5px] text-muted mt-0.5">{line.note}</Text>
                    <Text className="text-[14px] font-bold mt-1">৳{line.price * line.qty}</Text>
                  </View>
                  <Stepper value={line.qty} onChange={(next) => setQty(line.id, next)} compact />
                </View>
              ))}

              <View className="rounded-2xl border border-dashed border-[#D8C4A4] p-3">
                {promoApplied ? (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5">
                      <Icon name="card" size={16} color="#C8873F" />
                      <Text className="text-[13px] font-bold text-caramel">{promoCode} · {promoPercentLabel(discount, subtotal)} off</Text>
                    </View>
                    <Button label="Remove" variant="link" size="sm" onPress={removePromo} />
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={code}
                      onChangeText={setCode}
                      placeholder="Promo code"
                      autoCapitalize="characters"
                      accessibilityLabel="Promo code"
                      className="flex-1 h-10 px-3 text-[13px] font-bold text-caramel"
                    />
                    <Button
                      label="Apply"
                      variant="secondary"
                      size="sm"
                      loading={applying}
                      disabled={code.trim().length === 0}
                      onPress={() => void onApplyPromo()}
                    />
                  </View>
                )}
                <FormMessage message={promoError} />
              </View>
            </View>

            <View className="mt-5 gap-2">
              <Row label="Subtotal" value={`৳${subtotal}`} muted />
              <Row label="Discount" value={`−৳${discount}`} valueClass="text-sage" muted />
              <Divider />
              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-[14px] font-bold text-ink">Total</Text>
                <Text className="text-[19px] font-bold text-ink">৳{total}</Text>
              </View>
            </View>
          </ScrollView>

          <View className="px-5 pb-8 pt-2">
            <PrimaryButton label={`Checkout · ৳${total}`} onPress={() => router.push("/checkout")} />
          </View>
        </>
      )}
    </View>
  );
}

function promoPercentLabel(discount: number, subtotal: number): string {
  return subtotal > 0 ? `${Math.round(discount / subtotal * 100)}%` : "0%";
}

function Row({ label, value, valueClass = "", muted = false }: { label: string; value: string; valueClass?: string; muted?: boolean }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className={`text-[13.5px] ${muted ? "text-muted" : "text-ink"}`}>{label}</Text>
      <Text className={`text-[13.5px] font-bold ${valueClass || "text-ink"}`}>{value}</Text>
    </View>
  );
}
