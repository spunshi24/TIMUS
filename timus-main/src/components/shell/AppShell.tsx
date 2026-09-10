import { ReactNode } from "react";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import Navigation from "@/components/Navigation";
import AppSidebar from "@/components/shell/AppSidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

interface AppShellProps {
  children: ReactNode;
  /** Optional page label shown in the toggle bar (e.g. "Portfolio"). */
  title?: string;
}

// Shared page chrome: persistent top bar + (logged-in, when open) left sidebar,
// plus a slim bar carrying THE single sidebar toggle — one control, same spot,
// on every app page, reachable whether the sidebar is open or closed (F3/F4).
export default function AppShell({ children, title }: AppShellProps) {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const showSidebar = !!user && sidebarOpen;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {showSidebar && <AppSidebar />}
      <div className={`pt-16 transition-[padding] duration-200 ${showSidebar ? "md:pl-60" : ""}`}>
        {user && (
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border bg-background/60">
            {/* Sidebar itself is desktop-only, so the toggle is too */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebar}
                  className="hidden md:flex p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{sidebarOpen ? "Hide sidebar" : "Show sidebar"}</p>
              </TooltipContent>
            </Tooltip>
            {title && (
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {title}
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
