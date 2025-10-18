import { supabase } from "./supabaseClient";

// 🟢 Registrar usuario
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // Devuelve el usuario creado para redirigir a /create-profile
  return data.user;
}

// 🟡 Iniciar sesión
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
}

// 🔵 Cerrar sesión
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 🟣 Obtener usuario actual
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
