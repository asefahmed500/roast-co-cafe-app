import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "@/components/typography";
import { router } from "expo-router";
import { StatusLine, TopBar, EmptyView, MenuRow } from "@/components/kit";
import { useCatalog } from "@/context/catalog";
import { useFavorites } from "@/context/favorites";
import { useCart } from "@/store/cart";
import { DEFAULT_OPTIONS, optionsLabel } from "../../shared/pricing";

export function FavoritesScreen() {
  const { menu } = useCatalog();
  const { ids } = useFavorites();
  const { addItem } = useCart();
  const items = menu.filter((item) => ids.includes(item.id));

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <TopBar title="Favourites" />

      {items.length === 0 ? (
        <EmptyView
          title="No favourites yet"
          message="Tap the heart on any drink or pastry to save it here."
          action="Browse menu"
          onAction={() => router.replace("/menu")}
        />
      ) : (
        <ScrollView className="flex-1 mt-3.5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <Text className="text-[12.5px] text-muted mb-3">Saved for your next visit</Text>
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
                onAdd={() => addItem({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  note: optionsLabel(DEFAULT_OPTIONS),
                  options: DEFAULT_OPTIONS,
                  illustration: item.illustration,
                  tint: item.tint,
                })}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
