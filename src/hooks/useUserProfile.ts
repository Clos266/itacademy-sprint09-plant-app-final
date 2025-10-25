import { useEffect, useState } from "react";
import type { Profile } from "@/types/supabase";
import { fetchUserById } from "@/services/userService";

export function useUserProfile(userId: string | null, open = true) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !open) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await fetchUserById(userId);
        setUser(profile);
      } catch (err) {
        console.error(err);
        setError("Error loading user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, open]);

  return { user, loading, error, setUser };
}
