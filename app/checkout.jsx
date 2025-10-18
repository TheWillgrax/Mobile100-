import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { COLORS } from "../constants/colors";
import { useCart } from "./providers/CartProvider";

const CheckoutScreen = () => {
  const router = useRouter();
  const { items, totalFormatted, clearCart, formatCurrency } = useCart();

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
      Alert.alert(
        "¡Pedido confirmado!",
        "Nuestro equipo se pondrá en contacto para coordinar el envío.",
        [
          {
            text: "Aceptar",
            onPress: () => router.replace("/(tabs)/index"),
          },
        ]
      );
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
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Dirección de entrega"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Notas adicionales (opcional)"
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
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.white} />
            <Text style={styles.submitText}>
              {submitting ? "Procesando..." : "Confirmar pedido"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  summarySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
    color: COLORS.text,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 999,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CheckoutScreen;
