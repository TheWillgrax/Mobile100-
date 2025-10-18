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

import RecaptchaModal from "../../components/RecaptchaModal";
import { useTheme } from "../../hooks/theme";
import { responsiveFontSize } from "../../utils/responsive";
import { RECAPTCHA_CONFIG } from "../../utils/config";

const SignUpScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = useMemo(
    () => [theme.primary, theme.secondary ?? theme.primary, theme.background],
    [theme]
  );
  const { siteKey, domain, language } = RECAPTCHA_CONFIG;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const handleRecaptchaError = (message) => {
    const errorMessage =
      message && typeof message === "string"
        ? message
        : "No pudimos cargar el reCAPTCHA. Comprueba tu conexión e inténtalo de nuevo.";
    Alert.alert(
      "Error con reCAPTCHA",
      `${errorMessage}\nVerifica que el dominio autorizado para tu clave incluya ${domain}.`
    );
  };

  const handleRecaptchaVerify = (token) => {
    setCaptchaToken(token);
    Alert.alert("Verificación completada", "reCAPTCHA resuelto correctamente");
  };

  const handleRecaptchaExpire = () => {
    setCaptchaToken(null);
    Alert.alert("Verificación requerida", "El reCAPTCHA ha expirado, inténtalo nuevamente");
  };

  const handleSignUp = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Contraseña", "Debe tener al menos 6 caracteres");
      return;
    }
    if (!captchaToken) {
      Alert.alert("Verificación", "Completa el reCAPTCHA antes de continuar");
      recaptchaRef.current?.open();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Éxito", "Cuenta creada. Inicia sesión.");
      router.replace("(auth)/sign-in");
    }, 800);
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <View style={styles.decorativeBlob} />
      <View style={styles.decorativeAccent} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroContainer}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={24} color={theme.primary} />
              <Text style={styles.heroBadgeText}>Nuevo registro</Text>
            </View>
            <Text style={styles.heroTitle}>Crea tu cuenta</Text>
            <Text style={styles.heroSubtitle}>
              Diseñamos esta experiencia para que configurar tu acceso sea rápido y seguro.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Datos principales</Text>

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
                  placeholder="Mínimo 6 caracteres"
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
                <Text style={styles.captchaTitle}>Protección reCAPTCHA</Text>
                <Text style={styles.captchaSubtitle}>
                  {captchaToken
                    ? "Listo, confirmamos que no eres un robot"
                    : "Verifica tu identidad para finalizar el registro"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => recaptchaRef.current?.open()}
                style={[styles.captchaButton, captchaToken && styles.captchaButtonVerified]}
              >
                <Text style={styles.captchaButtonText}>
                  {captchaToken ? "Verificado" : "Verificar"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSignUp}
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
                    <Ionicons name="checkmark-circle" size={20} color={theme.white} />
                    <Text style={styles.submitText}>Crear cuenta</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
              <Text style={styles.loginText}>
                ¿Ya tienes una cuenta? {" "}
                <Text style={styles.loginTextHighlight}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <RecaptchaModal
        ref={recaptchaRef}
        siteKey={siteKey}
        siteDomain={domain}
        language={language}
        onVerify={handleRecaptchaVerify}
        onExpire={handleRecaptchaExpire}
        onError={handleRecaptchaError}
      />
    </LinearGradient>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    gradient: {
      flex: 1,
      position: "relative",
    },
    decorativeBlob: {
      position: "absolute",
      top: -120,
      left: -80,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: "rgba(255,255,255,0.18)",
    },
    decorativeAccent: {
      position: "absolute",
      right: -70,
      bottom: -90,
      width: 220,
      height: 220,
      borderRadius: 130,
      backgroundColor: "rgba(0,0,0,0.1)",
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 26,
      paddingVertical: 42,
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
      fontSize: responsiveFontSize(18),
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
    loginLink: {
      alignItems: "center",
    },
    loginText: {
      color: theme.textLight,
      fontSize: responsiveFontSize(13),
      marginTop: 8,
    },
    loginTextHighlight: {
      color: theme.primary,
      fontWeight: "700",
    },
  });

export default SignUpScreen;
