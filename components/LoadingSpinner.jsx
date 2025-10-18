import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";

import { useTheme } from "../hooks/theme";
import { responsiveFontSize } from "../utils/responsive";

export default function LoadingSpinner({ message = "Cargando...", size = "large" }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      padding: 24,
    },
    text: {
      marginTop: 16,
      color: theme.textLight,
      fontSize: responsiveFontSize(14),
      textAlign: "center",
    },
  });
