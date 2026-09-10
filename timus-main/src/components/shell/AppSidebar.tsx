import { NavLink } from "react-router-dom";
import { BarChart2, Briefcase, Star, Newspaper, Trophy, LogOut, UserCircle2, PanelLeftClose } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import ProfileMenu from "@/components/shell/ProfileMenu";

const NAV_ITEMS = [
  { to: "/simulator", label: "Simulator", icon: BarChart2 },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/watchlist", label: "Watchlist", icon: Star },
  { to: "/news", label: "Research/News", icon: Newspaper },
  { to: "/gameroom", label: "Gameroom", icon: Trophy },
];

// Collapsible left sidebar for the logged-in shell (C5).
// When open, the top bar's right-side icon cluster hides — the same controls
// live at the bottom of this sidebar instead.
export default function AppSidebar() {
  const { user, logout } = useAuth();
  const { closeSidebar } = useSidebar();

  return (
    <aside className="fixed left-0 top-16 bottom-0 z-40 w-60 hidden md:flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Collapse control — usable on pages without the simulator search bar */}
      <div className="flex justify-end px-3 pt-3">
        <button
          onClick={closeSidebar}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title="Hide sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: profile summary (opens upward, no logout row) + separate Sign Out */}
      <div className="px-3 pb-4 pt-2 border-t border-sidebar-border space-y-1">
        <ProfileMenu
          direction="up"
          align="start"
          showLogout={false}
          trigger={
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-sidebar-accent/60 transition-colors">
              <UserCircle2 className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{user?.username ?? "Profile"}</span>
            </button>
          }
        />
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-sidebar-accent/60 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
