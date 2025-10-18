// app/_layout.jsx
import { Slot } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartProvider } from "./providers/CartProvider";
import { LocationProvider } from "./providers/LocationProvider";
import { AuthProvider } from "../hooks/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <LocationProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Slot />
          </SafeAreaView>
        </LocationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
