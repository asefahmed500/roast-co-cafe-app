import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusLine, TopBar, RoundButton, PrimaryButton } from "@/components/kit";
import { Icon } from "@/components/icons";
import { cafes } from "@/data/menu";

export function ChooseCafeScreen() {
  const [selected, setSelected] = useState(cafes[0].id);

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <TopBar
        title="Pick your café"
        right={<RoundButton name="search" size={38} onPress={() => {}} />}
      />

      <View className="mx-5 mt-3 h-[196px] rounded-[24px] overflow-hidden relative bg-[#E8DFCC]">
        <View className="absolute -left-2 top-[60px] w-[340px] h-[14px] bg-white/55 rotate-[-8deg]" />
        <View className="absolute left-[110px] -top-2 w-[14px] h-[220px] bg-white/55 rotate-[12deg]" />
        <View className="absolute left-5 top-[140px] w-[300px] h-[10px] bg-white/55 rotate-[6deg]" />
        <MapPin left={84} top={84} small={false} />
        <MapPin left={210} top={44} small />
        <MapPin left={196} top={128} small />
      </View>

      <View className="px-5 mt-4 gap-2.5">
        {cafes.map((cafe) => {
          const active = cafe.id === selected;
          return (
            <Pressable
              key={cafe.id}
              onPress={() => setSelected(cafe.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              className={`bg-card rounded-[20px] flex-row items-center px-3.5 py-3 ${active ? "border-2 border-caramel" : "border border-line"}`}
            >
              <View
                style={{ backgroundColor: active ? "#F6E8D3" : cafe.tint }}
                className={`w-10 h-10 rounded-full items-center justify-center ${active ? "text-caramel" : ""}`}
              >
                <Icon name="pin" size={20} color={active ? "#C8873F" : "#2B1D16"} />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-bold text-[14px]">{cafe.name}</Text>
                <Text className="text-[11.5px] text-muted mt-0.5">{cafe.address}</Text>
              </View>
              <Text className="text-[12.5px] font-bold">{cafe.distance}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto px-5 pb-8 pt-4">
        <PrimaryButton label="Confirm café" onPress={() => router.replace("/home")} />
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
