import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY = "favorites:v1";

export async function getFavorites() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function toggleFavorite(id) {
  const list = await getFavorites();
  const exists = list.includes(id);
  const next = exists ? list.filter((x) => x !== id) : [...list, id];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function isFavorite(id) {
  const list = await getFavorites();
  return list.includes(id);
}
