import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import NotMatch from "./pages/NotMatch";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignupPage from "./pages/Signup";
import PlantsPage from "./pages/Plants";
import HomePage from "./pages/Home";
import SwapsPage from "./pages/Swaps";

export default function Router() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="swaps" element={<SwapsPage />} />
        <Route path="plants" element={<PlantsPage />} />
        <Route path="pages">
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>
        <Route path="*" element={<NotMatch />} />
      </Route>
    </Routes>
  );
}
