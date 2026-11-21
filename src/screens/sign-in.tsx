import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusLine, TopBar, PrimaryButton } from "@/components/kit";
import { Illustration } from "@/components/illustrations";

export function SignInScreen() {
  return (
    <View className="flex-1 bg-background">
      <StatusLine />
      <TopBar title="" onBack={() => router.back()} />

      <View className="px-5 mt-4">
        <View className="w-11 h-11 rounded-[15px] bg-caramel items-center justify-center">
          <Illustration name="bean" size={28} />
        </View>
        <Text className="text-[27px] leading-tight font-bold tracking-tight mt-5 text-ink">
          Welcome{"\n"}back
        </Text>
        <Text className="text-[13px] text-muted mt-2">Sign in with your phone number to continue.</Text>

        <Text className="text-[13px] font-bold mt-7 mb-2 text-ink">Phone number</Text>
        <View className="bg-card rounded-[20px] h-[54px] flex-row items-center px-4 gap-3 shadow-card">
          <Text className="text-[14px] font-bold">+880</Text>
          <View className="w-px h-6 bg-line" />
          <Text className="text-[15px] font-medium">1712 345 678</Text>
        </View>

        <PrimaryButton label="Continue" onPress={() => router.push("/choose-cafe")} className="mt-5" />

        <View className="flex-row items-center gap-2.5 my-5">
          <View className="flex-1 h-px bg-line" />
          <Text className="text-[12px] text-muted">or</Text>
          <View className="flex-1 h-px bg-line" />
        </View>

        <SocialButton label="Continue with Google" glyph="G" onPress={() => router.push("/choose-cafe")} />
        <SocialButton label="Continue with Apple" glyph="" onPress={() => router.push("/choose-cafe")} />
      </View>

      <Text className="text-[11.5px] text-muted text-center px-6 mt-auto pb-7">
        By continuing you agree to our Terms and Privacy Policy.
      </Text>
    </View>
  );
}

function SocialButton({ label, glyph, onPress }: { label: string; glyph: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}
      className="h-[46px] rounded-full border border-line items-center justify-center mt-2.5 flex-row gap-2"
    >
      <View className="w-5 h-5 rounded-full bg-[#F2EDE4] items-center justify-center">
        <Text className="text-[11px] font-bold text-espresso">{glyph || ""}</Text>
      </View>
      <Text className="text-[14px] font-semibold text-ink">{label}</Text>
    </Pressable>
  );
}
