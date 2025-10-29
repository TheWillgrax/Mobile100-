// services/api.js
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { storage } from "./storage";

const resolveExpoHost = () => {
  const hostUri =
    Constants?.expoConfig?.hostUri ??
    Constants?.manifest?.hostUri ??
    Constants?.manifest2?.extra?.expoClient?.hostUri ??
    null;

  if (!hostUri) return null;

  const host = hostUri.split(":")[0];
  return host ? `http://${host}:1337/api` : null;
};

const fallbackBaseURL = resolveExpoHost() ??
  (Platform.OS === "android" ? "http://10.0.2.2:1337/api" : "http://localhost:1337/api");

const expoConfigBaseURL =
  Constants?.expoConfig?.extra?.API_URL ??
  Constants?.easConfig?.extra?.API_URL ??
  Constants?.manifest?.extra?.API_URL ??
  Constants?.manifest2?.extra?.expoClient?.extra?.API_URL ??
  null;

const baseURL = process.env.EXPO_PUBLIC_API_URL || expoConfigBaseURL || fallbackBaseURL;

export const api = axios.create({
  baseURL,
  timeout: 10000,
});

export const setApiAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

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
