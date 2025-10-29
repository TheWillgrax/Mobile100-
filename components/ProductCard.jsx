import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

const buildPriceLabel = (item) => {
  const prices = [
    item.salePrice ? `Venta: ${formatCurrency(item.salePrice)}` : null,
    item.wholesalePrice ? `Mayoreo: ${formatCurrency(item.wholesalePrice)}` : null,
    item.retailPrice ? `Menudeo: ${formatCurrency(item.retailPrice)}` : null,
  ].filter(Boolean);

  return prices.length > 0 ? prices.join(" · ") : null;
};

const ProductCard = ({ item, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const priceLabel = useMemo(() => buildPriceLabel(item), [item]);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name="cube" size={32} color={theme.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.metaRow}>
          {item.code ? (
            <Text style={styles.meta} numberOfLines={1}>
              SKU: {item.code}
            </Text>
          ) : null}
          {item.vendorCode ? (
            <Text style={styles.meta} numberOfLines={1}>
              Proveedor: {item.vendorCode}
            </Text>
          ) : null}
          {item.type ? (
            <Text style={styles.meta} numberOfLines={1}>
              Tipo: {item.type}
            </Text>
          ) : null}
        </View>

        {priceLabel ? (
          <Text style={styles.priceLabel} numberOfLines={1}>
            {priceLabel}
          </Text>
        ) : null}

        {!!item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {(onEdit || onDelete) && (
          <View style={styles.actionsRow}>
            {onEdit ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onEdit}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={theme.primary}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionLabel}>Editar</Text>
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={theme.danger}
                  style={styles.actionIcon}
                />
                <Text style={[styles.actionLabel, styles.deleteLabel]}>Eliminar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
};

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
    iconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: theme.surface ?? theme.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    content: {
      flex: 1,
      gap: 6,
    },
    title: {
      fontSize: responsiveFontSize(16),
      fontWeight: "600",
      color: theme.text,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    meta: {
      color: theme.textLight,
      fontSize: responsiveFontSize(12),
    },
    priceLabel: {
      fontSize: responsiveFontSize(12),
      color: theme.primary,
      fontWeight: "600",
    },
    description: {
      fontSize: responsiveFontSize(12),
      color: theme.textLight,
    },
    actionsRow: {
      marginTop: 8,
      flexDirection: "row",
      gap: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: theme.surface ?? theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    deleteButton: {
      borderColor: theme.danger,
      backgroundColor: `${theme.danger}11`,
    },
    actionIcon: {
      marginRight: 6,
    },
    actionLabel: {
      fontSize: responsiveFontSize(12),
      fontWeight: "600",
      color: theme.primary,
    },
    deleteLabel: {
      color: theme.danger,
    },
});

export default ProductCard;
