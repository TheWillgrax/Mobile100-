import Constants from "expo-constants";

const extras =
  (Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? Constants?.manifest2?.extra) || {};

export const getConfigValue = (key, fallback = undefined) => {
  const value = extras?.[key];
  return value !== undefined && value !== null && value !== "" ? value : fallback;
};

const parseLength = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 4), 12);
};

export const CAPTCHA_CONFIG = {
  length: parseLength(getConfigValue("captchaLength", 6), 6),
  charset: getConfigValue("captchaCharset", "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"),
};

