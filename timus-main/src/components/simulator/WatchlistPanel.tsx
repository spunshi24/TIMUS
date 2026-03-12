import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/api";

const WATCHLIST = [
  "AAPL", "NVDA", "MSFT", "META", "TSLA",
  "AMZN", "GOOGL", "ORCL", "SPY", "BRK-B",
];

interface WatchItem {
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
}

interface WatchlistPanelProps {
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
}

const WatchlistPanel = ({ selectedTicker, onSelectTicker }: WatchlistPanelProps) => {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    const results = await Promise.allSettled(
      WATCHLIST.map((t) =>
        fetch(`${API_BASE}/api/quote/${t}`).then((r) => r.json())
      )
    );
    const loaded: WatchItem[] = results
      .filter((r): r is PromiseFulfilledResult<Record<string, unknown>> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((d) => typeof d.price === "number")
      .map((d) => ({
        ticker: d.ticker as string,
        name: d.name as string,
        price: d.price as number,
        change: d.change as number,
        change_pct: d.change_pct as number,
      }));
    setItems(loaded);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 30_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-foreground">Watchlist</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click any stock to open it in the chart
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 py-1 rounded-lg bg-muted">
          Live
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Fetching live prices…</span>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {items.map((item) => {
            const isPositive = item.change_pct >= 0;
            const isSelected = item.ticker === selectedTicker;
            return (
              <button
                key={item.ticker}
                onClick={() => onSelectTicker(item.ticker)}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md active:scale-95 ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:bg-muted/60 hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-foreground text-sm">{item.ticker}</span>
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-success shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-destructive shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mb-2 leading-tight">
                  {item.name}
                </p>
                <p className="text-lg font-bold text-foreground">
                  ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p
                  className={`text-xs font-semibold mt-0.5 ${
                    isPositive ? "text-success" : "text-destructive"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {item.change_pct.toFixed(2)}%
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchlistPanel;
