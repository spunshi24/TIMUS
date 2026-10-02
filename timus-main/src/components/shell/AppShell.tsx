import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import Navigation from "@/components/Navigation";
import AppSidebar, { SidebarContent } from "@/components/shell/AppSidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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
  // Mobile drawer state is deliberately separate from SidebarContext's
  // sidebarOpen, so desktop sidebar state never opens the drawer on resize.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { pathname } = useLocation();

  // Safety net: close the drawer on any route change.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {showSidebar && <AppSidebar />}
      <div className={`pt-16 transition-[padding] duration-200 ${showSidebar ? "md:pl-60" : ""}`}>
        {user && (
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border bg-background/60">
            {/* Phones: opens the slide-in drawer below */}
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            {/* Desktop sidebar toggle */}
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
      {user && (
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side="left"
            className="w-64 p-0 pt-10 gap-0 bg-sidebar border-sidebar-border flex flex-col md:hidden"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
