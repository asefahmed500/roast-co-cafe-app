import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { StatusLine, BottomNav, RoundButton } from "@/components/kit";
import { Icon, type IconName } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import { useCart } from "@/store/cart";

const rows: Array<{ icon: IconName; label: string }> = [
  { icon: "clock", label: "Order history" },
  { icon: "heart", label: "Favourites" },
];

export function ProfileScreen() {
  const { count } = useCart();

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <View className="px-5 flex-row items-center justify-between mt-1">
        <View className="flex-row items-center gap-3">
          <View className="w-[46px] h-[46px] rounded-full bg-caramel items-center justify-center">
            <Text className="text-[17px] font-bold text-white">M</Text>
          </View>
          <View>
            <Text className="text-[17px] font-bold text-ink">Maya Rahman</Text>
            <Text className="text-[11.5px] text-muted mt-0.5">Gold member</Text>
          </View>
        </View>
        <RoundButton name="gear" onPress={() => {}} />
      </View>

      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View className="bg-espresso rounded-[24px] p-4.5">
          <Text className="text-[11px] font-bold text-caramel tracking-[1.5px]">POINTS</Text>
          <Text className="text-[32px] font-bold tracking-tight text-white mt-0.5">1,240</Text>
          <View className="h-[7px] rounded-full bg-white/15 mt-3 overflow-hidden">
            <View className="h-full w-[72%] rounded-full bg-caramel" />
          </View>
          <Text className="text-[11.5px] text-on-dark-muted mt-2">360 points to Platinum</Text>
        </View>

        <View className="mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[14px] font-bold text-ink">Coffee card</Text>
            <Text className="text-[12.5px] text-muted">5 of 8</Text>
          </View>
          <View className="bg-card rounded-[20px] mt-2 p-3.5 flex-row flex-wrap justify-between gap-y-2.5">
            {[1, 1, 1, 1, 1, 0, 0, 0].map((filled, i) => (
              <View
                key={i}
                className={`w-[46px] h-[46px] rounded-full items-center justify-center ${
                  filled ? "bg-latte" : "border border-dashed border-[#D8C4A4] opacity-80"
                }`}
              >
                {filled ? <Illustration name="bean" size={30} /> : null}
              </View>
            ))}
          </View>
        </View>

        <View className="mt-3.5 gap-2">
          {rows.map((row) => (
            <Pressable
              key={row.label}
              accessibilityRole="button"
              className="bg-card rounded-[20px] h-[46px] flex-row items-center px-3.5 gap-3"
            >
              <Icon name={row.icon} size={17} color="#C8873F" />
              <Text className="flex-1 text-[13.5px] font-semibold text-ink">{row.label}</Text>
              <Icon name="chev" size={17} color="#8A7566" />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <BottomNav active="profile" count={count} />
    </View>
  );
}
