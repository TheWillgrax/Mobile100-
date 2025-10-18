// app/(tabs)/_layout.jsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

import { useCart } from "../providers/CartProvider";

export default function TabsLayout() {
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ffd700", // iconos activos dorados
        tabBarInactiveTintColor: "#c0e0ff", // iconos inactivos azul claro
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      }}
    >
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
        name="cart"
        options={{
          title: "Carrito",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size + 2} color={color} />
          ),
          tabBarBadge: itemCount > 0 ? Math.min(itemCount, 99) : undefined,
          tabBarBadgeStyle: styles.badge,
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 75,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderTopWidth: 0,
    elevation: 5,
    backgroundColor: "#1e3c72", // azul degradado simulado
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 5,
  },
  badge: {
    backgroundColor: "#ff5a5f",
    color: "#fff",
    fontSize: 12,
    minWidth: 20,
    paddingHorizontal: 4,
  },
});