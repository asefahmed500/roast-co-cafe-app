import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusLine, BottomNav, Chip, RoundButton, SectionTitle, ProductCard } from "@/components/kit";
import { Icon } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import { categories, menuItems } from "@/data/menu";
import { useCart } from "@/store/cart";

export function HomeScreen() {
  const [category, setCategory] = useState<string>("All");
  const { addItem, count } = useCart();
  const popular = menuItems.filter((item) => category === "All" || item.category === category).slice(0, 4);

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <View className="flex-row items-center justify-between px-5 mt-1">
        <View>
          <Text className="text-[12.5px] text-muted">Good morning</Text>
          <Text className="text-[19px] font-bold tracking-tight text-ink">Maya</Text>
        </View>
        <RoundButton name="bell" onPress={() => {}} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="px-5 mt-3.5">
          <Pressable
            onPress={() => router.push("/menu")}
            accessibilityRole="button"
            className="bg-card rounded-[16px] h-[46px] flex-row items-center px-4 gap-2.5"
          >
            <Icon name="search" size={18} color="#8A7566" />
            <Text className="text-[13px] text-muted">Search coffee, pastry…</Text>
          </Pressable>
        </View>

        <View className="px-5 mt-3.5">
          <View className="bg-espresso rounded-[24px] h-[124px] p-4 relative overflow-hidden">
            <Text className="text-[10.5px] font-bold text-caramel tracking-[2px]">TODAY ONLY</Text>
            <Text className="text-[21px] font-bold leading-tight text-white mt-1.5">
              Buy 1 Get 1{"\n"}Iced Latte
            </Text>
            <Pressable
              onPress={() => router.push("/item/iced-latte")}
              accessibilityRole="button"
              className="self-start bg-caramel rounded-[14px] px-3.5 py-1.5 mt-2.5"
            >
              <Text className="text-[12px] font-bold text-white">Order now</Text>
            </Pressable>
            <View className="absolute right-1 top-2">
              <Illustration name="iced" size={104} />
            </View>
          </View>
        </View>

        <View className="px-5 mt-3.5 flex-row gap-2">
          {categories.slice(0, 4).map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>

        <View className="px-5 mt-4">
          <SectionTitle title="Popular" action="See all" onAction={() => router.push("/menu")} />
        </View>

        <View className="px-5 mt-2.5 flex-row gap-3 flex-wrap">
          {popular.map((item) => (
            <View key={item.id} className="w-[47%]">
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
                    note: "Medium · Whole milk",
                    illustration: item.illustration,
                    tint: item.tint,
                  })
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav active="home" count={count} />
    </View>
  );
}
