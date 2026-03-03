import { useState, useEffect, useRef } from "react";
import { Search, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TickerResult {
  ticker: string;
  name: string;
}

interface SimulatorHeaderProps {
  balance: number;
  initialBalance: number;
  positions: Array<{ quantity: number; currentPrice: number; entryPrice: number }>;
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
  onBalanceChange: (balance: number) => void;
}

const SimulatorHeader = ({
  balance,
  initialBalance,
  positions,
  selectedTicker,
  onTickerChange,
  onBalanceChange,
}: SimulatorHeaderProps) => {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(balance.toString());

  // Search state
  const [query, setQuery] = useState(selectedTicker);
  const [suggestions, setSuggestions] = useState<TickerResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep local query in sync when parent changes ticker externally
  useEffect(() => {
    setQuery(selectedTicker);
  }, [selectedTicker]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced autocomplete fetch
  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data: TickerResult[] = await res.json();
          setSuggestions(data);
          setShowDropdown(data.length > 0);
        }
      } catch {
        // network error — silently ignore; search is best-effort
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const commitTicker = (ticker: string) => {
    setQuery(ticker);
    setShowDropdown(false);
    onTickerChange(ticker.toUpperCase());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitTicker(query.toUpperCase());
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Portfolio math
  const positionsValue = positions.reduce(
    (sum, pos) => sum + pos.quantity * pos.currentPrice,
    0
  );
  const portfolioValue = balance + positionsValue;
  const totalPnL = portfolioValue - initialBalance;

  const handleBalanceSubmit = () => {
    const newBalance = parseFloat(tempBalance);
    if (!isNaN(newBalance) && newBalance > 0) {
      onBalanceChange(newBalance);
    }
    setIsEditingBalance(false);
  };

  return (
    <div className="bg-card border-b-2 border-border shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

          {/* ── Ticker search with autocomplete ─────────────────────────── */}
          <div className="flex items-center gap-4 flex-1" ref={containerRef}>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search ticker — e.g. AAPL, TSLA, SPY"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                className="pl-10 h-12 text-lg font-semibold border-2"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />

              {/* Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border-2 border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.ticker}
                      className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent blur before click
                        commitTicker(s.ticker);
                      }}
                    >
                      <span className="font-bold text-foreground w-16 shrink-0">
                        {s.ticker}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Portfolio stats ──────────────────────────────────────────── */}
          <div className="flex items-center gap-8">
            {/* Balance (editable) */}
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              {isEditingBalance ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={tempBalance}
                    onChange={(e) => setTempBalance(e.target.value)}
                    className="w-32 h-8"
                    onKeyDown={(e) => e.key === "Enter" && handleBalanceSubmit()}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleBalanceSubmit}>
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-foreground">
                    $
                    {balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTempBalance(balance.toString());
                      setIsEditingBalance(true);
                    }}
                    title="Edit starting balance"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Total P&L */}
            <div>
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p
                className={`text-2xl font-bold ${
                  totalPnL >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {totalPnL >= 0 ? "+" : ""}$
                {Math.abs(totalPnL).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorHeader;
