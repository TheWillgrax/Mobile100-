// services/api.js
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { storage } from "./storage";

const extractHostname = (uri) => {
  if (!uri) return null;

  try {
    const parsed = new URL(uri.includes("://") ? uri : `http://${uri}`);
    return parsed.hostname || null;
  } catch (error) {
    // Fallback para valores inesperados como "exp://192.168.x.x:8081"
    const sanitized = uri.replace(/^\w+:\/\//, "");
    return sanitized.split(":")[0] ?? null;
  }
};

const resolveExpoHost = () => {
  const hostUri =
    Constants?.expoConfig?.hostUri ??
    Constants?.manifest?.hostUri ??
    Constants?.manifest2?.extra?.expoClient?.hostUri ??
    null;

  const hostname = extractHostname(hostUri);
  return hostname ? `http://${hostname}:1337/api` : null;
};

const fallbackBaseURL = resolveExpoHost() ??
  (Platform.OS === "android" ? "http://10.0.2.2:1337/api" : "http://localhost:1337/api");

const expoConfigBaseURL =
  Constants?.expoConfig?.extra?.API_URL ??
  Constants?.easConfig?.extra?.API_URL ??
  Constants?.manifest?.extra?.API_URL ??
  Constants?.manifest2?.extra?.expoClient?.extra?.API_URL ??
  null;

const expoConfigToken =
  Constants?.expoConfig?.extra?.API_TOKEN ??
  Constants?.easConfig?.extra?.API_TOKEN ??
  Constants?.manifest?.extra?.API_TOKEN ??
  Constants?.manifest2?.extra?.expoClient?.extra?.API_TOKEN ??
  null;

const baseURL = process.env.EXPO_PUBLIC_API_URL || expoConfigBaseURL || fallbackBaseURL;
const defaultToken = 'b29b84da47aa04c04863c9ec9657880de85929c9f95ac1619893a195ae8e038c3a7fcbcf6eb90da30c2f3453bef68c50e8d1149f3cdb9a8f09382e5d6e883294f22a79f0e911802dba7f060f16f1848834e6fde808b10438ef2b591c389a83e299368b769d06dd381e4970bda1f4b5f5c038f9a2274e0ab3c14b82c928b833b4';

export const api = axios.create({
  baseURL,
  timeout: 10000,
});

if (defaultToken) {
  api.defaults.headers.common.Authorization = `Bearer ${defaultToken}`;
}

console.log('Token:' + defaultToken);

export const setApiAuthToken = (token) => {
  console.log('Token SET:' + token);
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.request.use(async (config = {}) => {
  try {
    const token = await storage.get("token");
    console.log('Token RE:' + token);
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
