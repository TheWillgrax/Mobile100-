// services/auth.js
import { api } from "./api";
import { storage } from "./storage";

// POST /api/auth/local  { identifier, password }  -> { jwt, user }
export async function signIn(identifier, password) {
  const { data } = await api.post("/auth/new-local", { identifier, password });
  await storage.set("token", data.jwt);
  await storage.set("user", JSON.stringify(data.user));
  return data;
}

export async function signOut() {
  await Promise.all([storage.del("token"), storage.del("user")]);
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
