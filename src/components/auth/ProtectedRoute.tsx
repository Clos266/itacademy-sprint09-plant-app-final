import { Navigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<null | object>(null);
  const location = useLocation();

  const isPublicRoute =
    location.pathname === "/login" || location.pathname === "/signin";

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-6 text-center">Cargando...</div>;

  // 🔓 Si está en una ruta pública, renderiza libremente
  if (isPublicRoute) return <>{children}</>;

  // 🚪 Si no está autenticado, redirige al login
  if (!session) return <Navigate to="/login" replace />;

  // ✅ Usuario autenticado → muestra la app
  return <>{children}</>;
}
