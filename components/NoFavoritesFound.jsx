import { favoritesStyles } from "@/assets/styles/favorites.styles";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

function NoFavoritesFound() {
  const router = useRouter();

  return (
    <View style={favoritesStyles.emptyState}>
      <View style={favoritesStyles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color={COLORS.textLight} />
      </View>
      <Text style={favoritesStyles.emptyTitle}>No hay favoritos</Text>
      <TouchableOpacity style={favoritesStyles.exploreButton} onPress={() => router.push("/")}>
        <Ionicons name="search" size={18} color={COLORS.white} />
        <Text style={favoritesStyles.exploreButtonText}>Explorar Repuestos</Text>
      </TouchableOpacity>
    </View>
  );
}

export default NoFavoritesFound;
