import "@/global.css";
import React from "react";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
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
                    <RootNavigator />
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
