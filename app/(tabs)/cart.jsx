import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMemo } from "react";

import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { responsiveFontSize } from "../../utils/responsive";
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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
            <Ionicons name="car-outline" size={28} color={theme.textLight} />
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
                <Ionicons name="remove" size={18} color={theme.white} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleAdjust(item.id, item.quantity, 1)}
              >
                <Ionicons name="add" size={18} color={theme.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtotal}>{subtotal}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => removeItem(item.id)}>
          <Ionicons name="trash" size={20} color={theme.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const emptyState = (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={72} color={theme.textLight} />
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
                <Ionicons name="card-outline" size={20} color={theme.white} />
                <Text style={styles.primaryButtonText}>Proceder al pago</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeScreen>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
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
      fontSize: responsiveFontSize(20),
      fontWeight: "700",
      color: theme.text,
    },
    clearText: {
      fontSize: responsiveFontSize(13),
      fontWeight: "600",
      color: theme.primary,
    },
    card: {
      position: "relative",
      flexDirection: "row",
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 2,
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: theme.surface,
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
      fontSize: responsiveFontSize(15),
      fontWeight: "600",
      color: theme.text,
    },
    priceLabel: {
      fontSize: responsiveFontSize(13),
      color: theme.textLight,
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
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    quantityText: {
      minWidth: 24,
      textAlign: "center",
      fontSize: responsiveFontSize(15),
      fontWeight: "600",
      color: theme.text,
    },
    subtotal: {
      fontSize: responsiveFontSize(15),
      fontWeight: "700",
      color: theme.text,
    },
    deleteButton: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.danger,
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
      fontSize: responsiveFontSize(18),
      fontWeight: "700",
      color: theme.text,
    },
    emptySubtitle: {
      fontSize: responsiveFontSize(14),
      color: theme.textLight,
      textAlign: "center",
      lineHeight: responsiveFontSize(20),
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 999,
      gap: 8,
      marginTop: 12,
    },
    primaryButtonText: {
      color: theme.white,
      fontWeight: "700",
      fontSize: responsiveFontSize(14),
    },
    footer: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 32,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      gap: 16,
      shadowColor: theme.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 3,
    },
    totalLabel: {
      fontSize: responsiveFontSize(13),
      color: theme.textLight,
    },
    totalValue: {
      fontSize: responsiveFontSize(18),
      fontWeight: "700",
      color: theme.text,
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
