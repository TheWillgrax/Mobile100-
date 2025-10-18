import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("token");
      const userStr = await SecureStore.getItemAsync("user");
      if (token && userStr) setSession({ token, user: JSON.parse(userStr) });
      setLoading(false);
    })();
  }, []);

  const signIn = async (identifier, password) => {
    // Tu endpoint custom de Strapi:
    const { data } = await api.post("/auth/new-local", { identifier, password });
    // Si usas el estándar de Strapi, cambia a: /auth/local
    const { jwt, user } = data;
    await SecureStore.setItemAsync("token", jwt);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    setSession({ token: jwt, user });
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
