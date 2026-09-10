import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import AuthModal from "@/components/AuthModal";
import Index from "./pages/Index";
import Simulator from "./pages/Simulator";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import News from "./pages/News";
import Gameroom from "./pages/Gameroom";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Single app-wide auth modal — any page opens it via useAuth().openAuthModal()
const GlobalAuthModal = () => {
  const { authModalOpen, closeAuthModal, notifyAuthSuccess } = useAuth();
  return (
    <AuthModal
      open={authModalOpen}
      onClose={closeAuthModal}
      onSuccess={notifyAuthSuccess}
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* Toggles the `dark` class on <html>, persists to localStorage,
        defaults to the OS prefers-color-scheme on first visit */}
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
      <AuthProvider>
        <SidebarProvider>
        <Toaster />
        <Sonner />
        <GlobalAuthModal />
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/news" element={<News />} />
            <Route path="/gameroom" element={<Gameroom />} />
            <Route path="/leaderboard/:code" element={<Leaderboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
