import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import { useAuth } from "../../hooks/auth";
import { useTheme } from "../../hooks/theme";
import { responsiveFontSize } from "../../utils/responsive";
import CaptchaModal from "../../components/CaptchaModal";

const SignInScreen = () => {
  const router = useRouter();
  const { signIn: authenticate } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = useMemo(
    () => [theme.primary, theme.secondary ?? theme.primary, theme.accent ?? theme.primary],
    [theme]
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
  };

  const handleCaptchaCancel = () => {
    setCaptchaToken(null);
    Alert.alert("Verificación requerida", "Resuelve el CAPTCHA para continuar");
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos requeridos", "Por favor completa email y contraseña");
      return;
    }
    if (!captchaToken) {
      Alert.alert("Verificación", "Completa el CAPTCHA antes de continuar");
      captchaRef.current?.open();
      return;
    }
    try {
      setLoading(true);
      await authenticate(email, password);
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("No pudimos iniciar sesión", e.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <View style={styles.decorativeCircleTop} />
      <View style={styles.decorativeCircleBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroContainer}>
            <View style={styles.heroBadge}>
              <Ionicons name="car-sport" size={28} color={theme.primary} />
              <Text style={styles.heroBadgeText}>AutoParts</Text>
            </View>
            <Text style={styles.heroTitle}>Bienvenido de nuevo</Text>
            <Text style={styles.heroSubtitle}>
              Gestiona tu inventario y tus pedidos con una experiencia renovada.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Ingresa a tu cuenta</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail" size={22} color={theme.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor={theme.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed" size={22} color={theme.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor={theme.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={theme.textLight}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.cardSection, captchaToken && styles.cardSectionSuccess]}>
              <View style={styles.captchaTextContainer}>
                <Text style={styles.captchaTitle}>Protección CAPTCHA</Text>
                <Text style={styles.captchaSubtitle}>
                  {captchaToken
                    ? "Verificación completada correctamente"
                    : "Valida que eres una persona para continuar"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => captchaRef.current?.open()}
                style={[styles.captchaButton, captchaToken && styles.captchaButtonVerified]}
              >
                <Text style={styles.captchaButtonText}>
                  {captchaToken ? "Verificado" : "Verificar"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              style={styles.submitButton}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={gradientColors.slice().reverse()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color={theme.white} />
                ) : (
                  <>
                    <Ionicons name="log-in" size={18} color={theme.white} />
                    <Text style={styles.submitText}>Iniciar sesión</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push("/(auth)/sign-up")}
            >
              <Text style={styles.registerText}>
                ¿No tienes una cuenta? {" "}
                <Text style={styles.registerTextHighlight}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CaptchaModal ref={captchaRef} onVerify={handleCaptchaVerify} onCancel={handleCaptchaCancel} />
    </LinearGradient>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    gradient: {
      flex: 1,
      position: "relative",
    },
    decorativeCircleTop: {
      position: "absolute",
      top: -90,
      right: -90,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "rgba(255,255,255,0.15)",
    },
    decorativeCircleBottom: {
      position: "absolute",
      bottom: -110,
      left: -70,
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: "rgba(0,0,0,0.08)",
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 26,
      paddingVertical: 40,
    },
    heroContainer: {
      marginBottom: 30,
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 10,
      backgroundColor: theme.white,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    heroBadgeText: {
      color: theme.primary,
      fontWeight: "800",
      fontSize: responsiveFontSize(12),
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    heroTitle: {
      fontSize: responsiveFontSize(30),
      fontWeight: "800",
      color: theme.white,
      marginTop: 18,
      letterSpacing: 0.6,
    },
    heroSubtitle: {
      marginTop: 10,
      color: "rgba(255,255,255,0.85)",
      fontSize: responsiveFontSize(14),
      lineHeight: responsiveFontSize(21),
      maxWidth: 320,
    },
    formCard: {
      backgroundColor: theme.card,
      borderRadius: 26,
      padding: 26,
      gap: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 10,
    },
    sectionTitle: {
      fontSize: responsiveFontSize(20),
      fontWeight: "700",
      color: theme.text,
    },
    inputGroup: {
      gap: 8,
    },
    inputLabel: {
      fontSize: responsiveFontSize(12),
      fontWeight: "700",
      textTransform: "uppercase",
      color: theme.textLight,
      letterSpacing: 0.8,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      gap: 12,
    },
    input: {
      flex: 1,
      color: theme.text,
      fontSize: responsiveFontSize(14),
    },
    cardSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: 18,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardSectionSuccess: {
      borderColor: theme.success,
      backgroundColor: `${theme.success}1A`,
    },
    captchaTextContainer: {
      flex: 1,
      gap: 6,
    },
    captchaTitle: {
      color: theme.text,
      fontWeight: "700",
      fontSize: responsiveFontSize(13),
    },
    captchaSubtitle: {
      color: theme.textLight,
      fontSize: responsiveFontSize(12),
      lineHeight: responsiveFontSize(18),
    },
    captchaButton: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.primary,
    },
    captchaButtonVerified: {
      backgroundColor: theme.success,
    },
    captchaButtonText: {
      color: theme.white,
      fontWeight: "700",
      fontSize: responsiveFontSize(12),
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    submitButton: {
      borderRadius: 16,
      overflow: "hidden",
      marginTop: 4,
    },
    submitGradient: {
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
    },
    submitText: {
      color: theme.white,
      fontSize: responsiveFontSize(15),
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    registerLink: {
      alignItems: "center",
    },
    registerText: {
      color: theme.textLight,
      fontSize: responsiveFontSize(13),
      marginTop: 8,
    },
    registerTextHighlight: {
      color: theme.primary,
      fontWeight: "700",
    },
  });

export default SignInScreen;
