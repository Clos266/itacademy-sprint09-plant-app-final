import { BrowserRouter, HashRouter } from "react-router";
import { ThemeProvider } from "./contexts/ThemeContext";
import Router from "./Router";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";

const AppRouter =
  import.meta.env.VITE_USE_HASH_ROUTE === "true" ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-center" richColors />
      <AppRouter>
        <ProtectedRoute>
          <Router />
        </ProtectedRoute>
      </AppRouter>
    </ThemeProvider>
  );
}
