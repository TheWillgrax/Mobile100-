// app/(tabs)/_layout.jsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useMemo } from "react";

import { useTheme } from "../../hooks/theme";
import { useCart } from "../providers/CartProvider";

export default function TabsLayout() {
  const { itemCount } = useCart();
  const { theme, isDark } = useTheme();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: isDark ? theme.textLight : "#AFC5FF",
      tabBarStyle: {
        height: 75,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        borderTopWidth: 0,
        elevation: 5,
        backgroundColor: theme.card,
        shadowColor: theme.shadow,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 5,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "bold",
      },
      tabBarItemStyle: {
        paddingVertical: 5,
      },
    }),
    [isDark, theme]
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: "Cercanos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventario",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Carrito",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size + 2} color={color} />
          ),
          tabBarBadge: itemCount > 0 ? Math.min(itemCount, 99) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.danger,
            color: theme.white,
            fontSize: 12,
            minWidth: 20,
            paddingHorizontal: 4,
          },
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size + 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
