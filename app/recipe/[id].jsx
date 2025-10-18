// mobile/app/recipe/[id].jsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { createRecipeStyles } from "../../assets/styles/recipe-detail.styles";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTheme } from "../../hooks/theme";
import { responsiveFontSize } from "../../utils/responsive";
import { isFavorite, toggleFavorite } from "../../services/favorites";
import { MealAPI } from "../../services/mealAPI";
import { useCart } from "../providers/CartProvider";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const recipeStyles = useMemo(() => createRecipeStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [item, setItem] = useState(null);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { addItem, parseUnitPrice: parsePrice, formatCurrency } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const raw = await MealAPI.getMealById(id);
        const data = MealAPI.transformMealData ? MealAPI.transformMealData(raw) : raw;
        setItem(data);

        const favState = await isFavorite(String(id));
        setFav(favState);
      } catch (e) {
        console.log("Error loading item:", e);
        Alert.alert("Error", "Failed to load item");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onToggleFavorite = async () => {
    try {
      const list = await toggleFavorite(String(id));
      setFav(list.includes(String(id)));
    } catch (e) {
      console.log("toggleFavorite error:", e);
    }
  };

  if (loading || !item) return <LoadingSpinner message="Loading item..." />;

  const price = item.price ?? item.cookTime ?? "—";
  const stock = item.stock ?? item.servings ?? "—";
  const brand = item.brand ?? item.area ?? null;
  const specs = item.specs ?? item.ingredients ?? [];
  const notes = item.compatibility ?? item.instructions ?? [];
  const unitPrice = parsePrice(price);
  const totalPreview = formatCurrency(unitPrice * quantity || unitPrice);

  const increase = () => setQuantity((prev) => Math.min(99, prev + 1));
  const decrease = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    addItem({ ...item, price, priceLabel: price }, quantity);
    Alert.alert("Producto agregado", "Revisa tu carrito para completar el pedido.");
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={recipeStyles.container} showsVerticalScrollIndicator={false}>
        <View style={recipeStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={recipeStyles.iconButton}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleFavorite} style={recipeStyles.iconButton}>
            <Ionicons
              name={fav ? "heart" : "heart-outline"}
              size={24}
              color={fav ? theme.primary : theme.text}
            />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {!!item.image && (
            <Image
              source={{ uri: item.image }}
              style={recipeStyles.image}
              contentFit="cover"
              transition={300}
            />
          )}
        </View>

        <View style={recipeStyles.headerContent}>
          <Text style={recipeStyles.title}>{item.title}</Text>

          <View style={recipeStyles.metaRow}>
            <View style={recipeStyles.metaItem}>
              <Ionicons name="pricetag-outline" size={18} color={theme.textLight} />
              <Text style={recipeStyles.metaText}>{price}</Text>
            </View>
            <View style={recipeStyles.metaItem}>
              <Ionicons name="cube-outline" size={18} color={theme.textLight} />
              <Text style={recipeStyles.metaText}>{stock}</Text>
            </View>
            {!!brand && (
              <View style={recipeStyles.metaItem}>
                <Ionicons name="build-outline" size={18} color={theme.textLight} />
                <Text style={recipeStyles.metaText}>{brand}</Text>
              </View>
            )}
          </View>
        </View>

        {Array.isArray(specs) && specs.length > 0 && (
          <View style={recipeStyles.section}>
            <Text style={recipeStyles.sectionTitle}>Especificaciones</Text>
            {specs.map((line, idx) => (
              <Text key={idx} style={recipeStyles.listItem}>
                • {line}
              </Text>
            ))}
          </View>
        )}

        {Array.isArray(notes) && notes.length > 0 && (
          <View style={recipeStyles.section}>
            <Text style={recipeStyles.sectionTitle}>Compatibilidad / Notas</Text>
            {notes.map((line, idx) => (
              <Text key={idx} style={recipeStyles.stepItem}>
                {typeof line === "string" ? line : JSON.stringify(line)}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceInfo}>
          <Text style={styles.totalLabel}>Total estimado</Text>
          <Text style={styles.totalValue}>{totalPreview}</Text>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity style={styles.roundButton} onPress={decrease}>
            <Ionicons name="remove" size={18} color={theme.white} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity style={styles.roundButton} onPress={increase}>
            <Ionicons name="add" size={18} color={theme.white} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color={theme.white} />
          <Text style={styles.addButtonText}>Agregar al carrito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.background,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    priceInfo: {
      flex: 1,
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
    quantityControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    roundButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    quantity: {
      minWidth: 32,
      textAlign: "center",
      fontSize: responsiveFontSize(16),
      fontWeight: "700",
      color: theme.text,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    addButtonText: {
      color: theme.white,
      fontSize: responsiveFontSize(14),
      fontWeight: "700",
      textTransform: "uppercase",
    },
  });
