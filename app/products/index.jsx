import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import ProductCard from "../../components/ProductCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { deleteProduct, fetchProducts } from "../../services/products";

const ProductsScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      setError(null);
      const items = await fetchProducts();
      setProducts(items);
    } catch (err) {
      console.error("Failed to load products", err);
      setError(err?.message ?? "No se pudieron cargar los productos.");
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProducts();
    }, [loadProducts])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
  }, [loadProducts]);

  const handleEdit = useCallback(
    (item) => {
      router.push({
        pathname: "/products/edit",
        params: {
          id: item.id,
          name: item.name ?? "",
          code: item.code ?? "",
          description: item.description ?? "",
          vendorCode: item.vendorCode ?? "",
          salePrice: item.salePrice ?? "",
          wholesalePrice: item.wholesalePrice ?? "",
          retailPrice: item.retailPrice ?? "",
          type: item.type ?? "",
        },
      });
    },
    [router]
  );

  const handleDelete = useCallback((item) => {
    if (!item?.id) return;

    Alert.alert(
      "Eliminar producto",
      `¿Deseas eliminar el producto ${item.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(item.id);
              setProducts((prev) => prev.filter((entry) => entry.id !== item.id));
            } catch (err) {
              Alert.alert(
                "No se pudo eliminar",
                err?.message ?? "Ocurrió un error al eliminar el producto."
              );
            }
          },
        },
      ]
    );
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <ProductCard item={item} onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item)} />
    ),
    [handleDelete, handleEdit]
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando productos..." />;
  }

  return (
    <SafeScreen>
      <FlatList
        data={products}
        keyExtractor={(item, index) => `${item.id ?? index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Productos</Text>
              <TouchableOpacity
                onPress={() => router.push("/products/new")}
                style={styles.newButton}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={18} color={theme.white} style={styles.newButtonIcon} />
                <Text style={styles.newButtonLabel}>Nuevo producto</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Gestiona los productos disponibles para tus inventarios.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyDescription}>
              {error ? error : "No se encontraron productos registrados."}
            </Text>
          </View>
        }
      />
    </SafeScreen>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    listContent: {
      paddingBottom: 24,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    newButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    newButtonIcon: {
      marginRight: 6,
    },
    newButtonLabel: {
      color: theme.white,
      fontSize: 14,
      fontWeight: "600",
    },
    subtitle: {
      fontSize: 14,
      color: theme.textLight,
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 64,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 14,
      color: theme.textLight,
      textAlign: "center",
    },
  });

export default ProductsScreen;
