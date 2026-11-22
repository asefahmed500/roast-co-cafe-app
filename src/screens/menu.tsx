import React, { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Text, TextInput } from "@/components/typography";
import { router } from "expo-router";
import { StatusLine, BottomNav, Chip, RoundButton, MenuRow, EmptyView } from "@/components/kit";
import type { Category } from "@/data/menu";
import { useCatalog } from "@/context/catalog";
import { useCart } from "@/store/cart";
import { DEFAULT_OPTIONS, optionsLabel } from "../../shared/pricing";

const filters: Array<Category | "All"> = ["Hot", "Cold", "Tea", "Bakery"];

export function MenuScreen() {
  const [filter, setFilter] = useState<Category | "All">("Hot");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { menu, isLoading, refresh } = useCatalog();
  const { addItem, count } = useCart();
  const needle = query.trim().toLowerCase();
  const items = menu.filter((item) =>
    (filter === "All" || item.category === filter) &&
    (!needle || `${item.name} ${item.description}`.toLowerCase().includes(needle)),
  );

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <View className="px-5 flex-row items-center justify-between mt-1">
        <Text className="text-[27px] font-bold tracking-tight text-ink">Menu</Text>
        <RoundButton name="search" onPress={() => setSearchOpen((open) => !open)} />
      </View>

      {searchOpen ? (
        <View className="px-5 mt-3">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search the menu…"
            placeholderTextColor="#B09A85"
            accessibilityLabel="Search the menu"
            autoFocus
            className="bg-card rounded-2xl h-11 px-4 text-[14px] text-ink border border-line"
          />
        </View>
      ) : null}

      <View className="px-5 mt-4 flex-row gap-2">
        {filters.map((c) => (
          <Chip key={c} label={c === "Hot" ? "Hot coffee" : c} active={filter === c} onPress={() => setFilter(c)} />
        ))}
      </View>

      <ScrollView
        className="flex-1 mt-3.5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor="#C8873F" />}
      >
        {items.length === 0 ? (
          <EmptyView
            title="No matches"
            message="Try another category or clear your search."
            action="Clear search"
            onAction={() => { setQuery(""); setFilter("All"); }}
          />
        ) : null}
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
                  note: optionsLabel(DEFAULT_OPTIONS),
                  options: DEFAULT_OPTIONS,
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
