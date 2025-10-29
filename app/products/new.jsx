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
import { createProduct } from "../../services/products";

const ProductCreateScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [type, setType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setName("");
    setCode("");
    setDescription("");
    setVendorCode("");
    setSalePrice("");
    setWholesalePrice("");
    setRetailPrice("");
    setType("");
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createProduct({
        name: trimmedName,
        code: trimmedCode || undefined,
        description: description.trim() || undefined,
        vendorCode: vendorCode.trim() || undefined,
        salePrice: salePrice ? Number(salePrice) : undefined,
        wholesalePrice: wholesalePrice ? Number(wholesalePrice) : undefined,
        retailPrice: retailPrice ? Number(retailPrice) : undefined,
        type: type.trim() || undefined,
      });

      resetForm();

      Alert.alert(
        "Producto creado",
        "El producto se registró correctamente.",
        [
          {
            text: "Ver productos",
            onPress: () => router.replace("/products"),
          },
          {
            text: "Seguir creando",
            style: "cancel",
          },
        ]
      );
    } catch (err) {
      setError(err?.message ?? "No se pudo crear el producto.");
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
            <Text style={styles.title}>Nuevo producto</Text>
            <Text style={styles.description}>
              Registra un nuevo producto para asociarlo a tus inventarios.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
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
              value={code}
              onChangeText={setCode}
              placeholder="Ej. SKU-12345"
              style={styles.input}
              placeholderTextColor={theme.textLight}
              autoCapitalize="characters"
              editable={!submitting}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción del producto"
              style={[styles.input, styles.multilineInput]}
              placeholderTextColor={theme.textLight}
              editable={!submitting}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Proveedor</Text>
            <TextInput
              value={vendorCode}
              onChangeText={setVendorCode}
              placeholder="Ej. Proveedor ABC"
              style={styles.input}
              placeholderTextColor={theme.textLight}
              autoCapitalize="words"
              editable={!submitting}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Precio de venta</Text>
              <TextInput
                value={salePrice}
                onChangeText={setSalePrice}
                placeholder="999.99"
                style={styles.input}
                placeholderTextColor={theme.textLight}
                keyboardType="decimal-pad"
                editable={!submitting}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Precio mayoreo</Text>
              <TextInput
                value={wholesalePrice}
                onChangeText={setWholesalePrice}
                placeholder="999.99"
                style={styles.input}
                placeholderTextColor={theme.textLight}
                keyboardType="decimal-pad"
                editable={!submitting}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Precio menudeo</Text>
              <TextInput
                value={retailPrice}
                onChangeText={setRetailPrice}
                placeholder="999.99"
                style={styles.input}
                placeholderTextColor={theme.textLight}
                keyboardType="decimal-pad"
                editable={!submitting}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Tipo</Text>
              <TextInput
                value={type}
                onChangeText={setType}
                placeholder="Ej. Tipo A"
                style={styles.input}
                placeholderTextColor={theme.textLight}
                autoCapitalize="words"
                editable={!submitting}
              />
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonLabel}>
              {submitting ? "Guardando..." : "Crear producto"}
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
    multilineInput: {
      minHeight: 100,
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    rowItem: {
      flex: 1,
      gap: 8,
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

export default ProductCreateScreen;
