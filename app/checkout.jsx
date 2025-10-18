import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import SafeScreen from "../components/SafeScreen";
import { useTheme } from "../hooks/theme";
import { responsiveFontSize } from "../utils/responsive";
import { useCart } from "./providers/CartProvider";

const CheckoutScreen = () => {
  const router = useRouter();
  const { items, totalFormatted, clearCart, formatCurrency } = useCart();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/(tabs)/cart");
    }
  }, [items.length, router]);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Datos incompletos", "Ingresa tu nombre, teléfono y dirección de entrega.");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      clearCart();
      Alert.alert("¡Pedido confirmado!", "Nuestro equipo se pondrá en contacto para coordinar el envío.", [
        {
          text: "Aceptar",
          onPress: () => router.replace("/(tabs)/index"),
        },
      ]);
    }, 500);
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Checkout</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen del pedido</Text>
            {items.map((item) => (
              <View key={item.id} style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryTitle}>{item.title}</Text>
                  <Text style={styles.summarySubtitle}>
                    {item.quantity} x {item.priceLabel}
                  </Text>
                </View>
                <Text style={styles.summaryAmount}>
                  {formatCurrency(item.unitPrice * item.quantity)}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{totalFormatted}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del cliente</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={theme.textLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              placeholderTextColor={theme.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Dirección de entrega"
              placeholderTextColor={theme.textLight}
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Notas adicionales (opcional)"
              placeholderTextColor={theme.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={theme.white} />
            <Text style={styles.submitText}>
              {submitting ? "Procesando..." : "Confirmar pedido"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 40,
      gap: 24,
    },
    title: {
      fontSize: responsiveFontSize(24),
      fontWeight: "700",
      color: theme.text,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: responsiveFontSize(16),
      fontWeight: "700",
      color: theme.text,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    summaryTitle: {
      fontSize: responsiveFontSize(15),
      fontWeight: "600",
      color: theme.text,
    },
    summarySubtitle: {
      fontSize: responsiveFontSize(13),
      color: theme.textLight,
      marginTop: 2,
    },
    summaryAmount: {
      fontSize: responsiveFontSize(15),
      fontWeight: "700",
      color: theme.text,
    },
    summaryTotalLabel: {
      fontSize: responsiveFontSize(17),
      fontWeight: "700",
      color: theme.text,
    },
    summaryTotalValue: {
      fontSize: responsiveFontSize(18),
      fontWeight: "700",
      color: theme.primary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: responsiveFontSize(14),
      color: theme.text,
      backgroundColor: theme.surface,
    },
    multiline: {
      minHeight: 96,
      textAlignVertical: "top",
    },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 999,
    },
    submitText: {
      color: theme.white,
      fontWeight: "700",
      fontSize: responsiveFontSize(15),
      textTransform: "uppercase",
    },
    disabled: {
      opacity: 0.7,
    },
  });

export default CheckoutScreen;
