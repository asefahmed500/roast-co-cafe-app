import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { FlatList } from "@/components/ui/flat-list";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/typography";
import { router, useLocalSearchParams } from "expo-router";
import { StatusLine, TopBar, RoundButton, PrimaryButton, EmptyView, PressableSurface, a11yState, tintClass } from "@/components/kit";
import { Icon } from "@/components/icons";
import { brand } from "@/theme";
import { useCafe } from "@/context/cafe";
import { useCatalog } from "@/context/catalog";

export function ChooseCafeScreen() {
  const { return: returnTo } = useLocalSearchParams<{ return?: string }>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { cafes } = useCatalog();
  const { selectedCafe, selectCafe } = useCafe();
  const selected = selectedCafe?.id ?? cafes[0]?.id;
  const needle = query.trim().toLowerCase();
  const visibleCafes = cafes.filter((cafe) =>
    !needle || `${cafe.name} ${cafe.address}`.toLowerCase().includes(needle),
  );

  return (
    <Box className="flex-1 bg-background">
      <StatusLine />
      <TopBar
        title="Pick your café"
        right={<RoundButton name="search" size={38} onPress={() => setSearchOpen((open) => !open)} />}
      />

      {searchOpen ? (
        <Box className="px-5 mt-3">
          <Input className="bg-card rounded-2xl h-11 border-line">
            <InputField
              value={query}
              onChangeText={setQuery}
              placeholder="Search cafés…"
              placeholderTextColor={brand.placeholder}
              accessibilityLabel="Search cafés"
              aria-label="Search cafés"
              autoFocus
              className="text-[14px] text-ink"
            />
          </Input>
        </Box>
      ) : null}

      <Box className="mx-5 mt-3 h-[196px] rounded-[24px] overflow-hidden relative bg-map">
        <Box className="absolute -left-2 top-[60px] w-[340px] h-[14px] bg-on-dark/55 rotate-[-8deg]" />
        <Box className="absolute left-[110px] -top-2 w-[14px] h-[220px] bg-on-dark/55 rotate-[12deg]" />
        <Box className="absolute left-5 top-[140px] w-[300px] h-[10px] bg-on-dark/55 rotate-[6deg]" />
        <MapPin left={84} top={84} small={false} />
        <MapPin left={210} top={44} small />
        <MapPin left={196} top={128} small />
      </Box>

      {visibleCafes.length === 0 ? (
        <EmptyView
          title="No matching cafés"
          message="Try another name or clear your search."
          action="Clear search"
          onAction={() => setQuery("")}
        />
      ) : (
        <FlatList
          data={visibleCafes}
          keyExtractor={(cafe) => cafe.id}
          contentContainerStyle={{ paddingHorizontal: 20, marginTop: 16 }}
          ItemSeparatorComponent={() => <Box className="h-2.5" />}
          renderItem={({ item: cafe }) => {
            const active = cafe.id === selected;
            return (
              <PressableSurface
                onPress={() => selectCafe(cafe.id)}
                accessibilityRole="radio"
                accessibilityLabel={`${cafe.name}, ${cafe.address}`}
                {...a11yState(active)}
                className={`bg-card rounded-[12px] flex-row items-center px-3.5 py-3 ${active ? "border-2 border-caramel" : "border border-line"}`}
              >
                <Box className={`w-10 h-10 rounded-full items-center justify-center ${active ? "bg-caramel-tint" : tintClass(cafe.tint)}`}>
                  <Icon name="pin" size={20} className={active ? "text-caramel" : "text-ink"} />
                </Box>
                <Box className="flex-1 ml-3">
                  <Text className="font-bold text-[14px]">{cafe.name}</Text>
                  <Text className="text-[11.5px] text-muted mt-0.5">{cafe.address}</Text>
                </Box>
                <Text className="text-[12.5px] font-bold">{cafe.distance}</Text>
              </PressableSurface>
            );
          }}
        />
      )}

      <Box className="mt-auto px-5 pb-8 pt-4">
        <PrimaryButton
          label="Confirm café"
          onPress={() => router.replace((returnTo === "/checkout" ? "/checkout" : "/home") as never)}
        />
      </Box>
    </Box>
  );
}

function MapPin({ left, top, small = false }: { left: number; top: number; small?: boolean }) {
  const size = small ? 26 : 34;
  return (
    <Box
      // Decorative map placement is inherently dynamic.
      style={{ left, top, width: size, height: size, transform: [{ rotate: "-45deg" }] }}
      className={`absolute rounded-[50%] rounded-bl-none items-center justify-center ${small ? "bg-caramel-deep" : "bg-caramel"}`}
    >
      <Box style={{ transform: [{ rotate: "45deg" }] }}>
        <Icon name="menu" size={small ? 12 : 15} className="text-on-dark" />
      </Box>
    </Box>
  );
}
