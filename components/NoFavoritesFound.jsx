import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMemo } from "react";

import { useTheme } from "@/hooks/theme";
import { responsiveFontSize } from "@/utils/responsive";

export default function NoFavoritesFound({ onExplorePress }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Ionicons name="heart-outline" size={80} color={theme.textLight} />
      <Text style={styles.title}>Aún no tienes favoritos</Text>
      <Text style={styles.subtitle}>
        Explora nuestras autopartes destacadas y guarda las que más te gusten.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onExplorePress}>
        <Ionicons name="search" size={18} color={theme.white} />
        <Text style={styles.buttonText}>Descubrir productos</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      paddingHorizontal: 24,
    },
    title: {
      marginTop: 16,
      fontSize: responsiveFontSize(18),
      fontWeight: "700",
      color: theme.text,
    },
    subtitle: {
      marginTop: 8,
      color: theme.textLight,
      fontSize: responsiveFontSize(14),
      textAlign: "center",
      lineHeight: responsiveFontSize(20),
      maxWidth: 320,
    },
    button: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
    },
    buttonText: {
      color: theme.white,
      fontWeight: "700",
      fontSize: responsiveFontSize(14),
    },
  });
