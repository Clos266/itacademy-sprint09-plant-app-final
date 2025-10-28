import { supabase } from "./supabaseClient";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = {
  id: string;
  username?: string | null;
  email?: string | null;
  cp?: string | null;
  ciudad?: string | null;
  lat?: number | null;
  lng?: number | null;
  avatar_url?: string | null;
};

type ProfileUpdate = Partial<Omit<ProfileRow, "id" | "created_at">>;

const TABLE = "profiles" as const;

export async function fetchUsers(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, username, email, cp, ciudad, lat, lng, avatar_url, created_at")
    .order("username", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchUserById(id: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, created_at, username, email, cp, ciudad, lat, lng, avatar_url")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function updateUser(
  id: string,
  updates: ProfileUpdate
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select("id, created_at, username, email, cp, ciudad, lat, lng, avatar_url")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createUserProfile(
  profile: ProfileInsert
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(profile)
    .select("id, created_at, username, email, cp, ciudad, lat, lng, avatar_url")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
