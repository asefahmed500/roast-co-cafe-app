import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { FlatList } from "@/components/ui/flat-list";
import { Input, InputField } from "@/components/ui/input";
import { KeyboardAvoidingView } from "@/components/ui/keyboard-avoiding-view";
import { Text } from "@/components/typography";
import { router } from "expo-router";
import { StatusLine, TopBar, Stepper, PrimaryButton, Divider, EmptyView, FormMessage, Button, tintClass } from "@/components/kit";
import { Icon } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import { brand } from "@/theme";
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
    <KeyboardAvoidingView className="flex-1">
      <Box className="flex-1 bg-background">
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
            <Box className="flex-1 mt-3.5">
              <FlatList
                data={lines}
                keyExtractor={(line) => line.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
                ItemSeparatorComponent={() => <Box className="h-2.5" />}
                renderItem={({ item: line }) => (
                  <Box className="bg-card rounded-[20px] flex-row items-center p-2.5">
                    <Box className={`w-11 h-11 rounded-2xl items-center justify-center ${tintClass(line.tint)}`}>
                      <Illustration name={line.illustration} size={36} />
                    </Box>
                    <Box className="flex-1 ml-3">
                      <Text className="font-bold text-[14px]">{line.name}</Text>
                      <Text className="text-[11.5px] text-muted mt-0.5">{line.note}</Text>
                      <Text className="text-[14px] font-bold mt-1">৳{line.price * line.qty}</Text>
                    </Box>
                    <Stepper value={line.qty} onChange={(next) => setQty(line.id, next)} compact />
                  </Box>
                )}
                ListFooterComponent={
                  <>
                    <Box className="rounded-2xl border border-dashed border-line-strong p-3 mt-2.5">
                      {promoApplied ? (
                        <Box className="flex-row items-center justify-between">
                          <Box className="flex-row items-center gap-2.5">
                            <Icon name="card" size={16} className="text-caramel" />
                            <Text className="text-[13px] font-bold text-caramel">{promoCode} · {promoPercentLabel(discount, subtotal)} off</Text>
                          </Box>
                          <Button label="Remove" variant="link" size="sm" onPress={removePromo} />
                        </Box>
                      ) : (
                        <Box className="flex-row items-center gap-2">
                          <Input className="flex-1 h-10 px-3">
                            <InputField
                              value={code}
                              onChangeText={setCode}
                              placeholder="Promo code"
                              placeholderTextColor={brand.placeholder}
                              accessibilityLabel="Promo code"
                              aria-label="Promo code"
                              autoCapitalize="characters"
                              className="text-[13px] font-bold text-caramel"
                            />
                          </Input>
                          <Button
                            label="Apply"
                            variant="secondary"
                            size="sm"
                            loading={applying}
                            disabled={code.trim().length === 0}
                            onPress={() => void onApplyPromo()}
                          />
                        </Box>
                      )}
                      <FormMessage message={promoError} />
                    </Box>

                    <Box className="mt-5 gap-2">
                      <Row label="Subtotal" value={`৳${subtotal}`} muted />
                      <Row label="Discount" value={`−৳${discount}`} valueClass="text-sage" muted />
                      <Divider />
                      <Box className="flex-row items-center justify-between pt-1">
                        <Text className="text-[14px] font-bold text-ink">Total</Text>
                        <Text className="text-[19px] font-bold text-ink">৳{total}</Text>
                      </Box>
                    </Box>
                  </>
                }
              />
            </Box>

            <Box className="px-5 pb-8 pt-2">
              <PrimaryButton label={`Checkout · ৳${total}`} onPress={() => router.push("/checkout")} />
            </Box>
          </>
        )}
      </Box>
    </KeyboardAvoidingView>
  );
}

function promoPercentLabel(discount: number, subtotal: number): string {
  return subtotal > 0 ? `${Math.round(discount / subtotal * 100)}%` : "0%";
}

function Row({ label, value, valueClass = "", muted = false }: { label: string; value: string; valueClass?: string; muted?: boolean }) {
  return (
    <Box className="flex-row items-center justify-between">
      <Text className={`text-[13.5px] ${muted ? "text-muted" : "text-ink"}`}>{label}</Text>
      <Text className={`text-[13.5px] font-bold ${valueClass || "text-ink"}`}>{value}</Text>
    </Box>
  );
}
