import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "../hooks/theme";

const normalizeText = (value) => (value ?? "").toLowerCase();

const ProductPicker = ({
  products = [],
  selectedProductId,
  onSelect,
  disabled = false,
  placeholder = "Selecciona un producto",
  labelExtractor = (item) => item?.name ?? "(Sin nombre)",
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const selectedProduct = useMemo(
    () => products.find((item) => `${item.id}` === `${selectedProductId}`) ?? null,
    [products, selectedProductId]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    if (!normalizedSearch) return products;

    return products.filter((item) =>
      [item.name, item.code, item.vendorCode]
        .map(normalizeText)
        .some((value) => value.includes(normalizedSearch))
    );
  }, [products, search]);

  const handleOpen = () => {
    if (disabled) return;
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
    setSearch("");
  };

  const handleSelect = (item) => {
    if (disabled) return;
    onSelect?.(item);
    handleClose();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.input, disabled && styles.inputDisabled]}
        onPress={handleOpen}
        activeOpacity={0.85}
      >
        <Text style={[styles.inputText, !selectedProduct && styles.placeholder]}>
          {selectedProduct ? labelExtractor(selectedProduct) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.textLight} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona un producto</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre, SKU o proveedor"
              placeholderTextColor={theme.textLight}
              style={styles.searchInput}
              autoCapitalize="none"
            />

            <FlatList
              data={filteredProducts}
              keyExtractor={(item, index) => `${item.id ?? index}`}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="cube-outline" size={28} color={theme.textLight} />
                  <Text style={styles.emptyText}>No se encontraron productos.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.optionTextWrapper}>
                    <Text style={styles.optionTitle}>{item.name}</Text>
                    <Text style={styles.optionMeta}>
                      {[
                        item.code ? `SKU: ${item.code}` : null,
                        item.vendorCode ? `Proveedor: ${item.vendorCode}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Sin detalles"}
                    </Text>
                  </View>
                  {`${item.id}` === `${selectedProductId}` && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.card,
    },
    inputDisabled: {
      opacity: 0.6,
    },
    inputText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      marginRight: 12,
    },
    placeholder: {
      color: theme.textLight,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "flex-end",
    },
    modalContent: {
      maxHeight: "80%",
      backgroundColor: theme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
      gap: 12,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    closeButton: {
      padding: 8,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: theme.text,
      backgroundColor: theme.card,
      fontSize: 16,
    },
    option: {
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    optionTextWrapper: {
      flex: 1,
      marginRight: 12,
      gap: 4,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    optionMeta: {
      fontSize: 13,
      color: theme.textLight,
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: "center",
      gap: 12,
    },
    emptyText: {
      color: theme.textLight,
      fontSize: 14,
    },
  });

export default ProductPicker;
