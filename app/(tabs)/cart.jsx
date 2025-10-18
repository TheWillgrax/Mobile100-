import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import SafeScreen from "../../components/SafeScreen";
import { COLORS } from "../../constants/colors";
import { useCart } from "../providers/CartProvider";

const CartScreen = () => {
  const router = useRouter();
  const {
    items,
    total,
    totalFormatted,
    updateItemQuantity,
    removeItem,
    clearCart,
    formatCurrency,
  } = useCart();

  const handleAdjust = (id, current, delta) => {
    const next = Math.max(1, current + delta);
    updateItemQuantity(id, next);
  };

  const renderItem = ({ item }) => {
    const subtotal = formatCurrency(item.unitPrice * item.quantity);

    return (
      <View style={styles.card}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="car-outline" size={28} color={COLORS.textLight} />
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.priceLabel}>{item.priceLabel} c/u</Text>

          <View style={styles.metaRow}>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleAdjust(item.id, item.quantity, -1)}
              >
                <Ionicons name="remove" size={18} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleAdjust(item.id, item.quantity, 1)}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtotal}>{subtotal}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => removeItem(item.id)}>
          <Ionicons name="trash" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const emptyState = (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={72} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
      <Text style={styles.emptySubtitle}>
        Explora las autopartes disponibles y agrega lo que necesites para tu vehículo.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/(tabs)/index")}>
        <Text style={styles.primaryButtonText}>Buscar autopartes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carrito de compras</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Vaciar</Text>
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          emptyState
        ) : (
          <>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 140 }}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{totalFormatted}</Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, styles.checkoutButton, total === 0 && styles.disabled]}
                onPress={() => router.push("/checkout")}
                disabled={total === 0}
              >
                <Ionicons name="card-outline" size={20} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>Proceder al pago</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  card: {
    position: "relative",
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#ddd",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.danger ?? "#ff5a5f",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    gap: 8,
    marginTop: 12,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 4,
  },
  checkoutButton: {
    flex: 1,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CartScreen;
