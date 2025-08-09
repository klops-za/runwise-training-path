
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import TrainingSchedule from "./pages/TrainingSchedule";
import KnowledgeHub from "./pages/KnowledgeHub";
import ArticlePage from "./pages/ArticlePage";
import Onboarding from "./pages/Onboarding";
import Plans from "./pages/Plans";
import GetStarted from "./pages/GetStarted";
import FreePlans from "./pages/FreePlans";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider } from "@/hooks/useAuth";
import PaymentsCallback from "./pages/PaymentsCallback";
import Upgrade from "./pages/Upgrade";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/plans/free" element={<FreePlans />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute><TrainingSchedule /></ProtectedRoute>} />
              <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
              <Route path="/knowledge" element={<KnowledgeHub />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
              <Route path="/payments/callback" element={<PaymentsCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
