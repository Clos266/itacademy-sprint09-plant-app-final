// src/types/supabase.ts
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
}

export interface Event {
  id: number;
  user_id: string;
  title: string;
  date: string;
  location: string;
  swap_point_id: number | null;
  image_url: string | null;
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
}

export interface SwapMessage {
  id: number;
  swap_id: number;
  sender_id: string;
  message: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile };
      plants: { Row: Plant };
      swap_points: { Row: SwapPoint };
      events: { Row: Event };
      swaps: { Row: Swap };
      swap_messages: { Row: SwapMessage };
    };
  };
}
