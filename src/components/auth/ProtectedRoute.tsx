import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import { LoadingState } from "@/components/common/LoadingState";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const location = useLocation();

  const isPublicRoute =
    location.pathname === "/login" || location.pathname === "/signup";

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

  if (loading) return <LoadingState className="p-6" />;

  if (isPublicRoute) {
    if (session) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
