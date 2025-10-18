import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import SafeScreen from "../../components/SafeScreen";
import { useAuth } from "../../hooks/auth";
import { useTheme } from "../../hooks/theme";
import { responsiveFontSize } from "../../utils/responsive";

export default function ProfileScreen() {
  const router = useRouter();
  const { session, updateProfile, changePassword, signOut } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const user = session?.user ?? {};

  const [fullName, setFullName] = useState(user.fullName || user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setFullName(user.fullName || user.name || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
  }, [user.fullName, user.name, user.phone, user.address]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: fullName || undefined,
        phone: phone || undefined,
        address: address || undefined,
      });
    } catch (error) {
      console.error("updateProfile", error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Contraseña", "Completa todos los campos de contraseña");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Contraseña", "La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Contraseña", "Las contraseñas nuevas no coinciden");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("changePassword", error);
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = user?.fullName || user?.name || user?.username || user?.email || "";
  const avatarLetters = initials
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetters || "U"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nameLabel}>{fullName || user.username || "Usuario"}</Text>
              <Text style={styles.emailLabel}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información personal</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={theme.textLight}
              value={fullName}
              onChangeText={setFullName}
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
              placeholder="Dirección"
              placeholderTextColor={theme.textLight}
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <TouchableOpacity
              style={[styles.primaryButton, savingProfile && styles.disabled]}
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color={theme.white} />
                  <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña actual"
              placeholderTextColor={theme.textLight}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              placeholderTextColor={theme.textLight}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar nueva contraseña"
              placeholderTextColor={theme.textLight}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.secondaryButton, savingPassword && styles.disabled]}
              onPress={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Text style={styles.secondaryButtonText}>Actualizar contraseña</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferencias</Text>
            <View style={styles.preferenceRow}>
              <View>
                <Text style={styles.preferenceTitle}>Modo oscuro</Text>
                <Text style={styles.preferenceSubtitle}>
                  Ajusta los colores para ambientes con poca luz
                </Text>
              </View>
              <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: theme.primary }} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await signOut();
              router.replace("/(auth)/sign-in");
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.white} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      gap: 20,
      paddingBottom: 40,
    },
    headerCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: theme.white,
      fontSize: responsiveFontSize(20),
      fontWeight: "700",
    },
    nameLabel: {
      fontSize: responsiveFontSize(18),
      fontWeight: "700",
      color: theme.text,
    },
    emailLabel: {
      fontSize: responsiveFontSize(13),
      color: theme.textLight,
      marginTop: 4,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: responsiveFontSize(16),
      fontWeight: "700",
      color: theme.text,
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
      minHeight: 90,
      textAlignVertical: "top",
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 999,
    },
    primaryButtonText: {
      color: theme.white,
      fontWeight: "700",
      fontSize: responsiveFontSize(14),
      textTransform: "uppercase",
    },
    secondaryButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    secondaryButtonText: {
      color: theme.primary,
      fontWeight: "700",
      fontSize: responsiveFontSize(14),
      textTransform: "uppercase",
    },
    preferenceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    preferenceTitle: {
      fontSize: responsiveFontSize(14),
      fontWeight: "600",
      color: theme.text,
    },
    preferenceSubtitle: {
      fontSize: responsiveFontSize(12),
      color: theme.textLight,
      marginTop: 4,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.danger,
      paddingVertical: 14,
      borderRadius: 999,
    },
    logoutText: {
      color: theme.white,
      fontWeight: "700",
      fontSize: responsiveFontSize(14),
      textTransform: "uppercase",
    },
    disabled: {
      opacity: 0.7,
    },
  });
