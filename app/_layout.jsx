// app/_layout.jsx
import { Slot } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthProvider } from "../hooks/auth";
import { ThemeProvider } from "./providers/ThemeProvider";
import { CartProvider } from "./providers/CartProvider";
import { LocationProvider } from "./providers/LocationProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <LocationProvider>
            <SafeAreaView style={{ flex: 1 }}>
              <Slot />
            </SafeAreaView>
          </LocationProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
