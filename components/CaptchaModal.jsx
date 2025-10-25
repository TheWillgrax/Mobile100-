import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from "react";
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useTheme } from "../hooks/theme";
import { CAPTCHA_CONFIG } from "../utils/config";

const DEFAULT_CHARACTER_SET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const createChallenge = (length, charset) => {
  const characters = typeof charset === "string" && charset.trim().length > 3 ? charset : DEFAULT_CHARACTER_SET;
  const safeLength = Number.isFinite(length) && length >= 4 && length <= 12 ? Math.floor(length) : 6;

  let code = "";
  for (let index = 0; index < safeLength; index += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return {
    code,
    displayedCode: code.split("").join(" "),
  };
};

const CaptchaModal = forwardRef(({ onVerify, onCancel }, ref) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { length, charset } = CAPTCHA_CONFIG;
  const [visible, setVisible] = useState(false);
  const [challenge, setChallenge] = useState(() => createChallenge(length, charset));
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const resetChallenge = useCallback(() => {
    setChallenge(createChallenge(length, charset));
    setInputValue("");
    setError("");
  }, [charset, length]);

  const open = useCallback(() => {
    resetChallenge();
    setVisible(true);
  }, [resetChallenge]);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setInputValue("");
      setError("");
    }, 150);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [close, open]
  );

  const handleRefresh = useCallback(() => {
    resetChallenge();
  }, [resetChallenge]);

  const handleCancel = useCallback(() => {
    close();
    onCancel?.();
  }, [close, onCancel]);

  const handleSubmit = useCallback(() => {
    const normalizedInput = inputValue.trim().toUpperCase();

    if (!normalizedInput) {
      setError("Ingresa el código mostrado para continuar");
      return;
    }

    if (normalizedInput !== challenge.code) {
      setError("El código no coincide. Generamos uno nuevo para que lo intentes de nuevo.");
      resetChallenge();
      return;
    }

    const token = `${challenge.code}-${Date.now()}`;
    close();
    onVerify?.(token);
    Alert.alert("Verificación completada", "CAPTCHA resuelto correctamente");
  }, [challenge.code, close, inputValue, onVerify, resetChallenge]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Verificación de seguridad</Text>
          <Text style={styles.subtitle}>
            Ingresa el código que aparece a continuación para confirmar que eres una persona real.
          </Text>

          <View style={styles.captchaBox}>
            <Text style={styles.captchaText}>{challenge.displayedCode}</Text>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshText}>Generar otro código</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Escribe el código"
            placeholderTextColor={theme.textLight}
            value={inputValue}
            onChangeText={(value) => {
              setInputValue(value);
              if (error) {
                setError("");
              }
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={[styles.buttonText, styles.cancelText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

CaptchaModal.displayName = "CaptchaModal";

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    card: {
      width: "100%",
      maxWidth: 380,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: theme.textLight,
      textAlign: "center",
    },
    captchaBox: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingVertical: 18,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    captchaText: {
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: 8,
      color: theme.primary,
    },
    refreshButton: {
      alignSelf: "center",
    },
    refreshText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.background,
      textAlign: "center",
      letterSpacing: 4,
    },
    errorText: {
      color: theme.error,
      fontSize: 13,
      textAlign: "center",
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButton: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    confirmButton: {
      backgroundColor: theme.primary,
    },
    buttonText: {
      color: theme.white,
      fontWeight: "700",
      fontSize: 16,
    },
    cancelText: {
      color: theme.text,
    },
  });

export default CaptchaModal;
