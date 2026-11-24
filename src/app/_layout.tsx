import "@/global.css";
import React from "react";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Box } from "@/components/ui/box";
import { AuthProvider, useAuth } from "@/context/auth";
import { CatalogProvider } from "@/context/catalog";
import { CafeProvider } from "@/context/cafe";
import { FavoritesProvider } from "@/context/favorites";
import { CartProvider } from "@/store/cart";
import { SplashScreen } from "@/screens/splash";

function RootNavigator() {
  const { isLoading, isSignedIn } = useAuth();

  // Keep the branded splash up while the persisted session is restored.
  if (isLoading) return <SplashScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn} redirectTo="/sign-in">
        <Stack.Screen name="(app)" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="item/[id]" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="order-history" />
        <Stack.Screen name="favorites" />
      </Stack.Protected>

      <Stack.Screen name="index" />
      <Stack.Screen name="welcome-one" />
      <Stack.Screen name="welcome-two" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="choose-cafe" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts([
    {
      fontFamily: "Geist",
      fontDefinitions: [
        { path: Geist_400Regular, weight: 400 },
        { path: Geist_500Medium, weight: 500 },
        { path: Geist_600SemiBold, weight: 600 },
        { path: Geist_700Bold, weight: 700 },
      ],
    },
  ]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GluestackUIProvider mode="light">
          <AuthProvider>
            <CatalogProvider>
              <CafeProvider>
                <FavoritesProvider>
                  <CartProvider>
                    <StatusBar hidden />
                    <Box className="flex-1 w-full bg-background web:max-w-[480px] web:mx-auto web:shadow-2xl">
                      <RootNavigator />
                    </Box>
                  </CartProvider>
                </FavoritesProvider>
              </CafeProvider>
            </CatalogProvider>
          </AuthProvider>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
