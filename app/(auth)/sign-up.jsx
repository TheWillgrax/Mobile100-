import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
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
import RecaptchaModal from "../../components/RecaptchaModal";

const COLORS = {
  primary: "#0d6efd",   // estilo bootstrap primary
  secondary: "#6610f2", // morado acento
  background: "#f8f9fa",
  text: "#212529",
  textLight: "#6c757d",
};

const SignUpScreen = () => {
  const router = useRouter();
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
    Alert.alert(
      "Verificación requerida",
      "El reCAPTCHA ha expirado, inténtalo nuevamente"
    );
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
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
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
          {/* Logo y título */}
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
              Crea tu cuenta fácilmente
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
              <Ionicons
                name="mail"
                size={24}
                color={COLORS.primary}
              />
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
              <Ionicons
                name="lock-closed"
                size={24}
                color={COLORS.primary}
              />
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
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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
                padding: 16,
                backgroundColor: COLORS.background,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontWeight: "600",
                      fontSize: 14,
                      marginBottom: 6,
                    }}
                  >
                    Protección reCAPTCHA
                  </Text>
                  <Text style={{ color: COLORS.textLight, fontSize: 13 }}>
                    {captchaToken
                      ? "Verificación completada"
                      : "Pulsa el botón para validar que no eres un robot"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => recaptchaRef.current?.open()}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: captchaToken ? "#198754" : COLORS.primary,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: 13,
                      textTransform: "uppercase",
                    }}
                  >
                    {captchaToken ? "Verificado" : "Verificar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón registro estilo Bootstrap */}
            <TouchableOpacity
              onPress={handleSignUp}
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
                    Crear cuenta
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Link login */}
            <TouchableOpacity
              style={{ marginTop: 14, alignItems: "center" }}
              onPress={() => router.back()}
            >
              <Text style={{ color: COLORS.text }}>
                ¿Ya tienes una cuenta?{" "}
                <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                  Inicia sesión
                </Text>
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
          Alert.alert(
            "Error",
            "No pudimos cargar el reCAPTCHA. Por favor, inténtalo de nuevo"
          )
        }
      />
    </LinearGradient>
  );
};

export default SignUpScreen;
