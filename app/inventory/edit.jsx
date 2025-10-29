import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import ProductPicker from "../../components/ProductPicker";
import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { updateInventoryRecord } from "../../services/inventory";
import { fetchProducts } from "../../services/products";

const coerceParam = (value) => {
  if (Array.isArray(value)) return value[0];
  return value ?? null;
};

const InventoryEditScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const inventoryId = coerceParam(params.id);
  const initialProductId = coerceParam(params.productId);
  const initialSku = coerceParam(params.sku) ?? coerceParam(params.code) ?? "";
  const initialVendor = coerceParam(params.vendor) ?? "";
  const initialQuantity = coerceParam(params.quantity) ?? coerceParam(params.stock) ?? "";

  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const [productCode, setProductCode] = useState(initialSku);
  const [quantity, setQuantity] = useState(initialQuantity ? `${initialQuantity}` : "");
  const [vendor, setVendor] = useState(initialVendor);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const items = await fetchProducts();
        setProducts(items);
        setProductsError(null);
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts([]);
        setProductsError(err?.message ?? "No se pudieron cargar los productos.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const handleSelectProduct = (product) => {
    setSelectedProductId(product?.id ?? null);
    setProductCode(product?.code ?? "");
    setVendor(product?.vendorCode ?? "");
    setError(null);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const trimmedQuantity = `${quantity}`.trim();
    const trimmedVendor = `${vendor}`.trim();
    const trimmedCode = `${productCode}`.trim();

    if (!selectedProductId) {
      setError("Debes seleccionar un producto existente.");
      return;
    }

    if (!trimmedQuantity) {
      setError("La cantidad es obligatoria.");
      return;
    }

    const parsedQuantity = Number(trimmedQuantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateInventoryRecord(inventoryId, {
        productId: selectedProductId,
        product:
          trimmedCode || trimmedVendor
            ? {
                code: trimmedCode || undefined,
                vendorCode: trimmedVendor || undefined,
              }
            : undefined,
        quantity: parsedQuantity,
        vendor: trimmedVendor || undefined,
      });

      Alert.alert(
        "Inventario actualizado",
        "El inventario se guardó correctamente.",
        [
          {
            text: "Volver",
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    } catch (err) {
      setError(err?.message ?? "No se pudo actualizar el inventario.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Editar inventario</Text>
            <Text style={styles.description}>
              Actualiza los detalles del inventario seleccionado.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Producto *</Text>
            <ProductPicker
              products={products}
              selectedProductId={selectedProductId}
              onSelect={handleSelectProduct}
              placeholder={
                loadingProducts
                  ? "Cargando productos..."
                  : "Selecciona un producto"
              }
              disabled={submitting || loadingProducts}
            />
            {productsError ? <Text style={styles.helperText}>{productsError}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Código o SKU</Text>
            <TextInput
              value={productCode}
              onChangeText={setProductCode}
              placeholder="Ej. SKU-12345"
              style={styles.input}
              placeholderTextColor={theme.textLight}
              autoCapitalize="characters"
              editable={!submitting}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cantidad *</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Ej. 25"
              style={styles.input}
              placeholderTextColor={theme.textLight}
              keyboardType="numeric"
              editable={!submitting}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Proveedor</Text>
            <TextInput
              value={vendor}
              onChangeText={setVendor}
              placeholder="Ej. Proveedor ABC"
              style={styles.input}
              placeholderTextColor={theme.textLight}
              autoCapitalize="words"
              editable={!submitting}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonLabel}>
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
            disabled={submitting}
          >
            <Text style={styles.secondaryButtonLabel}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      padding: 20,
      gap: 16,
    },
    header: {
      gap: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
    },
    description: {
      fontSize: 14,
      color: theme.textLight,
    },
    fieldGroup: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.card,
    },
    errorText: {
      color: theme.danger,
      fontSize: 14,
      fontWeight: "500",
      marginTop: 4,
    },
    helperText: {
      color: theme.textLight,
      fontSize: 13,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    primaryButtonDisabled: {
      opacity: 0.7,
    },
    primaryButtonLabel: {
      color: theme.white,
      fontSize: 16,
      fontWeight: "700",
    },
    secondaryButton: {
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondaryButtonLabel: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default InventoryEditScreen;
