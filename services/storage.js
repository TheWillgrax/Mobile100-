// services/storage.js
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const storage = {
  get: async (key) => {
    try {
      if (Platform.OS === "web") return localStorage.getItem(key);
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  set: async (key, value) => {
    if (Platform.OS === "web") return localStorage.setItem(key, value);
    return await SecureStore.setItemAsync(key, value);
  },
  del: async (key) => {
    if (Platform.OS === "web") return localStorage.removeItem(key);
    return await SecureStore.deleteItemAsync(key);
  },
};
