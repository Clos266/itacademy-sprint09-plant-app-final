import { supabase } from "./supabaseClient";

export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string;
}

const TABLE = "profiles";

// 📥 Obtener todos los usuarios (opcional, para vistas públicas)
export async function fetchUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("username");
  if (error) throw new Error(error.message);
  return data || [];
}

// 📄 Obtener perfil por ID
export async function fetchUserById(id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ✏️ Actualizar perfil
export async function updateUser(id: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// 🧩 Crear perfil (usualmente tras signup)
export async function createUserProfile(profile: UserProfile) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(profile)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
