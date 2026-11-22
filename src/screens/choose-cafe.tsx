import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput } from "@/components/typography";
import { router, useLocalSearchParams } from "expo-router";
import { StatusLine, TopBar, RoundButton, PrimaryButton, EmptyView, PressableSurface, a11yState } from "@/components/kit";
import { Icon } from "@/components/icons";
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
    <View className="flex-1 bg-background">
      <StatusLine />
      <TopBar
        title="Pick your café"
        right={<RoundButton name="search" size={38} onPress={() => setSearchOpen((open) => !open)} />}
      />

      {searchOpen ? (
        <View className="px-5 mt-3">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search cafés…"
            placeholderTextColor="#B09A85"
            accessibilityLabel="Search cafés"
            autoFocus
            className="bg-card rounded-2xl h-11 px-4 text-[14px] text-ink border border-line"
          />
        </View>
      ) : null}

      <View className="mx-5 mt-3 h-[196px] rounded-[24px] overflow-hidden relative bg-[#E8DFCC]">
        <View className="absolute -left-2 top-[60px] w-[340px] h-[14px] bg-white/55 rotate-[-8deg]" />
        <View className="absolute left-[110px] -top-2 w-[14px] h-[220px] bg-white/55 rotate-[12deg]" />
        <View className="absolute left-5 top-[140px] w-[300px] h-[10px] bg-white/55 rotate-[6deg]" />
        <MapPin left={84} top={84} small={false} />
        <MapPin left={210} top={44} small />
        <MapPin left={196} top={128} small />
      </View>

      {visibleCafes.length === 0 ? (
        <EmptyView
          title="No matching cafés"
          message="Try another name or clear your search."
          action="Clear search"
          onAction={() => setQuery("")}
        />
      ) : (
        <View className="px-5 mt-4 gap-2.5">
          {visibleCafes.map((cafe) => {
            const active = cafe.id === selected;
            return (
              <PressableSurface
                key={cafe.id}
                onPress={() => selectCafe(cafe.id)}
                accessibilityRole="radio"
                accessibilityLabel={`${cafe.name}, ${cafe.address}`}
                {...a11yState(active)}
                className={`bg-card rounded-[12px] flex-row items-center px-3.5 py-3 ${active ? "border-2 border-caramel" : "border border-line"}`}
              >
                <View
                  style={{ backgroundColor: active ? "#F6E8D3" : cafe.tint }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  <Icon name="pin" size={20} color={active ? "#C8873F" : "#2B1D16"} />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="font-bold text-[14px]">{cafe.name}</Text>
                  <Text className="text-[11.5px] text-muted mt-0.5">{cafe.address}</Text>
                </View>
                <Text className="text-[12.5px] font-bold">{cafe.distance}</Text>
              </PressableSurface>
            );
          })}
        </View>
      )}

      <View className="mt-auto px-5 pb-8 pt-4">
        <PrimaryButton
          label="Confirm café"
          onPress={() => router.replace((returnTo === "/checkout" ? "/checkout" : "/home") as never)}
        />
      </View>
    </View>
  );
}

function MapPin({ left, top, small = false }: { left: number; top: number; small?: boolean }) {
  const size = small ? 26 : 34;
  return (
    <View
      style={{ left, top, width: size, height: size, transform: [{ rotate: "-45deg" }] }}
      className={`absolute bg-caramel rounded-[50%] rounded-bl-none items-center justify-center ${small ? "bg-[#9B7B60]" : ""}`}
    >
      <View style={{ transform: [{ rotate: "45deg" }] }}>
        <Icon name="menu" size={small ? 12 : 15} color="#FFFFFF" />
      </View>
    </View>
  );
}
