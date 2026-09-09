import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import AppSidebar from "@/components/shell/AppSidebar";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

// Shared page chrome: persistent top bar + (logged-in, when open) left sidebar.
// App pages (Simulator, Portfolio, Watchlist, News, Gameroom) mount inside this
// so the shell is defined once, not re-implemented per page.
export default function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { sidebarOpen } = useSidebar();
  const showSidebar = !!user && sidebarOpen;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {showSidebar && <AppSidebar />}
      <div className={`pt-16 transition-[padding] duration-200 ${showSidebar ? "md:pl-60" : ""}`}>
        {children}
      </div>
    </div>
  );
}
