// services/api.js
import axios from "axios";
import { Platform } from "react-native";
import { storage } from "./storage";

const fallbackBaseURL =
  Platform.OS === "android"
    ? "http://192.168.68.55:1337/api" // emulador Android
    : "http://localhost:1337/api"; // web / iOS simulador

const authorizerToken =
  process.env.EXPO_PUBLIC_API_AUTHORIZER ??
  process.env.EXPO_PUBLIC_API_AUTHORIZER_TOKEN ??
  "b29b84da47aa04c04863c9ec9657880de85929c9f95ac1619893a195ae8e038c3a7fcbcf6eb90da30c2f3453bef68c50e8d1149f3cdb9a8f09382e5d6e883294f22a79f0e911802dba7f060f16f1848834e6fde808b10438ef2b591c389a83e299368b769d06dd381e4970bda1f4b5f5c038f9a2274e0ab3c14b82c928b833b4";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || fallbackBaseURL,
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

    if (authorizerToken) {
      config.headers = config.headers ?? {};
      if (!config.headers.Authorizer) {
        config.headers.Authorizer = authorizerToken;
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
