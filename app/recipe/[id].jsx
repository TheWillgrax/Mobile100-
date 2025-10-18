// mobile/app/recipe/[id].jsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const styles = useMemo(() => createStyles(theme), [theme]);
  const heroGradient = useMemo(
    () => [theme.primary, theme.secondary ?? theme.primary, theme.background],
    [theme]
  );

  const [item, setItem] = useState(null);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showCartShortcut, setShowCartShortcut] = useState(false);

  const { addItem, parseUnitPrice: parsePrice, formatCurrency } = useCart();
  const shortcutOpacity = useRef(new Animated.Value(0)).current;
  const hideShortcutTimeout = useRef(null);

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

  const showShortcut = useCallback(() => {
    setShowCartShortcut(true);
    shortcutOpacity.stopAnimation();
    shortcutOpacity.setValue(0);
    Animated.timing(shortcutOpacity, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    if (hideShortcutTimeout.current) clearTimeout(hideShortcutTimeout.current);
    hideShortcutTimeout.current = setTimeout(() => {
      Animated.timing(shortcutOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setShowCartShortcut(false);
      });
    }, 5000);
  }, [shortcutOpacity]);

  useEffect(
    () => () => {
      if (hideShortcutTimeout.current) {
        clearTimeout(hideShortcutTimeout.current);
      }
    },
    []
  );

  const goToCart = useCallback(() => {
    router.push("/checkout");
  }, [router]);

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
    showShortcut();
    Alert.alert("Producto agregado", "Revisa tu carrito para completar el pedido.");
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <LinearGradient colors={heroGradient} style={styles.heroGradient} />
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={22} color={theme.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onToggleFavorite} style={styles.iconButton}>
              <Ionicons
                name={fav ? "heart" : "heart-outline"}
                size={24}
                color={fav ? theme.white : "rgba(255,255,255,0.85)"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.imageWrapper}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.heroImage}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={styles.heroImagePlaceholder}>
                <Ionicons name="image" size={42} color="rgba(255,255,255,0.7)" />
                <Text style={styles.placeholderText}>Imagen no disponible</Text>
              </View>
            )}
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="pricetag" size={16} color={theme.primary} />
                <Text style={styles.badgeText}>{price}</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="cube" size={16} color={theme.primary} />
                <Text style={styles.badgeText}>{stock}</Text>
              </View>
              {!!brand && (
                <View style={styles.badge}>
                  <Ionicons name="build" size={16} color={theme.primary} />
                  <Text style={styles.badgeText}>{brand}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Ionicons name="cash" size={22} color={theme.primary} />
              <Text style={styles.metricLabel}>Precio base</Text>
              <Text style={styles.metricValue}>{price}</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="albums" size={22} color={theme.primary} />
              <Text style={styles.metricLabel}>Inventario</Text>
              <Text style={styles.metricValue}>{stock}</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="trending-up" size={22} color={theme.primary} />
              <Text style={styles.metricLabel}>Total estimado</Text>
              <Text style={styles.metricValue}>{totalPreview}</Text>
            </View>
          </View>

          {Array.isArray(specs) && specs.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Especificaciones destacadas</Text>
              <View style={styles.chipContainer}>
                {specs.map((line, idx) => (
                  <View key={idx} style={styles.chip}>
                    <Text style={styles.chipText}>{line}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {Array.isArray(notes) && notes.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Compatibilidad y notas</Text>
              {notes.map((line, idx) => (
                <Text key={idx} style={styles.sectionParagraph}>
                  {typeof line === "string" ? line : JSON.stringify(line)}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
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
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart} activeOpacity={0.92}>
          <LinearGradient
            colors={[theme.primary, theme.secondary ?? theme.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Ionicons name="cart" size={20} color={theme.white} />
            <Text style={styles.addButtonText}>Agregar al carrito</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {showCartShortcut && (
        <Animated.View style={[styles.cartShortcut, { opacity: shortcutOpacity }]}> 
          <TouchableOpacity style={styles.cartShortcutButton} onPress={goToCart} activeOpacity={0.9}>
            <Ionicons name="bag-check" size={20} color={theme.white} />
            <Text style={styles.cartShortcutText}>Ir al carrito</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingBottom: 200,
    },
    heroCard: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: theme.card,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 10,
    },
    heroGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 18,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "center",
      alignItems: "center",
    },
    imageWrapper: {
      marginTop: 20,
      alignItems: "center",
      paddingBottom: 12,
    },
    heroImage: {
      width: "85%",
      height: 220,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.35)",
      backgroundColor: theme.surface,
    },
    heroImagePlaceholder: {
      width: "85%",
      height: 220,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.25)",
      backgroundColor: "rgba(255,255,255,0.12)",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    placeholderText: {
      color: "rgba(255,255,255,0.85)",
      fontWeight: "600",
      fontSize: responsiveFontSize(12),
    },
    heroContent: {
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    title: {
      fontSize: responsiveFontSize(22),
      fontWeight: "800",
      color: theme.white,
      marginBottom: 12,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
    },
    badgeText: {
      color: theme.white,
      fontWeight: "600",
      fontSize: responsiveFontSize(12),
    },
    infoSection: {
      marginTop: -32,
      paddingHorizontal: 16,
      gap: 18,
    },
    metricsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    metricCard: {
      flex: 1,
      minWidth: 110,
      backgroundColor: theme.card,
      borderRadius: 22,
      padding: 18,
      gap: 6,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
    metricLabel: {
      fontSize: responsiveFontSize(12),
      color: theme.textLight,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    metricValue: {
      fontSize: responsiveFontSize(16),
      fontWeight: "700",
      color: theme.text,
    },
    sectionCard: {
      backgroundColor: theme.card,
      borderRadius: 26,
      padding: 22,
      gap: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
      elevation: 5,
    },
    sectionTitle: {
      fontSize: responsiveFontSize(18),
      fontWeight: "700",
      color: theme.text,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipText: {
      color: theme.text,
      fontSize: responsiveFontSize(12),
      fontWeight: "600",
    },
    sectionParagraph: {
      color: theme.textLight,
      fontSize: responsiveFontSize(13),
      lineHeight: responsiveFontSize(20),
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 26,
      borderTopWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      gap: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 12,
    },
    footerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
    },
    priceInfo: {
      flex: 1,
    },
    totalLabel: {
      fontSize: responsiveFontSize(12),
      color: theme.textLight,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    totalValue: {
      fontSize: responsiveFontSize(20),
      fontWeight: "800",
      color: theme.text,
      marginTop: 4,
    },
    quantityControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    roundButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    quantity: {
      minWidth: 36,
      textAlign: "center",
      fontSize: responsiveFontSize(16),
      fontWeight: "700",
      color: theme.text,
    },
    addButton: {
      borderRadius: 18,
      overflow: "hidden",
    },
    addButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 14,
    },
    addButtonText: {
      color: theme.white,
      fontSize: responsiveFontSize(14),
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    cartShortcut: {
      position: "absolute",
      right: 20,
      bottom: 110,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
    },
    cartShortcutButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.primary,
      borderRadius: 999,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    cartShortcutText: {
      color: theme.white,
      fontWeight: "700",
      fontSize: responsiveFontSize(13),
    },
  });
