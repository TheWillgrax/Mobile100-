import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

import {
  changePassword as changePasswordRequest,
  signIn as signInRequest,
  signOut as signOutRequest,
  updateProfile as updateProfileRequest,
} from "../services/auth";
import { setApiAuthToken } from "../services/api";
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
          } finally {
            setApiAuthToken(token);
          }
        } else if (token) {
          setSession({ token, user: null });
          setApiAuthToken(token);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (identifier, password) => {
    const { jwt, user } = await signInRequest(identifier, password);
    setSession({ token: jwt, user });
    setApiAuthToken(jwt);
  }, []);

  const signOut = useCallback(async () => {
    await signOutRequest();
    setSession(null);
    setApiAuthToken(null);
  }, []);

  const updateProfile = useCallback(async (updates = {}) => {
    const user = await updateProfileRequest(updates);
    setSession((current) => (current ? { ...current, user } : current));
  }, []);

  const changePassword = useCallback(async (currentPassword, password, passwordConfirmation) => {
    await changePasswordRequest(currentPassword, password, passwordConfirmation);
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      signIn,
      signOut,
      updateProfile,
      changePassword,
      isAuthenticated: Boolean(session?.token),
    }),
    [changePassword, loading, session, signIn, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
