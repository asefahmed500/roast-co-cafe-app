import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusLine, RoundButton, Pill, Stepper } from "@/components/kit";
import { Icon } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import { getItem, menuItems } from "@/data/menu";
import { useCart } from "@/store/cart";

const sizes = ["S · 240ml", "M · 350ml", "L · 450ml"];
const milks = ["Whole", "Oat", "Almond"];

export function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = getItem(id ?? "") ?? menuItems[0];
  const [size, setSize] = useState(1);
  const [milk, setMilk] = useState(0);
  const [qty, setQty] = useState(2);
  const { addItem } = useCart();

  const total = item.price * qty;

  return (
    <View className="flex-1 bg-background">
      <View style={{ backgroundColor: item.tint }} className="h-[250px] rounded-b-[38px] flex-none relative">
        <StatusLine />
        <View className="px-5 flex-row items-center justify-between mt-1 relative z-10">
          <RoundButton name="back" onPress={() => router.back()} />
          <RoundButton name="heart" onPress={() => {}} />
        </View>
        <View className="absolute left-0 right-0 top-[56px] items-center">
          <View className="absolute w-[190px] h-[190px] rounded-full bg-white/45 top-1.5" />
          <Illustration name={item.illustration} size={190} />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 104 }}>
        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[22px] font-bold tracking-tight text-ink">{item.name}</Text>
            <Text className="text-[18px] font-bold">৳{item.price}</Text>
          </View>
          <View className="flex-row items-center gap-1.5 mt-1.5">
            <Icon name="star" size={15} color="#C8873F" />
            <Text className="text-[12px] font-bold text-ink">{item.rating}</Text>
            <Text className="text-[12px] text-muted">({item.reviews}) ·</Text>
            <Icon name="clock" size={15} color="#8A7566" />
            <Text className="text-[12px] text-muted">{item.minutes} min</Text>
          </View>
          <Text className="text-[12px] leading-5 text-muted mt-2">
            Smooth espresso with steamed milk and a ribbon of house caramel.
          </Text>

          <Text className="text-[13px] font-bold mt-4 mb-2 text-ink">Size</Text>
          <View className="flex-row gap-2">
            {sizes.map((s, i) => <Pill key={s} label={s} active={size === i} onPress={() => setSize(i)} />)}
          </View>

          <Text className="text-[13px] font-bold mt-4 mb-2 text-ink">Milk</Text>
          <View className="flex-row gap-2">
            {milks.map((m, i) => <Pill key={m} label={m} active={milk === i} onPress={() => setMilk(i)} />)}
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-8 pt-2 flex-row gap-3 items-center">
        <View className="bg-card rounded-full h-[52px] flex-row items-center px-3 gap-3.5 border border-line">
          <Stepper value={qty} onChange={(next) => setQty(Math.max(1, next))} compact />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            addItem({
              id: item.id,
              name: item.name,
              price: item.price,
              note: `${sizes[size].split(" ")[0]} · ${milks[milk]} milk`,
              illustration: item.illustration,
              tint: item.tint,
            }, qty);
            router.push("/bag");
          }}
          className="flex-1 h-[52px] rounded-full bg-espresso items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}
        >
          <Text className="text-[15px] font-semibold text-white">Add to bag · ৳{total}</Text>
        </Pressable>
      </View>
    </View>
  );
}
