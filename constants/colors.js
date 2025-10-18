const lightTheme = {
  primary: "#FF220C",
  secondary: "#D33E43",
  background: "#EFF9F0",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  text: "#1C1F33",
  textLight: "#666370",
  border: "#E6E9EC",
  shadow: "#000000",
  white: "#FFFFFF",
  success: "#2BA84A",
  danger: "#D90429",
};

const darkTheme = {
  primary: "#FF6B6B",
  secondary: "#EF476F",
  background: "#121417",
  surface: "#1F2329",
  card: "#1F2329",
  text: "#F1F5F9",
  textLight: "#94A3B8",
  border: "#2C3139",
  shadow: "#000000",
  white: "#FFFFFF",
  success: "#06D6A0",
  danger: "#FF6B6B",
};

export const THEMES = {
  light: lightTheme,
  dark: darkTheme,
};

export const DEFAULT_SCHEME = "light";
export const COLORS = THEMES[DEFAULT_SCHEME];
