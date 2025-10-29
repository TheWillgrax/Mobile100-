import { useMemo, useState } from "react";
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

import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { updateInventoryRecord } from "../../services/inventory";

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
  const initialProductName = coerceParam(params.name) ?? "";
  const initialSku = coerceParam(params.sku) ?? coerceParam(params.code) ?? "";
  const initialVendor = coerceParam(params.vendor) ?? "";
  const initialQuantity = coerceParam(params.quantity) ?? coerceParam(params.stock) ?? "";

  const parsedInitialQuantity = Number(initialQuantity);
  const startingQuantity =
    Number.isFinite(parsedInitialQuantity) && parsedInitialQuantity >= 0
      ? parsedInitialQuantity
      : 0;

  const [quantity, setQuantity] = useState(`${startingQuantity}`);
  const [currentStock, setCurrentStock] = useState(startingQuantity);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (submitting) return;

    if (!inventoryId) {
      setError("No se pudo identificar el inventario a actualizar.");
      return;
    }

    const trimmedQuantity = `${quantity}`.trim();

    if (!trimmedQuantity) {
      setError("La cantidad es obligatoria.");
      return;
    }

    const parsedQuantity = Number(trimmedQuantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    const parsedCurrentStock = Number(currentStock);
    const current = Number.isFinite(parsedCurrentStock) ? parsedCurrentStock : 0;
    const difference = parsedQuantity - current;

    if (difference === 0) {
      setError("Debes ingresar una cantidad diferente al inventario actual.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const action = difference > 0 ? "add" : "remove";
      const payloadQuantity = Math.abs(difference);

      await updateInventoryRecord(inventoryId, {
        quantity: payloadQuantity,
        action,
      });

      setCurrentStock(parsedQuantity);
      setQuantity(`${parsedQuantity}`);

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
            <Text style={styles.label}>Producto</Text>
            <View style={styles.readonlyField}>
              <Text style={styles.readonlyText} numberOfLines={2}>
                {initialProductName || initialProductId || "Producto sin nombre"}
              </Text>
              {initialSku ? (
                <Text style={styles.helperText}>SKU: {initialSku}</Text>
              ) : null}
              {initialVendor ? (
                <Text style={styles.helperText}>Proveedor: {initialVendor}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Inventario actual</Text>
            <Text style={styles.currentStockText}>{currentStock}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nuevo inventario *</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Ingresa la cantidad final"
              style={styles.input}
              placeholderTextColor={theme.textLight}
              keyboardType="numeric"
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
    readonlyField: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.card,
      gap: 4,
    },
    readonlyText: {
      fontSize: 16,
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
    currentStockText: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.primary,
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
