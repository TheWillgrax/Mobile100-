import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signIn as signInRequest, signOut as signOutRequest } from "../services/auth";
import { storage } from "../services/storage";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [token, storedUser] = await Promise.all([
          storage.get("token"),
          storage.get("user"),
        ]);

        if (!isMounted) return;

        if (token && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setSession({ token, user: parsedUser });
          } catch {
            setSession({ token, user: null });
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (identifier, password) => {
    const { jwt, user } = await signInRequest(identifier, password);
    setSession({ token: jwt, user });
  };

  const signOut = async () => {
    await signOutRequest();
    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      loading,
      signIn,
      signOut,
      isAuthenticated: Boolean(session?.token),
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
