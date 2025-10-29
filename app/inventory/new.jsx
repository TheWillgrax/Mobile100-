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
import { useRouter } from "expo-router";

import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { createInventoryRecord } from "../../services/inventory";

const NewInventoryScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [vendor, setVendor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setProductName("");
    setProductCode("");
    setQuantity("");
    setVendor("");
  };

  const handleSuccessNavigation = () => {
    router.replace("/(tabs)/inventory");
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const trimmedName = productName.trim();
    const trimmedQuantity = quantity.trim();
    const trimmedVendor = vendor.trim();
    const trimmedCode = productCode.trim();

    if (!trimmedName) {
      setError("El nombre del producto es obligatorio.");
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
      await createInventoryRecord({
        product: {
          name: trimmedName,
          code: trimmedCode || undefined,
          vendorCode: trimmedVendor || undefined,
        },
        quantity: parsedQuantity,
        vendor: trimmedVendor || undefined,
      });

      resetForm();

      Alert.alert(
        "Inventario creado",
        "El nuevo inventario se registró correctamente.",
        [
          {
            text: "Volver al inventario",
            onPress: handleSuccessNavigation,
          },
        ],
        { cancelable: false }
      );
    } catch (err) {
      setError(err?.message ?? "No se pudo crear el inventario.");
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
            <Text style={styles.title}>Nuevo inventario</Text>
            <Text style={styles.description}>
              Registra un nuevo lote de inventario proporcionando la información del producto.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre del producto *</Text>
            <TextInput
              value={productName}
              onChangeText={setProductName}
              placeholder="Ej. Bujía NGK"
              style={styles.input}
              placeholderTextColor={theme.textLight}
              autoCapitalize="sentences"
              editable={!submitting}
            />
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
              {submitting ? "Guardando..." : "Crear inventario"}
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

export default NewInventoryScreen;
