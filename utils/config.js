import Constants from "expo-constants";

const extras =
  (Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? Constants?.manifest2?.extra) || {};

export const getConfigValue = (key, fallback = undefined) => {
  const value = extras?.[key];
  return value !== undefined && value !== null && value !== "" ? value : fallback;
};

export const RECAPTCHA_CONFIG = {
  siteKey: getConfigValue("recaptchaSiteKey", "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"),
  domain: getConfigValue("recaptchaDomain", "https://autoparts-app.mobile"),
  language: getConfigValue("recaptchaLanguage", "es"),
};

