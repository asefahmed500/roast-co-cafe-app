import React from "react";
import { View } from "react-native";
import { Text } from "@/components/typography";
import { router } from "expo-router";
import { StatusLine, Dots, PrimaryButton, Button } from "@/components/kit";
import { Illustration } from "@/components/illustrations";
import type { IllustrationName } from "@/data/menu";

const slides = [
  {
    bg: "#ECDCC2",
    main: "cup" as IllustrationName,
    left: "iced" as IllustrationName,
    right: "croi" as IllustrationName,
    title: "Coffee, your\nway",
    body: "Pick your size, milk and extras. Every cup is made fresh for you.",
  },
  {
    bg: "#DFE6D3",
    main: "croi" as IllustrationName,
    left: "cake" as IllustrationName,
    right: "cup" as IllustrationName,
    title: "Order ahead,\nskip the queue",
    body: "Order from your phone and pick it up when it's ready.",
  },
];

export function WelcomeScreen({ step }: { step: 0 | 1 }) {
  const slide = slides[step];
  const nextHref = step === 0 ? "/welcome-two" : "/sign-in";

  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <View style={{ backgroundColor: slide.bg }} className="mx-4 mt-2 h-[330px] rounded-[34px] items-center justify-center overflow-hidden">
        <View className="absolute w-[300px] h-[300px] rounded-full bg-white/35" />
        <View className="absolute w-[210px] h-[210px] rounded-full bg-white/40" />
        <View className="relative">
          <Illustration name={slide.main} size={190} />
        </View>
        <View className="absolute left-5 bottom-7 rotate-[-12deg]">
          <Illustration name={slide.left} size={74} />
        </View>
        <View className="absolute right-5 top-9 rotate-[10deg]">
          <Illustration name={slide.right} size={66} />
        </View>
      </View>

      <View className="px-5 mt-6">
        <Dots total={3} active={step + 1} />
        <Text className="text-[27px] leading-tight font-bold tracking-tight mt-4 text-ink">{slide.title}</Text>
      </View>
      <Text className="px-5 mt-2.5 text-[13.5px] leading-5 text-muted">{slide.body}</Text>

      <View className="mt-auto px-5 flex-row items-center gap-3.5 pb-8 pt-4">
        {step === 0 ? (
          <View className="w-16">
            <Button label="Skip" variant="ghost" size="md" onPress={() => router.replace("/sign-in")} />
          </View>
        ) : (
          <View className="w-16" />
        )}
        <PrimaryButton label={step === 0 ? "Next" : "Get started"} onPress={() => router.push(nextHref as never)} className="flex-1" />
      </View>
    </View>
  );
}
