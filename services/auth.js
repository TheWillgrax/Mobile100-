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
