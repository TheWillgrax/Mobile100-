import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import LoadingSpinner from "../../components/LoadingSpinner";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import RecipeCard from "../../components/RecipeCard";
import { COLORS } from "../../constants/colors";
import { MealAPI } from "../../services/mealAPI";

const STORAGE_KEY = "favorites:v1";

export default function FavoritesScreen() {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const ids = stored ? JSON.parse(stored) : [];

      const recipes = await Promise.all(
        ids.map(async (id) => {
          const raw = await MealAPI.getMealById(id);
          return MealAPI.transformMealData(raw);
        })
      );

      setFavoriteRecipes(recipes.filter(Boolean));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  if (loading)
    return <LoadingSpinner message="Cargando tus favoritos..." />;

  return (
    <View style={styles.container}>
      {/* Header simple pero llamativo */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Favoritos</Text>
        <Ionicons name="heart" size={26} color={COLORS.white} />
      </View>

      {/* Lista de recetas */}
      <FlatList
        data={favoriteRecipes}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<NoFavoritesFound />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  listContent: {
    padding: 10,
    paddingBottom: 50,
  },
});
