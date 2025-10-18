// app/(tabs)/index.jsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { createHomeStyles } from "../../assets/styles/home.styles";
import CategoryFilter from "../../components/CategoryFilter";
import LoadingSpinner from "../../components/LoadingSpinner";
import RecipeCard from "../../components/RecipeCard";
import SafeScreen from "../../components/SafeScreen";
import { useTheme } from "../../hooks/theme";
import { useAuth } from "../../hooks/auth";
import { MealAPI } from "../../services/mealAPI";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HomeScreen = () => {
  const router = useRouter();
  const { session, signOut, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const homeStyles = useMemo(() => createHomeStyles(theme), [theme]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredRecipe, setFeaturedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [apiCategories, randomMeals, featuredMeal] = await Promise.all([
        MealAPI.getCategories(),
        MealAPI.getRandomMeals(12),
        MealAPI.getRandomMeal(),
      ]);

      const transformedCategories = apiCategories.map((cat, index) => ({
        id: index + 1,
        name: cat.strCategory,
        image: cat.strCategoryThumb,
        description: cat.strCategoryDescription,
      }));

      setCategories(transformedCategories);

      if (!selectedCategory && transformedCategories.length > 0) {
        setSelectedCategory(transformedCategories[0].name);
      }

      const transformedMeals = randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);

      setRecipes(transformedMeals);

      const transformedFeatured = MealAPI.transformMealData(featuredMeal);
      setFeaturedRecipe(transformedFeatured);
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const loadCategoryData = useCallback(async (category) => {
    try {
      const meals = await MealAPI.filterByCategory(category);
      const transformedMeals = meals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);
      setRecipes(transformedMeals);
    } catch (error) {
      console.error("Error loading category data:", error);
      setRecipes([]);
    }
  }, []);

  const handleCategorySelect = useCallback(
    async (category) => {
      setSelectedCategory(category);
      await loadCategoryData(category);
    },
    [loadCategoryData]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await sleep(400);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayName = useMemo(() => {
    if (!session?.user) return "Usuario";

    return (
      session.user.name ||
      session.user.username ||
      session.user.fullName ||
      session.user.email ||
      "Usuario"
    );
  }, [session]);

  const handleAuthPress = async () => {
    if (isAuthenticated) {
      await signOut();
      router.replace("/(auth)/sign-in");
    } else {
      router.push("/(auth)/sign-in");
    }
  };

  if (loading && !refreshing) return <LoadingSpinner message="Cargando autopartes..." />;

  return (
    <SafeScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={homeStyles.scrollContent}
      >
        <View style={homeStyles.welcomeSection}>
          <View style={homeStyles.welcomeTextContainer}>
            <Text style={homeStyles.welcomeText}>
              {isAuthenticated ? `Hola, ${displayName}` : "Bienvenido"}
            </Text>
            <Text style={homeStyles.welcomeSubtitle}>
              {isAuthenticated
                ? "¡Nos alegra verte de nuevo!"
                : "Estás explorando como invitado"}
            </Text>
          </View>

          <TouchableOpacity onPress={handleAuthPress} style={homeStyles.signInButton}>
            <Ionicons
              name={isAuthenticated ? "log-out-outline" : "log-in-outline"}
              size={20}
              color={theme.white}
            />
            <Text style={homeStyles.signInButtonText}>
              {isAuthenticated ? "Cerrar sesión" : "Iniciar sesión"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={homeStyles.welcomeIcons}>
          <Ionicons name="car-outline" size={80} color={theme.textLight} />
          <Ionicons name="construct-outline" size={80} color={theme.textLight} />
          <Ionicons name="settings-outline" size={80} color={theme.textLight} />
        </View>

        {featuredRecipe && (
          <View style={homeStyles.featuredSection}>
            <TouchableOpacity
              style={homeStyles.featuredCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/recipe/${featuredRecipe.id}`)}
            >
              <View style={homeStyles.featuredImageContainer}>
                <Image
                  source={{ uri: featuredRecipe.image }}
                  style={homeStyles.featuredImage}
                  contentFit="cover"
                  transition={500}
                />
                <View style={homeStyles.featuredOverlay}>
                  <View style={homeStyles.featuredBadge}>
                    <Text style={homeStyles.featuredBadgeText}>Destacado</Text>
                  </View>

                  <View style={homeStyles.featuredContent}>
                    <Text style={homeStyles.featuredTitle} numberOfLines={2}>
                      {featuredRecipe.title}
                    </Text>

                    <View style={homeStyles.featuredMeta}>
                      <View style={homeStyles.metaItem}>
                        <Ionicons name="time-outline" size={16} color={theme.white} />
                        <Text style={homeStyles.metaText}>{featuredRecipe.cookTime}</Text>
                      </View>
                      <View style={homeStyles.metaItem}>
                        <Ionicons name="people-outline" size={16} color={theme.white} />
                        <Text style={homeStyles.metaText}>{featuredRecipe.servings}</Text>
                      </View>
                      {featuredRecipe.area && (
                        <View style={homeStyles.metaItem}>
                          <Ionicons name="location-outline" size={16} color={theme.white} />
                          <Text style={homeStyles.metaText}>{featuredRecipe.area}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={homeStyles.recipesSection}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>Explora por categoría</Text>
          </View>

          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              styles={homeStyles}
            />
          )}
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>Recomendados para ti</Text>
          </View>

          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            columnWrapperStyle={homeStyles.row}
            ListEmptyComponent={() => (
              <View style={homeStyles.emptyState}>
                <Ionicons name="restaurant-outline" size={64} color={theme.textLight} />
                <Text style={homeStyles.emptyTitle}>Sin resultados</Text>
                <Text style={homeStyles.emptyDescription}>
                  Intenta refrescar la página o seleccionar otra categoría.
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default HomeScreen;
