import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useMemo } from "react";

import { useTheme } from "../hooks/theme";
import { responsiveFontSize } from "../utils/responsive";

export default function RecipeCard({ recipe }) {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const price = recipe?.price ?? recipe?.cookTime ?? null;
  const brand = recipe?.brand ?? recipe?.area ?? null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      style={styles.card}
    >
      {!!recipe.image && (
        <Image
          source={{ uri: recipe.image }}
          style={styles.image}
          contentFit="cover"
        />
      )}
      <Text numberOfLines={2} style={styles.title}>
        {recipe.title}
      </Text>

      {(price || brand) && (
        <Text numberOfLines={1} style={styles.meta}>
          {price ? `${price}` : ""}
          {price && brand ? " • " : ""}
          {brand || ""}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      margin: 8,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    image: {
      height: 150,
      borderRadius: 12,
      backgroundColor: theme.surface,
    },
    title: {
      marginTop: 8,
      fontWeight: "600",
      fontSize: responsiveFontSize(14),
      color: theme.text,
    },
    meta: {
      marginTop: 4,
      color: theme.textLight,
      fontSize: responsiveFontSize(12),
    },
  });
