import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusLine, BottomNav, Chip, RoundButton, MenuRow } from "@/components/kit";
import { categories, menuItems, type Category } from "@/data/menu";
import { useCart } from "@/store/cart";

const filters: Array<Category | "All"> = ["Hot", "Cold", "Tea", "Bakery"];

export function MenuScreen() {
  const [filter, setFilter] = useState<Category | "All">("Hot");
  const { addItem, count } = useCart();
  const items = menuItems.filter((item) => filter === "All" || item.category === filter);

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <View className="px-5 flex-row items-center justify-between mt-1">
        <Text className="text-[27px] font-bold tracking-tight text-ink">Menu</Text>
        <RoundButton name="search" onPress={() => {}} />
      </View>

      <View className="px-5 mt-4 flex-row gap-2">
        {filters.map((c) => (
          <Chip key={c} label={c === "Hot" ? "Hot coffee" : c} active={filter === c} onPress={() => setFilter(c)} />
        ))}
      </View>

      <ScrollView className="flex-1 mt-3.5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View className="gap-2.5">
          {items.map((item) => (
            <MenuRow
              key={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              art={item.illustration}
              tint={item.tint}
              onPress={() => router.push(`/item/${item.id}` as never)}
              onAdd={() =>
                addItem({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  note: "Medium · Whole milk",
                  illustration: item.illustration,
                  tint: item.tint,
                })
              }
            />
          ))}
        </View>
      </ScrollView>

      <BottomNav active="menu" count={count} />
    </View>
  );
}
