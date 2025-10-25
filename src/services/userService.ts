// src/services/userService.ts
import { supabase } from "./supabaseClient";
import type { Profile, ProfileInsert, ProfileUpdate } from "@/types/supabase";

const TABLE = "profiles" as const;

// 📥 Obtener todos los usuarios (opcional, para vistas públicas)
export async function fetchUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, username, email, cp, ciudad, lat, lng, avatar_url, created_at")
    .order("username", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// 📄 Obtener perfil por ID
export async function fetchUserById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, created_at, username, email, cp, ciudad, lat, lng, avatar_url")
    .eq("id", id)
    .maybeSingle(); // devuelve null si no existe
  if (error) throw new Error(error.message);
  return data ?? null;
}

// ✏️ Actualizar perfil
export async function updateUser(
  id: string,
  updates: ProfileUpdate
): Promise<Profile> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select("id, created_at, username, email, cp, ciudad, lat, lng, avatar_url")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// 🧩 Crear perfil (usualmente tras signup)
export async function createUserProfile(
  profile: ProfileInsert
): Promise<Profile> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(profile)
    .select("id, created_at, username, email, cp, ciudad, lat, lng, avatar_url")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
