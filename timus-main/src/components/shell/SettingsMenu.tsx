import { useState } from "react";
import { useTheme } from "next-themes";
import { Settings, Sun, Moon, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ContactCard from "@/components/shell/ContactCard";

// Settings dropdown: light/dark toggle + Help contact popup
export default function SettingsMenu() {
  const { resolvedTheme, setTheme } = useTheme();
  const [helpOpen, setHelpOpen] = useState(false);
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="gap-2"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light mode" : "Dark mode"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHelpOpen(true)} className="gap-2">
            <HelpCircle className="w-4 h-4" />
            Help
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {helpOpen && (
        <ContactCard
          title="Need help?"
          subtitle="Facing an issue? Reach out below."
          showGithub={false}
          mailSubject="TiMUS support"
          onClose={() => setHelpOpen(false)}
        />
      )}
    </>
  );
}
