import React, { useEffect } from "react";
import { View } from "react-native";
import { Text } from "@/components/typography";
import { router } from "expo-router";
import { StatusLine, Dots } from "@/components/kit";
import { Illustration } from "@/components/illustrations";
import { useAuth } from "@/context/auth";

export function SplashScreen() {
  const { isLoading, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(
      () => router.replace(isSignedIn ? "/home" : "/welcome-one"),
      900,
    );
    return () => clearTimeout(timer);
  }, [isLoading, isSignedIn]);

  return (
    <View className="flex-1 bg-espresso">
      <StatusLine dark />
      <View className="absolute w-[380px] h-[380px] rounded-full border border-white/10 -left-8 top-28" />
      <View className="absolute w-[560px] h-[560px] rounded-full border border-white/10 -left-28 top-3" />

      <View className="flex-1 items-center justify-center gap-5">
        <View className="w-24 h-24 rounded-[32px] bg-caramel items-center justify-center shadow-xl">
          <Illustration name="bean" size={60} />
        </View>
        <View className="items-center">
          <Text className="text-[30px] font-bold tracking-tight text-white">Roast &amp; Co.</Text>
          <Text className="text-[13.5px] text-on-dark-muted mt-1.5">Specialty coffee, made your way</Text>
        </View>
      </View>

      <View className="items-center pb-14">
        <Dots total={3} active={0} />
      </View>
    </View>
  );
}
