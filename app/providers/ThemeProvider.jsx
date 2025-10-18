import { Appearance } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_SCHEME, THEMES } from "../../constants/colors";
import { storage } from "../../services/storage";
import { ThemeContext } from "../../hooks/theme";

const STORAGE_KEY = "theme-scheme";

export function ThemeProvider({ children }) {
  const [scheme, setScheme] = useState(DEFAULT_SCHEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const storedScheme = await storage.get(STORAGE_KEY);
        if (storedScheme === "light" || storedScheme === "dark") {
          if (isMounted) setScheme(storedScheme);
          return;
        }

        const systemScheme = Appearance.getColorScheme();
        if (isMounted && (systemScheme === "light" || systemScheme === "dark")) {
          setScheme(systemScheme);
        }
      } finally {
        if (isMounted) setHydrated(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storage.set(STORAGE_KEY, scheme).catch(() => {});
  }, [scheme, hydrated]);

  const toggleTheme = useCallback(() => {
    setScheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => {
    const theme = scheme === "dark" ? THEMES.dark : THEMES.light;

    return {
      theme,
      scheme,
      isDark: scheme === "dark",
      toggleTheme,
      setScheme,
      hydrated,
    };
  }, [scheme, toggleTheme, hydrated]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
