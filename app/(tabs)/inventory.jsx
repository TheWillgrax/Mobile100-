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

import InventoryCard from "../../components/InventoryCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import {
  deleteInventoryRecord,
  fetchInventoryItems,
} from "../../services/inventory";

const InventoryScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadInventory = useCallback(async () => {
    try {
      setError(null);
      const items = await fetchInventoryItems();
      setInventory(items);
    } catch (err) {
      console.error("Failed to load inventory", err);
      setError(err?.message ?? "No se pudo cargar el inventario.");
      setInventory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadInventory();
    }, [loadInventory])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInventory();
  }, [loadInventory]);

  const handleEditItem = useCallback(
    (item) => {
      router.push({
        pathname: "/inventory/edit",
        params: {
          id: item.id,
          productId: item.productId ?? "",
          sku: item.sku ?? "",
          vendor: item.vendor ?? "",
          quantity: item.stock ?? "",
          name: item.name ?? "",
        },
      });
    },
    [router]
  );

  const handleDeleteItem = useCallback(
    (item) => {
      if (!item?.id) return;

      Alert.alert(
        "Eliminar inventario",
        `¿Deseas eliminar el inventario de ${item.name}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                const parsedStock = Number(item.stock);
                const quantityToRemove =
                  Number.isFinite(parsedStock) && parsedStock > 0 ? parsedStock : 1;

                const updated = await deleteInventoryRecord(item.id, quantityToRemove);

                setInventory((prev) => {
                  if (!updated || !Number.isFinite(updated?.stock) || updated.stock <= 0) {
                    return prev.filter((entry) => entry.id !== item.id);
                  }

                  return prev.map((entry) =>
                    entry.id === item.id ? { ...entry, stock: updated.stock } : entry
                  );
                });
              } catch (err) {
                Alert.alert(
                  "No se pudo eliminar",
                  err?.message ?? "Ocurrió un error al eliminar el inventario."
                );
              }
            },
          },
        ]
      );
    },
    []
  );

  const renderItem = useCallback(
    ({ item }) => (
      <InventoryCard item={item} onEdit={() => handleEditItem(item)} onDelete={() => handleDeleteItem(item)} />
    ),
    [handleDeleteItem, handleEditItem]
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando inventario real..." />;
  }

  return (
    <SafeScreen>
      <FlatList
        data={inventory}
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
              <Text style={styles.title}>Inventario en tiempo real</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => router.push("/products")}
                  style={[styles.newButton, styles.secondaryActionButton]}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="cube"
                    size={16}
                    color={theme.primary}
                    style={styles.newButtonIcon}
                  />
                  <Text style={styles.secondaryActionLabel}>Productos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/inventory/new")}
                  style={styles.newButton}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={theme.white}
                    style={styles.newButtonIcon}
                  />
                  <Text style={styles.newButtonLabel}>Nuevo inventario</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.subtitle}>
              Visualiza las existencias actuales de autopartes directamente desde Strapi.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyDescription}>
              {error ? error : "No se encontraron autopartes en el inventario."}
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
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
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
    secondaryActionButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    newButtonIcon: {
      marginRight: 6,
    },
    newButtonLabel: {
      color: theme.white,
      fontSize: 14,
      fontWeight: "600",
    },
    secondaryActionLabel: {
      color: theme.primary,
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

export default InventoryScreen;

