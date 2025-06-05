
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/plans/free" element={<FreePlans />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/schedule" element={<TrainingSchedule />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/knowledge" element={<KnowledgeHub />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
