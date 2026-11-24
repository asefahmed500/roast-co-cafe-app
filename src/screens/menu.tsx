import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { FlatList } from "@/components/ui/flat-list";
import { Input, InputField } from "@/components/ui/input";
import { RefreshControl } from "@/components/ui/refresh-control";
import { Text } from "@/components/typography";
import { router } from "expo-router";
import { StatusLine, BottomNav, Chip, RoundButton, MenuRow, EmptyView } from "@/components/kit";
import { brand } from "@/theme";
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
    <Box className="flex-1 bg-background">
      <StatusLine />
      <Box className="px-5 flex-row items-center justify-between mt-1">
        <Text className="text-[27px] font-bold tracking-tight text-ink">Menu</Text>
        <RoundButton name="search" onPress={() => setSearchOpen((open) => !open)} />
      </Box>

      {searchOpen ? (
        <Box className="px-5 mt-3">
          <Input className="bg-card rounded-2xl h-11 border-line">
            <InputField
              value={query}
              onChangeText={setQuery}
              placeholder="Search the menu…"
              placeholderTextColor={brand.placeholder}
              accessibilityLabel="Search the menu"
              aria-label="Search the menu"
              autoFocus
              className="text-[14px] text-ink"
            />
          </Input>
        </Box>
      ) : null}

      <Box className="px-5 mt-4 flex-row gap-2">
        {filters.map((c) => (
          <Chip key={c} label={c === "Hot" ? "Hot coffee" : c} active={filter === c} onPress={() => setFilter(c)} />
        ))}
      </Box>

      <Box className="flex-1 mt-3.5">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, flexGrow: items.length === 0 ? 1 : undefined }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor={brand.caramel} />}
        ListEmptyComponent={
          <EmptyView
            title="No matches"
            message="Try another category or clear your search."
            action="Clear search"
            onAction={() => { setQuery(""); setFilter("All"); }}
          />
        }
        ItemSeparatorComponent={() => <Box className="h-2.5" />}
        renderItem={({ item }) => (
          <MenuRow
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
        )}
      />
      </Box>

      <BottomNav active="menu" count={count} />
    </Box>
  );
}
