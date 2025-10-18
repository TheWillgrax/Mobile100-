import data from "../assets/data/recipes.json";

export const MealAPI = {
  async getCategories() {
    const set = new Set(data.map((d) => d.category));
    return Array.from(set).map((name) => ({
      strCategory: name,
      strCategoryThumb:
        "https://picsum.photos/seed/" + encodeURIComponent(name) + "/300/200",
      strCategoryDescription: `${name} dishes`,
    }));
  },

  async getRandomMeals(n = 12) {
    const arr = [...data];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, n).map(MealAPI._toMealDBLike);
  },

  async getRandomMeal() {
    const item = data[Math.floor(Math.random() * data.length)];
    return MealAPI._toMealDBLike(item);
  },

  async filterByCategory(category) {
    return data
      .filter((d) => d.category === category)
      .map(MealAPI._toMealDBLike);
  },

  async getMealById(id) {
    const hit = data.find((d) => String(d.id) === String(id));
    return hit ? MealAPI._toMealDBLike(hit) : null;
  },

  async searchMealsByName(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return data
      .filter((d) => (d.title || '').toLowerCase().includes(q))
      .map(MealAPI._toMealDBLike);
  },

  async filterByIngredient(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return data
      .filter(
        (d) =>
          Array.isArray(d.ingredients) &&
          d.ingredients.some((ing) => (ing || '').toLowerCase().includes(q))
      )
      .map(MealAPI._toMealDBLike);
  },

  transformMealData(meal) {
    if (!meal) return null;
    return {
      id: meal.idMeal ?? meal.id,
      title: meal.strMeal ?? meal.title,
      image: meal.strMealThumb ?? meal.image,
      cookTime: meal.cookTime ?? "20 min",
      servings: meal.servings ?? "2",
      area: meal.strArea ?? meal.area ?? null,
      ingredients: meal.ingredients ?? meal._ingredients ?? [],
      instructions: meal.instructions ?? meal._instructions ?? [],
    };
  },

  _toMealDBLike(item) {
    return {
      idMeal: item.id,
      strMeal: item.title,
      strMealThumb: item.image,
      strArea: item.area,
      _ingredients: item.ingredients,
      _instructions: item.instructions,
      cookTime: item.cookTime,
      servings: item.servings,
    };
  },
};

export default MealAPI;
