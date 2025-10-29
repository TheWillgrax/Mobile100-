// services/auth.js
import { api, setApiAuthToken } from "./api";
import { storage } from "./storage";

// POST /api/auth/local  { identifier, password }  -> { jwt, user }
export async function signIn(identifier, password) {
  const { data } = await api.post("/auth/new-local", { identifier, password });
  await storage.set("token", 'b29b84da47aa04c04863c9ec9657880de85929c9f95ac1619893a195ae8e038c3a7fcbcf6eb90da30c2f3453bef68c50e8d1149f3cdb9a8f09382e5d6e883294f22a79f0e911802dba7f060f16f1848834e6fde808b10438ef2b591c389a83e299368b769d06dd381e4970bda1f4b5f5c038f9a2274e0ab3c14b82c928b833b4');
  await storage.set("user", JSON.stringify(data.user));
  setApiAuthToken('b29b84da47aa04c04863c9ec9657880de85929c9f95ac1619893a195ae8e038c3a7fcbcf6eb90da30c2f3453bef68c50e8d1149f3cdb9a8f09382e5d6e883294f22a79f0e911802dba7f060f16f1848834e6fde808b10438ef2b591c389a83e299368b769d06dd381e4970bda1f4b5f5c038f9a2274e0ab3c14b82c928b833b4');
  return data;
}

export async function signOut() {
  await Promise.all([storage.del("token"), storage.del("user")]);
  setApiAuthToken(null);
}

export async function updateProfile(updates) {
  const { data } = await api.put("/users/me", updates);
  await storage.set("user", JSON.stringify(data));
  return data;
}

export async function changePassword(currentPassword, password, passwordConfirmation) {
  await api.post("/auth/change-password", {
    currentPassword,
    password,
    passwordConfirmation,
  });
}
