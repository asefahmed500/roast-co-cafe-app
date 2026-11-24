import React, { useEffect } from "react";
import { Box } from "@/components/ui/box";
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
    <Box className="flex-1 bg-espresso">
      <StatusLine dark />
      <Box className="absolute w-[380px] h-[380px] rounded-full border border-on-dark/10 -left-8 top-28" />
      <Box className="absolute w-[560px] h-[560px] rounded-full border border-on-dark/10 -left-28 top-3" />

      <Box className="flex-1 items-center justify-center gap-5">
        <Box className="w-24 h-24 rounded-[32px] bg-caramel items-center justify-center shadow-xl">
          <Illustration name="bean" size={60} />
        </Box>
        <Box className="items-center">
          <Text className="text-[30px] font-bold tracking-tight text-on-dark">Roast &amp; Co.</Text>
          <Text className="text-[13.5px] text-on-dark-muted mt-1.5">Specialty coffee, made your way</Text>
        </Box>
      </Box>

      <Box className="items-center pb-14">
        <Dots total={3} active={0} />
      </Box>
    </Box>
  );
}
