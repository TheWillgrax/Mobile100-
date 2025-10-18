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

const SignUpScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

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

  const gradientColors = [theme.primary, theme.secondary ?? theme.primary];

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="car-sport" size={100} color={theme.white} />
            <Text style={styles.logoTitle}>AutoParts</Text>
            <Text style={styles.logoSubtitle}>Crea tu cuenta fácilmente</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputRow}>
              <Ionicons name="mail" size={24} color={theme.primary} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={theme.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputRow}>
              <Ionicons name="lock-closed" size={24} color={theme.primary} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
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

            <View style={styles.captchaCard}>
              <View style={styles.captchaTextContainer}>
                <Text style={styles.captchaTitle}>Protección reCAPTCHA</Text>
                <Text style={styles.captchaSubtitle}>
                  {captchaToken
                    ? "Verificación completada"
                    : "Pulsa el botón para validar que no eres un robot"}
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
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color={theme.white} />
                ) : (
                  <Text style={styles.submitText}>Crear cuenta</Text>
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
        onVerify={handleRecaptchaVerify}
        onExpire={handleRecaptchaExpire}
        onError={() =>
          Alert.alert("Error", "No pudimos cargar el reCAPTCHA. Por favor, inténtalo de nuevo")
        }
      />
    </LinearGradient>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    gradient: {
      flex: 1,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 20,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 30,
    },
    logoTitle: {
      fontSize: responsiveFontSize(30),
      fontWeight: "900",
      color: theme.white,
      marginTop: 12,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    logoSubtitle: {
      color: "#E9ECEF",
      marginTop: 6,
      fontSize: responsiveFontSize(15),
    },
    formCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 24,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
      gap: 18,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      backgroundColor: theme.surface,
      gap: 10,
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      color: theme.text,
      fontSize: responsiveFontSize(14),
    },
    captchaCard: {
      borderWidth: 2,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 16,
      backgroundColor: theme.surface,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    captchaTextContainer: {
      flex: 1,
      marginRight: 12,
      gap: 6,
    },
    captchaTitle: {
      color: theme.text,
      fontWeight: "600",
      fontSize: responsiveFontSize(13),
    },
    captchaSubtitle: {
      color: theme.textLight,
      fontSize: responsiveFontSize(12),
    },
    captchaButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
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
    },
    submitButton: {
      borderRadius: 10,
      overflow: "hidden",
    },
    submitGradient: {
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    submitText: {
      color: theme.white,
      fontSize: responsiveFontSize(16),
      fontWeight: "700",
      textTransform: "uppercase",
    },
    loginLink: {
      marginTop: 14,
      alignItems: "center",
    },
    loginText: {
      color: theme.text,
      fontSize: responsiveFontSize(13),
    },
    loginTextHighlight: {
      color: theme.primary,
      fontWeight: "700",
    },
  });

export default SignUpScreen;
