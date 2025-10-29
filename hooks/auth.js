import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { setApiAuthToken } from "../services/api";
import {
  changePassword as changePasswordRequest,
  signIn as signInRequest,
  signOut as signOutRequest,
  updateProfile as updateProfileRequest,
} from "../services/auth";
import { storage } from "../services/storage";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user }
  const [loading, setLoading] = useState(true);
  const token_strapi = 'b29b84da47aa04c04863c9ec9657880de85929c9f95ac1619893a195ae8e038c3a7fcbcf6eb90da30c2f3453bef68c50e8d1149f3cdb9a8f09382e5d6e883294f22a79f0e911802dba7f060f16f1848834e6fde808b10438ef2b591c389a83e299368b769d06dd381e4970bda1f4b5f5c038f9a2274e0ab3c14b82c928b833b4'

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [token, storedUser] = await Promise.all([
          storage.get("token"),
          storage.get("user"),
        ]);

        if (!isMounted) return;

        if (token_strapi && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setSession({ token_strapi, user: parsedUser });
          } catch {
            setSession({ token_strapi, user: null });
          } finally {
            setApiAuthToken(token_strapi);
          }
        } else if (token_strapi) {
          setSession({ token_strapi, user: null });
          setApiAuthToken(token_strapi);
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
    setApiAuthToken(token_strapi);
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
