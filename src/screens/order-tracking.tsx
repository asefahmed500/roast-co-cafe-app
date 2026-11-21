import React from "react";
import { ScrollView, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { router, useLocalSearchParams } from "expo-router";
import { StatusLine, TopBar } from "@/components/kit";
import { Icon } from "@/components/icons";
import { Illustration } from "@/components/illustrations";
import { useCart } from "@/store/cart";

const steps = [
  { title: "Order received", note: "9:41 am", state: "done" },
  { title: "Brewing your drinks", note: "Barista is on it", state: "active" },
  { title: "Ready for pickup", note: "", state: "todo" },
  { title: "Picked up", note: "", state: "todo" },
] as const;

export function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lines, total } = useCart();
  const summary = lines.map((line) => `${line.qty} × ${line.name.split(" ")[0]}`).join(", ");

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <TopBar title={`Order #${id ?? "2481"}`} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="items-center mt-4">
          <View className="relative w-[150px] h-[150px] items-center justify-center">
            <Svg width={150} height={150} viewBox="0 0 150 150">
              <Circle cx="75" cy="75" r="62" fill="none" stroke="#EADFCC" strokeWidth="12" />
              <Circle
                cx="75"
                cy="75"
                r="62"
                fill="none"
                stroke="#C8873F"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="260 390"
                transform="rotate(-90 75 75)"
              />
            </Svg>
            <View className="absolute items-center">
              <Text className="text-[38px] font-bold leading-none tracking-tight text-ink">8</Text>
              <Text className="text-[12px] text-muted mt-1">min left</Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-6">
          {steps.map((step, i) => (
            <View key={step.title} className="h-[46px] flex-row items-start relative">
              {i < steps.length - 1 ? (
                <View className="absolute left-[11px] top-6 bottom-[-2px] w-[2px] bg-line" />
              ) : null}
              <View
                className={`w-6 h-6 rounded-full items-center justify-center z-10 ${
                  step.state === "done"
                    ? "bg-sage"
                    : step.state === "active"
                      ? "bg-caramel ring-[5px] ring-caramel/20"
                      : "bg-card border border-line"
                }`}
              >
                {step.state === "done" ? <Icon name="check" size={13} color="#FFFFFF" /> : null}
                {step.state === "active" ? <View className="w-2 h-2 rounded-full bg-white" /> : null}
              </View>
              <View className="ml-3.5">
                <Text className={`text-[14px] font-bold ${step.state === "todo" ? "text-muted" : "text-ink"}`}>{step.title}</Text>
                {step.note ? <Text className="text-[11.5px] text-muted mt-0.5">{step.note}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <View className="px-5 mt-auto pt-4">
          <View className="bg-card rounded-[20px] flex-row items-center p-3">
            <View className="w-11 h-11 rounded-2xl bg-latte items-center justify-center">
              <Illustration name="cup" size={34} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-[13px] font-bold">{summary || "2 × Latte, 1 × Croissant"}</Text>
              <Text className="text-[11.5px] text-muted mt-0.5">Gulshan 2 · ৳{total}</Text>
            </View>
          </View>
          <View className="mt-3">
            <View className="h-[46px] rounded-full border border-line items-center justify-center">
              <Text className="text-[14px] font-semibold text-ink">Contact café</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
