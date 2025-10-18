import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function RecipeCard({ recipe }) {
  const router = useRouter();

  // soporta datos “receta” o “autoparte”
  const price = recipe?.price ?? recipe?.cookTime ?? null;
  const brand = recipe?.brand ?? recipe?.area ?? null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      style={{ flex: 1, margin: 8 }}
    >
      {!!recipe.image && (
        <Image
          source={{ uri: recipe.image }}
          style={{ height: 150, borderRadius: 12, backgroundColor: "#eee" }}
          contentFit="cover"
        />
      )}
      <Text numberOfLines={2} style={{ marginTop: 8, fontWeight: "600", fontSize: 14 }}>
        {recipe.title}
      </Text>

      {/* resumen opcional de precio/marca */}
      {(price || brand) && (
        <Text numberOfLines={1} style={{ marginTop: 4, color: "#666", fontSize: 12 }}>
          {price ? `${price}` : ""}{price && brand ? " • " : ""}{brand || ""}
        </Text>
      )}
    </TouchableOpacity>
  );
}
