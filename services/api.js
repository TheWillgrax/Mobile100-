// services/api.js
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { storage } from "./storage";

const fallbackBaseURL =
  Platform.OS === "android"
    ? "http://192.168.68.55:1337/api"   // emulador Android
    : "http://localhost:1337/api"; // web / iOS simulador

const expoConfigBaseURL =
  Constants?.expoConfig?.extra?.API_URL ??
  Constants?.easConfig?.extra?.API_URL ??
  Constants?.manifest?.extra?.API_URL ??
  Constants?.manifest2?.extra?.expoClient?.extra?.API_URL ??
  null;

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || expoConfigBaseURL || fallbackBaseURL,
  timeout: 10000,
});

api.interceptors.request.use(async (config = {}) => {
  try {
    const token = await storage.get("token");
    if (token) {
      config.headers = config.headers ?? {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normaliza mensaje de Strapi
    err.friendlyMessage =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err.message ||
      "Error de red.";
    return Promise.reject(err);
  }
);
