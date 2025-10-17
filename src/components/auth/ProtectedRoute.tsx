import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const location = useLocation();

  // ✅ Rutas públicas (login y signup)
  const isPublicRoute =
    location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    getSession();

    // 🔁 Escucha cambios de sesión (login/logout/signup)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  // 🔓 Rutas públicas: login/signup
  if (isPublicRoute) {
    // Si el usuario ya está autenticado → mándalo al home
    if (session) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  // 🚪 Si no está autenticado → mándalo a login
  if (!session) return <Navigate to="/login" replace />;

  // ✅ Usuario autenticado → muestra la app
  return <>{children}</>;
}
