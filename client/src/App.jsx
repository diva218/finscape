import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const ScenarioBuilderPage = lazy(() => import("./pages/ScenarioBuilderPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const AiPage = lazy(() => import("./pages/AiPage"));

function RouteFallback() {
  return (
    <div className="cute-shell grid min-h-screen place-items-center px-4">
      <div className="glass-card pastel-border px-8 py-6">
        <p className="gradient-text gradient-text-animated font-[Poppins] text-xl font-bold">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Navigate to="/playground" replace />} />
            <Route path="/scenario-builder" element={<Navigate to="/playground" replace />} />
            <Route path="/results" element={<Navigate to="/simulation" replace />} />
            <Route path="/playground" element={<ScenarioBuilderPage />} />
            <Route path="/simulation" element={<ResultsPage />} />
            <Route path="/story-board" element={<DashboardPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/ai" element={<AiPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
