import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import LoadingSpinner from "../../components/LoadingSpinner";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import RecipeCard from "../../components/RecipeCard";
import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { responsiveFontSize } from "../../utils/responsive";
import { MealAPI } from "../../services/mealAPI";

const STORAGE_KEY = "favorites:v1";

export default function FavoritesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

  if (loading) return <LoadingSpinner message="Cargando tus favoritos..." />;

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Favoritos</Text>
        <Ionicons name="heart" size={26} color={theme.white} />
      </View>

      <FlatList
        data={favoriteRecipes}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<NoFavoritesFound onExplorePress={() => router.push("/(tabs)/search")} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      />
    </SafeScreen>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 15,
      backgroundColor: theme.primary,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      shadowColor: theme.shadow,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 4,
      elevation: 5,
    },
    title: {
      fontSize: responsiveFontSize(20),
      fontWeight: "bold",
      color: theme.white,
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
