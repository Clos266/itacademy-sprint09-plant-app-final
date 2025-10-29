import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import NotMatch from "./pages/NotMatch";
import Events from "./pages/Events";
import Login from "./pages/Login";
import SignupPage from "./pages/Signup";
import PlantPage from "./pages/Plants";
import HomePage from "./pages/Home";
import SwapsPage from "./pages/Swaps";
import CreateProfilePage from "./pages/CreateProfilePage";

export default function Router() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="events" element={<Events />} />
        <Route path="swaps" element={<SwapsPage />} />
        <Route path="plants" element={<PlantPage />} />

        {/* 🔐 Autenticación */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="create-profile" element={<CreateProfilePage />} />

        {/* ❌ Fallback */}
        <Route path="*" element={<NotMatch />} />
      </Route>
    </Routes>
  );
}
