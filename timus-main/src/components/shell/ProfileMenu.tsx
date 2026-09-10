import { useState, ReactNode } from "react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";

interface PortfolioSummary {
  buyingPower: number;
  stocksValue: number;
  totalPnL: number;
  pnlPct: number;
}

// Reads the portfolio snapshot the simulator persists to localStorage.
// Position rows carry their last-known currentPrice; entryPrice is the fallback.
function readPortfolioSummary(): PortfolioSummary {
  const num = (key: string, fallback: number) => {
    try {
      const v = JSON.parse(localStorage.getItem(key) ?? String(fallback));
      return typeof v === "number" && isFinite(v) ? v : fallback;
    } catch {
      return fallback;
    }
  };
  const balance = num("timus_balance", 100000);
  const initialBalance = num("timus_initial_balance", 100000);

  let stocksValue = 0;
  try {
    const positions: { quantity?: number; currentPrice?: number; entryPrice?: number }[] =
      JSON.parse(localStorage.getItem("timus_positions") ?? "[]");
    for (const p of positions) {
      const qty = p.quantity ?? 0;
      const price = p.currentPrice ?? p.entryPrice ?? 0;
      stocksValue += qty * price;
    }
  } catch {
    // no positions
  }

  const totalPnL = balance + stocksValue - initialBalance;
  const pnlPct = initialBalance > 0 ? (totalPnL / initialBalance) * 100 : 0;
  return { buyingPower: balance, stocksValue, totalPnL, pnlPct };
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface ProfileMenuProps {
  trigger: ReactNode;
  direction?: "down" | "up";
  showLogout?: boolean;
  align?: "start" | "end";
}

// Profile dropdown: Buying Power / Stocks / Settled cash / P&L%, optional Log out.
// Rendered downward from the top-bar icon and upward from the sidebar footer.
export default function ProfileMenu({
  trigger,
  direction = "down",
  showLogout = true,
  align = "end",
}: ProfileMenuProps) {
  const { logout } = useAuth();
  const [summary, setSummary] = useState<PortfolioSummary>(readPortfolioSummary);

  const rows: { label: string; value: string; className?: string; note?: string }[] = [
    { label: "Buying Power", value: `$${fmt(summary.buyingPower)}` },
    { label: "Stocks", value: `$${fmt(summary.stocksValue)}` },
    // "Settled cash" is an alias for buying power — this simulator has no
    // T+1/settlement model; the label just mirrors real brokerage UIs.
    { label: "Settled cash", value: `$${fmt(summary.buyingPower)}` },
  ];

  const pnlPositive = summary.totalPnL >= 0;

  return (
    <DropdownMenu onOpenChange={(open) => open && setSummary(readPortfolioSummary())}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        side={direction === "up" ? "top" : "bottom"}
        align={align}
        className="w-60"
      >
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-2 py-1.5 text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-semibold text-foreground">{r.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-2 py-1.5 text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            P&L
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-muted-foreground/80">*</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px]">
                <p>Percentage change is calculated based on all-time portfolio value.</p>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className={`font-semibold ${pnlPositive ? "text-success" : "text-destructive"}`}>
            {pnlPositive ? "+" : "-"}${fmt(Math.abs(summary.totalPnL))}{" "}
            ({pnlPositive ? "+" : "-"}{fmt(Math.abs(summary.pnlPct))}%)
          </span>
        </div>
        {showLogout && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="gap-2 text-muted-foreground focus:text-foreground">
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
