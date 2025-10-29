import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../hooks/theme";
import { responsiveFontSize } from "../utils/responsive";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return `${value}`;
  const formatted = number
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${formatted}`;
};

export default function InventoryCard({ item }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const metaItems = useMemo(
    () =>
      [
        item?.sku ? `SKU: ${item.sku}` : null,
        item?.vendor ? `Proveedor: ${item.vendor}` : null,
        item?.statusLabel || item?.status
          ? `Estado: ${item.statusLabel ?? item.status}`
          : null,
        item?.type ? `Tipo: ${item.type}` : null,
      ].filter(Boolean),
    [item]
  );

  return (
    <View style={styles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="cube-outline" size={36} color={theme.textLight} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.name}
        </Text>

        {metaItems.length > 0 && (
          <View style={styles.metaRow}>
            {metaItems.map((text, index) => (
              <Text key={index} style={styles.meta} numberOfLines={1}>
                {text}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.stock} numberOfLines={1}>
            Stock: {item.stock ?? "N/D"}
          </Text>
          {!!item.price && (
            <Text style={styles.price} numberOfLines={1}>
              {formatCurrency(item.price)}
            </Text>
          )}
        </View>

        {!!item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      marginHorizontal: 16,
      marginVertical: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    image: {
      width: 92,
      height: 92,
      borderRadius: 12,
      backgroundColor: theme.surface,
      marginRight: 12,
    },
    placeholder: {
      width: 92,
      height: 92,
      borderRadius: 12,
      marginRight: 12,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: responsiveFontSize(15),
      fontWeight: "600",
      color: theme.text,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
    },
    meta: {
      color: theme.textLight,
      fontSize: responsiveFontSize(12),
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
    },
    stock: {
      fontWeight: "500",
      color: theme.primary,
      fontSize: responsiveFontSize(13),
    },
    price: {
      fontWeight: "600",
      color: theme.success ?? theme.primary,
      fontSize: responsiveFontSize(13),
    },
    description: {
      marginTop: 6,
      fontSize: responsiveFontSize(12),
      color: theme.textLight,
    },
  });

