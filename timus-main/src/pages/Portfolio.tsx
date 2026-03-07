import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { TrendingUp, TrendingDown, RefreshCw, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Position } from "./Simulator";
import { API_BASE } from "@/lib/api";

interface QuoteSummary {
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
}

interface HoldingRow {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  totalPnL: number;
  totalReturn: number;
  dayChange: number;   // dollar change today per share × shares
  dayChangePct: number;
}

function loadPositions(): Position[] {
  try {
    const raw = localStorage.getItem("timus_positions");
    if (!raw) return [];
    return JSON.parse(raw).map((p: Record<string, unknown>) => ({
      ...p,
      timestamp: p.timestamp ? new Date(p.timestamp as string) : new Date(),
    }));
  } catch {
    return [];
  }
}

function loadBalance(): { balance: number; initialBalance: number } {
  const balance = (() => {
    try { return JSON.parse(localStorage.getItem("timus_balance") ?? "100000"); }
    catch { return 100000; }
  })();
  const initialBalance = (() => {
    try { return JSON.parse(localStorage.getItem("timus_initial_balance") ?? "100000"); }
    catch { return 100000; }
  })();
  return { balance, initialBalance };
}

// Merge duplicate positions for the same ticker into one row (avg cost)
function aggregatePositions(positions: Position[]): Map<string, { shares: number; avgCost: number }> {
  const map = new Map<string, { totalCost: number; shares: number }>();
  for (const p of positions) {
    const existing = map.get(p.ticker) ?? { totalCost: 0, shares: 0 };
    map.set(p.ticker, {
      totalCost: existing.totalCost + p.entryPrice * p.quantity,
      shares: existing.shares + p.quantity,
    });
  }
  const result = new Map<string, { shares: number; avgCost: number }>();
  for (const [ticker, { totalCost, shares }] of map) {
    result.set(ticker, { shares, avgCost: shares > 0 ? totalCost / shares : 0 });
  }
  return result;
}

const Portfolio = () => {
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [cash, setCash] = useState(100000);
  const [initialBalance, setInitialBalance] = useState(100000);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const positions = loadPositions();
    const { balance, initialBalance: initBal } = loadBalance();
    setCash(balance);
    setInitialBalance(initBal);

    if (positions.length === 0) {
      setHoldings([]);
      setLoading(false);
      return;
    }

    const aggregated = aggregatePositions(positions);
    const tickers = Array.from(aggregated.keys());

    // Fetch live quotes for every held ticker in parallel
    const quoteResults = await Promise.allSettled(
      tickers.map((t) => fetch(`${API_BASE}/api/quote/${t}`).then((r) => r.json() as Promise<QuoteSummary>))
    );

    const rows: HoldingRow[] = [];
    tickers.forEach((ticker, i) => {
      const agg = aggregated.get(ticker)!;
      const result = quoteResults[i];
      const quote: Partial<QuoteSummary> =
        result.status === "fulfilled" ? result.value : {};

      const currentPrice = quote.price ?? agg.avgCost;
      const marketValue = currentPrice * agg.shares;
      const totalPnL = (currentPrice - agg.avgCost) * agg.shares;
      const totalReturn =
        agg.avgCost > 0 ? ((currentPrice - agg.avgCost) / agg.avgCost) * 100 : 0;
      const dayChange = (quote.change ?? 0) * agg.shares;
      const dayChangePct = quote.change_pct ?? 0;

      rows.push({
        ticker,
        name: quote.name ?? ticker,
        shares: agg.shares,
        avgCost: agg.avgCost,
        currentPrice,
        marketValue,
        totalPnL,
        totalReturn,
        dayChange,
        dayChangePct,
      });
    });

    // Sort by market value descending
    rows.sort((a, b) => b.marketValue - a.marketValue);
    setHoldings(rows);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Totals ──────────────────────────────────────────────────────────────
  const totalMarketValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const portfolioValue = cash + totalMarketValue;
  const totalPnL = portfolioValue - initialBalance;
  const totalPnLPct = initialBalance > 0 ? (totalPnL / initialBalance) * 100 : 0;
  const totalDayPnL = holdings.reduce((s, h) => s + h.dayChange, 0);

  const fmt = (n: number, digits = 2) =>
    n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const pnlColor = (n: number) => (n >= 0 ? "text-success" : "text-destructive");
  const pnlSign = (n: number) => (n >= 0 ? "+" : "");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-10">

          {/* ── Page header ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-1">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button size="sm" asChild className="gap-2">
                <Link to="/simulator">
                  <BarChart2 className="w-4 h-4" />
                  Trade
                </Link>
              </Button>
            </div>
          </div>

          {/* ── Summary cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Portfolio Value",
                value: `$${fmt(portfolioValue)}`,
                sub: null,
                color: "",
              },
              {
                label: "Total P&L",
                value: `${pnlSign(totalPnL)}$${fmt(Math.abs(totalPnL))}`,
                sub: `${pnlSign(totalPnLPct)}${fmt(totalPnLPct)}%`,
                color: pnlColor(totalPnL),
              },
              {
                label: "Day P&L",
                value: `${pnlSign(totalDayPnL)}$${fmt(Math.abs(totalDayPnL))}`,
                sub: null,
                color: pnlColor(totalDayPnL),
              },
              {
                label: "Cash",
                value: `$${fmt(cash)}`,
                sub: `${fmt((cash / portfolioValue) * 100, 1)}% of portfolio`,
                color: "",
              },
            ].map(({ label, value, sub, color }) => (
              <div
                key={label}
                className="p-5 rounded-lg border-2 border-border bg-card shadow-sm"
              >
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color || "text-foreground"}`}>{value}</p>
                {sub && <p className={`text-xs mt-1 ${color || "text-muted-foreground"}`}>{sub}</p>}
              </div>
            ))}
          </div>

          {/* ── Holdings table ────────────────────────────────────────────── */}
          <div className="rounded-lg border-2 border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Holdings</h2>
              <span className="text-sm text-muted-foreground">
                {holdings.length} position{holdings.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted-foreground">
                Loading live prices…
              </div>
            ) : holdings.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No open positions.</p>
                <Button asChild>
                  <Link to="/simulator">Start Trading</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {[
                        "Symbol",
                        "Shares",
                        "Avg Cost",
                        "Current Price",
                        "Market Value",
                        "Day P&L",
                        "Total P&L",
                        "Return",
                      ].map((h) => (
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
                    {holdings.map((h, i) => (
                      <tr
                        key={h.ticker}
                        className={`border-b border-border hover:bg-muted/20 transition-colors ${
                          i % 2 === 0 ? "" : "bg-muted/5"
                        }`}
                      >
                        {/* Symbol + Name */}
                        <td className="px-4 py-4">
                          <Link
                            to={`/simulator`}
                            className="flex flex-col hover:opacity-80 transition-opacity"
                            onClick={() => {
                              // Pre-select this ticker in simulator via sessionStorage hint
                              sessionStorage.setItem("timus_goto_ticker", h.ticker);
                            }}
                          >
                            <span className="font-bold text-foreground">{h.ticker}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                              {h.name}
                            </span>
                          </Link>
                        </td>

                        {/* Shares */}
                        <td className="px-4 py-4 text-sm font-medium text-foreground">
                          {h.shares.toLocaleString()}
                        </td>

                        {/* Avg Cost */}
                        <td className="px-4 py-4 text-sm text-foreground">
                          ${fmt(h.avgCost)}
                        </td>

                        {/* Current Price */}
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-foreground">
                            ${fmt(h.currentPrice)}
                          </div>
                          <div
                            className={`text-xs flex items-center gap-0.5 ${pnlColor(h.dayChangePct)}`}
                          >
                            {h.dayChangePct >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {pnlSign(h.dayChangePct)}{fmt(Math.abs(h.dayChangePct))}%
                          </div>
                        </td>

                        {/* Market Value */}
                        <td className="px-4 py-4 text-sm font-medium text-foreground">
                          ${fmt(h.marketValue)}
                        </td>

                        {/* Day P&L */}
                        <td className={`px-4 py-4 text-sm font-semibold ${pnlColor(h.dayChange)}`}>
                          {pnlSign(h.dayChange)}${fmt(Math.abs(h.dayChange))}
                        </td>

                        {/* Total P&L */}
                        <td className={`px-4 py-4 text-sm font-semibold ${pnlColor(h.totalPnL)}`}>
                          {pnlSign(h.totalPnL)}${fmt(Math.abs(h.totalPnL))}
                        </td>

                        {/* Return % */}
                        <td className={`px-4 py-4 text-sm font-bold ${pnlColor(h.totalReturn)}`}>
                          {pnlSign(h.totalReturn)}{fmt(Math.abs(h.totalReturn))}%
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Footer totals */}
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/20">
                      <td className="px-4 py-3 text-sm font-bold text-foreground" colSpan={4}>
                        Total Invested
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-foreground">
                        ${fmt(totalMarketValue)}
                      </td>
                      <td className={`px-4 py-3 text-sm font-bold ${pnlColor(totalDayPnL)}`}>
                        {pnlSign(totalDayPnL)}${fmt(Math.abs(totalDayPnL))}
                      </td>
                      <td className={`px-4 py-3 text-sm font-bold ${pnlColor(totalPnL)}`}>
                        {pnlSign(totalPnL)}${fmt(Math.abs(totalPnL))}
                      </td>
                      <td className={`px-4 py-3 text-sm font-bold ${pnlColor(totalPnLPct)}`}>
                        {pnlSign(totalPnLPct)}{fmt(Math.abs(totalPnLPct))}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* ── Cash row ──────────────────────────────────────────────────── */}
          <div className="mt-4 p-4 rounded-lg border border-border bg-card flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Cash (Uninvested)</p>
              <p className="text-sm text-muted-foreground">Available to trade</p>
            </div>
            <p className="text-xl font-bold text-foreground">${fmt(cash)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
