import { useEffect, useMemo, useState } from "react";
import { fetchQuotes } from "@/lib/api";
import { aggregatePositions } from "@/lib/portfolio";
import type { Position } from "@/pages/Simulator";

interface StockPositionsPanelProps {
  positions: Position[];
  onSelectTicker: (ticker: string) => void;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "Stock Positions" widget (D3): every position across every ticker, shown on
// any chart view. Rendered only when the user holds at least one position.
export default function StockPositionsPanel({ positions, onSelectTicker }: StockPositionsPanelProps) {
  const aggregated = useMemo(() => aggregatePositions(positions), [positions]);
  const tickers = useMemo(() => [...aggregated.keys()].sort(), [aggregated]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  // Same batched-quote mechanism as the rest of the app — one call per poll
  useEffect(() => {
    if (tickers.length === 0) return;
    let cancelled = false;
    const load = async () => {
      const quotes = await fetchQuotes(tickers);
      if (cancelled) return;
      setLivePrices((prev) => {
        const next = { ...prev };
        for (const t of tickers) {
          const price = quotes[t]?.price;
          if (typeof price === "number" && price > 0) next[t] = price;
        }
        return next;
      });
    };
    load();
    const interval = setInterval(load, 15_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [tickers.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  if (tickers.length === 0) return null;

  return (
    <div className="rounded-lg border-2 border-border bg-card shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">Stock Positions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Symbol", "Quantity", "Buying Price", "Live Price", "P&L"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickers.map((ticker) => {
              const agg = aggregated.get(ticker)!;
              const live = livePrices[ticker];
              const pnl = live != null ? agg.shares * live - agg.shares * agg.avgCost : null;
              return (
                <tr key={ticker} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    {/* Same click-to-trade pattern as Holdings / Open Positions */}
                    <button
                      onClick={() => onSelectTicker(ticker)}
                      className="font-bold text-foreground hover:opacity-80 transition-opacity"
                    >
                      {ticker}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-foreground">{agg.shares.toLocaleString()}</td>
                  <td className="px-4 py-3 text-foreground">${fmt(agg.avgCost)}</td>
                  <td className="px-4 py-3 text-foreground">{live != null ? `$${fmt(live)}` : "—"}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      pnl == null ? "text-muted-foreground" : pnl >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {pnl == null ? "—" : `${pnl >= 0 ? "+" : "-"}$${fmt(Math.abs(pnl))}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
