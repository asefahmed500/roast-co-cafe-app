import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/typography";
import { router, useLocalSearchParams } from "expo-router";
import { StatusLine, RoundButton, Pill, Stepper, Button, tintClass } from "@/components/kit";
import { Icon } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import { useCatalog } from "@/context/catalog";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/context/favorites";
import { optionsLabel, unitPriceFor } from "../../shared/pricing";
import type { CartOptions, CartMilk, CartSize } from "../../shared/types";

const sizes: Array<{ label: string; value: CartSize }> = [
  { label: "S · 240ml", value: "S" },
  { label: "M · 350ml", value: "M" },
  { label: "L · 450ml", value: "L" },
];
const milks: Array<CartMilk> = ["Whole", "Oat", "Almond"];

export function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { menu } = useCatalog();
  const item = menu.find((entry) => entry.id === id) ?? menu[0];
  const [size, setSize] = useState(1);
  const [milk, setMilk] = useState(0);
  const [qty, setQty] = useState(2);
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(item.id);
  const { addItem } = useCart();

  const options: CartOptions = { size: sizes[size].value, milk: milks[milk] };
  const unitPrice = unitPriceFor(item.price, options);
  const total = unitPrice * qty;

  return (
    <Box className="flex-1 bg-background">
      <Box className={`h-[250px] rounded-b-[38px] flex-none relative ${tintClass(item.tint)}`}>
        <StatusLine />
        <Box className="px-5 flex-row items-center justify-between mt-1 relative z-10">
          <RoundButton name="back" onPress={() => router.back()} />
          <RoundButton name="heart" tone={saved ? "caramel" : "light"} onPress={() => toggle(item.id)} />
        </Box>
        <Box className="absolute left-0 right-0 top-[56px] items-center">
          <Box className="absolute w-[190px] h-[190px] rounded-full bg-on-dark/45 top-1.5" />
          <Illustration name={item.illustration} size={190} />
        </Box>
      </Box>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 104 }}>
        <Box className="px-5 mt-4">
          <Box className="flex-row items-center justify-between">
            <Text className="text-[22px] font-bold tracking-tight text-ink">{item.name}</Text>
            <Text className="text-[18px] font-bold">৳{unitPrice}</Text>
          </Box>
          <Box className="flex-row items-center gap-1.5 mt-1.5">
            <Icon name="star" size={15} className="text-caramel" />
            <Text className="text-[12px] font-bold text-ink">{item.rating}</Text>
            <Text className="text-[12px] text-muted">({item.reviews}) ·</Text>
            <Icon name="clock" size={15} className="text-muted" />
            <Text className="text-[12px] text-muted">{item.minutes} min</Text>
          </Box>
          <Text className="text-[12px] leading-5 text-muted mt-2">{item.description}</Text>

          <Text className="text-[13px] font-bold mt-4 mb-2 text-ink">Size</Text>
          <Box className="flex-row gap-2">
            {sizes.map((s, i) => <Pill key={s.value} label={s.label} active={size === i} onPress={() => setSize(i)} />)}
          </Box>

          <Text className="text-[13px] font-bold mt-4 mb-2 text-ink">Milk</Text>
          <Box className="flex-row gap-2">
            {milks.map((m, i) => <Pill key={m} label={m} active={milk === i} onPress={() => setMilk(i)} />)}
          </Box>
        </Box>
      </ScrollView>

      <Box className="px-5 pb-8 pt-2 flex-row gap-3 items-center">
        <Box className="bg-card rounded-full h-[52px] flex-row items-center px-3 gap-3.5 border border-line">
          <Stepper value={qty} onChange={(next) => setQty(Math.max(1, next))} compact />
        </Box>
        <Box className="flex-1">
          <Button
            label={`Add to bag · ৳${total}`}
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => {
              addItem({
                id: item.id,
                name: item.name,
                price: unitPrice,
                note: optionsLabel(options),
                options,
                illustration: item.illustration,
                tint: item.tint,
              }, qty);
              router.push("/bag");
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
