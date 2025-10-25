// src/types/supabase.ts

// ============================================================
// 🗄️ INTERFACES DE TABLAS DE SUPABASE
// ============================================================

export interface Profile {
  id: string;
  created_at: string;
  username: string | null;
  email: string | null;
  cp: string | null;
  ciudad: string | null;
  lat: number | null;
  lng: number | null;
  avatar_url: string | null;
}

export interface Plant {
  id: number;
  created_at: string;
  user_id: string;
  nombre_comun: string;
  nombre_cientifico: string | null;
  especie: string | null;
  familia: string | null;
  disponible: boolean;
  interval_days: number;
  last_watered: string;
  image_url: string | null;
}

export interface SwapPoint {
  id: number;
  name: string;
  description: string | null;
  address: string;
  city: string;
  lat: number;
  lng: number;
  created_at: string;
  image_url: string | null;
  location?: string; // Alias para compatibilidad
}

export interface Event {
  id: number;
  user_id: string;
  title: string;
  date: string;
  location: string;
  swap_point_id: number | null;
  image_url: string | null;
  description?: string | null;
}

export interface Swap {
  id: number;
  sender_id: string;
  receiver_id: string;
  sender_plant_id: number;
  receiver_plant_id: number;
  swap_point_id: number | null;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
  updated_at: string;
  sender_completed?: boolean;
  receiver_completed?: boolean;
}

export interface SwapMessage {
  id: number;
  swap_id: number;
  sender_id: string;
  message: string;
  created_at: string;
}

// ============================================================
// 🔄 TIPOS DE OPERACIONES (Insert, Update, etc.)
// ============================================================

export type ProfileInsert = Omit<Profile, "id" | "created_at"> & {
  id: string;
};

export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">>;

export type PlantInsert = Omit<Plant, "id" | "created_at">;

export type PlantUpdate = Partial<Omit<Plant, "id" | "created_at">>;

export type SwapInsert = Omit<Swap, "id" | "created_at" | "updated_at"> & {
  status?: Swap["status"];
};

export type SwapUpdate = Partial<Omit<Swap, "id" | "created_at">>;

export type EventInsert = Omit<Event, "id">;

export type EventUpdate = Partial<Omit<Event, "id">>;

// ============================================================
// 🔗 TIPOS CON RELACIONES
// ============================================================

export type PlantWithProfile = Plant & {
  profile?: Profile | null;
  profiles?: Profile | null; // Para compatibilidad con queries de Supabase
};

export type FullPlant = PlantWithProfile;

export type SwapWithRelations = Swap & {
  sender?: Profile | null;
  receiver?: Profile | null;
  senderPlant?: Plant | null;
  receiverPlant?: Plant | null;
};

export type FullSwap = SwapWithRelations;

export type EventWithProfile = Event & {
  profile?: Profile | null;
};

// ============================================================
// 🎯 TIPOS DE STATUS Y ENUMS
// ============================================================

export type SwapStatus = "pending" | "accepted" | "rejected" | "completed";

// ============================================================
// 🗄️ DEFINICIÓN DE BASE DE DATOS
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      plants: {
        Row: Plant;
        Insert: PlantInsert;
        Update: PlantUpdate;
      };
      swap_points: {
        Row: SwapPoint;
        Insert: Omit<SwapPoint, "id" | "created_at">;
        Update: Partial<Omit<SwapPoint, "id" | "created_at">>;
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      swaps: {
        Row: Swap;
        Insert: SwapInsert;
        Update: SwapUpdate;
      };
      swap_messages: {
        Row: SwapMessage;
        Insert: Omit<SwapMessage, "id" | "created_at">;
        Update: Partial<Omit<SwapMessage, "id" | "created_at">>;
      };
    };
  };
}

// ============================================================
// 🔧 TIPOS DE UTILIDAD PARA SERVICIOS
// ============================================================

export type ProfileRow = Profile;
