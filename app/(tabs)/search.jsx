import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

import { createSearchStyles } from "../../assets/styles/search.styles";
import LoadingSpinner from "../../components/LoadingSpinner";
import RecipeCard from "../../components/RecipeCard";
import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuth } from "../../hooks/auth";
import { MealAPI } from "../../services/mealAPI";

const SearchScreen = () => {
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();
  const { theme } = useTheme();
  const searchStyles = useMemo(() => createSearchStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const performSearch = async (query) => {
    if (!query.trim()) {
      const randomMeals = await MealAPI.getRandomMeals(12);
      return randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);
    }

    const nameResults = await MealAPI.searchMealsByName(query);
    let results = nameResults;

    if (results.length === 0) {
      const ingredientResults = await MealAPI.filterByIngredient(query);
      results = ingredientResults;
    }

    return results
      .slice(0, 12)
      .map((meal) => MealAPI.transformMealData(meal))
      .filter((meal) => meal !== null);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const results = await performSearch("");
        setRecipes(results);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialLoading) return;

    const handleSearch = async () => {
      setLoading(true);

      try {
        const results = await performSearch(debouncedSearchQuery);
        setRecipes(results);
      } catch (error) {
        console.error("Error searching:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [debouncedSearchQuery, initialLoading]);

  if (initialLoading) return <LoadingSpinner message="Cargando repuestos" />;

  return (
    <SafeScreen style={searchStyles.container}>
      <View style={searchStyles.searchSection}>
        <View style={searchStyles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.textLight}
            style={searchStyles.searchIcon}
          />
          <TextInput
            style={searchStyles.searchInput}
            placeholder="Buscar repuestos"
            placeholderTextColor={theme.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={searchStyles.clearButton}>
              <Ionicons name="close-circle" size={20} color={theme.textLight} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={async () => {
              if (isAuthenticated) {
                await signOut();
                router.replace("/(auth)/sign-in");
              } else {
                router.push("/(auth)/sign-in");
              }
            }}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: 10,
              marginRight: 5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name={isAuthenticated ? "log-out-outline" : "log-in-outline"}
              size={28}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={searchStyles.resultsSection}>
        <View style={searchStyles.resultsHeader}>
          <Text style={searchStyles.resultsTitle}>
            {searchQuery ? `Resultado de la búsqueda "${searchQuery}"` : "Repuestos Populares"}
          </Text>
          <Text style={searchStyles.resultsCount}>{recipes.length} encontrados</Text>
        </View>

        {loading ? (
          <View style={searchStyles.loadingContainer}>
            <LoadingSpinner message="Buscando repuestos" size="small" />
          </View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={searchStyles.row}
            contentContainerStyle={searchStyles.recipesGrid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<NoResultsFound theme={theme} searchStyles={searchStyles} />}
          />
        )}
      </View>
    </SafeScreen>
  );
};

export default SearchScreen;

function NoResultsFound({ theme, searchStyles }) {
  return (
    <View style={searchStyles.emptyState}>
      <Ionicons name="search-outline" size={64} color={theme.textLight} />
      <Text style={searchStyles.emptyTitle}>No se encontró ningún repuesto con ese nombre</Text>
      <Text style={searchStyles.emptyDescription}>
        Intenta ajustar tu búsqueda o usar diferentes palabras clave
      </Text>
    </View>
  );
}
