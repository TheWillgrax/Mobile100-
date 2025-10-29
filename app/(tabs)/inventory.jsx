import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import InventoryCard from "../../components/InventoryCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { fetchInventoryItems } from "../../services/inventory";

const InventoryScreen = () => {
  const { theme } = useTheme();
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

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInventory();
  }, [loadInventory]);

  const renderItem = useCallback(({ item }) => <InventoryCard item={item} />, []);

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
            <Text style={styles.title}>Inventario en tiempo real</Text>
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
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
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

