import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../../hooks/auth";

const COLORS = {
  primary: "#0d6efd",   // azul bootstrap
  secondary: "#6610f2", // morado acento
  background: "#f8f9fa",
  text: "#212529",
  textLight: "#6c757d",
};

const SignInScreen = () => {
  const router = useRouter();
  const { signIn: authenticate } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptchaQuestion(`¿Cuánto es ${a} + ${b}?`);
    setCaptchaAnswer(String(a + b));
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos requeridos", "Por favor completa email y contraseña");
      return;
    }
    if (!captchaInput.trim()) {
      Alert.alert("Verificación", "Resuelve el captcha para continuar");
      return;
    }
    if (captchaInput.trim() !== captchaAnswer) {
      Alert.alert("Captcha incorrecto", "Inténtalo nuevamente");
      generateCaptcha();
      return;
    }
    try {
      setLoading(true);
      await authenticate(email, password); // email va en "identifier"
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("No pudimos iniciar sesión", e.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + título */}
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <Ionicons name="car-sport" size={100} color="#fff" />
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: "#fff",
                marginTop: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              AutoParts
            </Text>
            <Text style={{ color: "#E9ECEF", marginTop: 6, fontSize: 16 }}>
              Ingresa a tu cuenta
            </Text>
          </View>

          {/* Card del formulario */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            {/* Email */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#dee2e6",
                borderRadius: 10,
                marginBottom: 18,
                paddingHorizontal: 12,
                backgroundColor: COLORS.background,
              }}
            >
              <Ionicons name="mail" size={24} color={COLORS.primary} />
              <TextInput
                style={{
                  flex: 1,
                  padding: 12,
                  marginLeft: 10,
                  color: COLORS.text,
                  fontSize: 15,
                }}
                placeholder="Correo electrónico"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#dee2e6",
                borderRadius: 10,
                marginBottom: 18,
                paddingHorizontal: 12,
                backgroundColor: COLORS.background,
              }}
            >
              <Ionicons name="lock-closed" size={24} color={COLORS.primary} />
              <TextInput
                style={{
                  flex: 1,
                  padding: 12,
                  marginLeft: 10,
                  color: COLORS.text,
                  fontSize: 15,
                }}
                placeholder="Contraseña"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* Captcha */}
            <View
              style={{
                borderWidth: 2,
                borderColor: "#dee2e6",
                borderRadius: 10,
                marginBottom: 18,
                padding: 12,
                backgroundColor: COLORS.background,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: COLORS.text,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {captchaQuestion}
                </Text>
                <TouchableOpacity onPress={generateCaptcha}>
                  <Ionicons name="refresh" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    paddingVertical: 8,
                    color: COLORS.text,
                    fontSize: 15,
                  }}
                  placeholder="Escribe el resultado"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="number-pad"
                  value={captchaInput}
                  onChangeText={setCaptchaInput}
                />
              </View>
            </View>

            {/* Botón login estilo Bootstrap */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 10,
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.secondary, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Iniciar sesión
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Link registro */}
            <TouchableOpacity
              style={{ marginTop: 14, alignItems: "center" }}
              onPress={() => router.push("/(auth)/sign-up")}
            >
              <Text style={{ color: COLORS.text }}>
                ¿No tienes una cuenta?{" "}
                <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                  Regístrate
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SignInScreen;
