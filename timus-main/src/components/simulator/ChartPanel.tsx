import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface ChartPanelProps {
  ticker: string;
  onPriceUpdate?: (price: number) => void;
}

interface QuoteData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  market_cap: string;
  pe_ratio: number | null;
  beta: number | null;
  week52_high: number | null;
  week52_low: number | null;
  dividend_yield: number | null;
}

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const CHART_W = 800;
const CHART_H = 380;
const PADDING = 0.05; // 5% vertical padding so the line never hugs the edge

const ChartPanel = ({ ticker, onPriceUpdate }: ChartPanelProps) => {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [history, setHistory] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async (showLoader = true) => {
    if (!ticker || ticker.trim().length === 0) return;

    if (showLoader) setLoading(true);
    setError(null);

    try {
      const [quoteRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/api/quote/${ticker}`),
        fetch(`${API_BASE}/api/history/${ticker}?period=1d&interval=5m`),
      ]);

      if (!quoteRes.ok) {
        const body = await quoteRes.json().catch(() => ({}));
        throw new Error(body.error || `Ticker "${ticker}" not found.`);
      }

      const quoteData: QuoteData = await quoteRes.json();
      setQuote(quoteData);
      onPriceUpdate?.(quoteData.price);
      setLastUpdated(new Date());

      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData.data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
      setQuote(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [ticker, onPriceUpdate]);

  // Full reload whenever the ticker changes
  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  // Refresh quote only every 30 s (price polling)
  useEffect(() => {
    const id = setInterval(() => fetchAll(false), 30_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  // ── Chart math ──────────────────────────────────────────────────────────────
  const prices = history.map((d) => d.close);
  const maxP = prices.length > 0 ? Math.max(...prices) : 1;
  const minP = prices.length > 0 ? Math.min(...prices) : 0;
  const range = maxP - minP || 1;

  const toY = (price: number) =>
    CHART_H - PADDING * CHART_H - ((price - minP) / range) * CHART_H * (1 - 2 * PADDING);

  const toX = (i: number) =>
    prices.length > 1 ? (i / (prices.length - 1)) * CHART_W : CHART_W / 2;

  const polylinePoints = prices.map((p, i) => `${toX(i)},${toY(p)}`).join(" ");
  const areaPoints = prices.length > 1
    ? `0,${CHART_H} ${polylinePoints} ${CHART_W},${CHART_H}`
    : "";

  const isPositive = (quote?.change ?? 0) >= 0;
  const lineColor = isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)";

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="p-6 rounded-lg border-2 border-border bg-card shadow-lg flex items-center justify-center"
        style={{ minHeight: 520 }}
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading {ticker}…</span>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="p-6 rounded-lg border-2 border-border bg-card shadow-lg flex items-center justify-center"
        style={{ minHeight: 520 }}
      >
        <div className="text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <p className="text-lg font-bold text-foreground">Ticker not found</p>
          <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-3xl font-bold text-foreground">{quote.ticker}</h2>
            <span className="text-sm text-muted-foreground">{quote.name}</span>
          </div>

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-2xl font-bold text-foreground">
              ${quote.price.toFixed(2)}
            </span>
            <span
              className={`flex items-center gap-1 text-lg font-semibold ${
                isPositive ? "text-success" : "text-destructive"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              {isPositive ? "+" : ""}
              {quote.change.toFixed(2)}&nbsp;(
              {isPositive ? "+" : ""}
              {quote.change_pct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Live badge + manual refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchAll(false)}
            className="p-2 rounded hover:bg-muted transition-colors"
            title="Refresh quote"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Live
          </div>
        </div>
      </div>

      {/* ── Metrics strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Beta",       value: quote.beta        != null ? quote.beta.toFixed(2)        : "N/A", color: "" },
          { label: "52W High",   value: quote.week52_high != null ? `$${quote.week52_high.toFixed(2)}` : "N/A", color: "text-success" },
          { label: "52W Low",    value: quote.week52_low  != null ? `$${quote.week52_low.toFixed(2)}`  : "N/A", color: "text-destructive" },
          { label: "Market Cap", value: quote.market_cap !== "N/A" ? `$${quote.market_cap}` : "N/A", color: "" },
          { label: "P/E Ratio",  value: quote.pe_ratio    != null ? quote.pe_ratio.toFixed(2)    : "N/A", color: "" },
          { label: "Div Yield",  value: quote.dividend_yield != null && quote.dividend_yield > 0 ? `${quote.dividend_yield.toFixed(2)}%` : "N/A", color: "" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-sm font-bold ${color || "text-foreground"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Chart ──────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden rounded-lg bg-muted/20 p-4">
        {prices.length > 1 ? (
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full h-auto"
            style={{ minHeight: 280 }}
          >
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-border"
                />
              </pattern>
            </defs>
            <rect width={CHART_W} height={CHART_H} fill="url(#grid)" />

            {/* Area fill */}
            {areaPoints && (
              <polygon points={areaPoints} fill={lineColor} opacity="0.08" />
            )}

            {/* Price line */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Live price dot */}
            <circle
              cx={toX(prices.length - 1)}
              cy={toY(prices[prices.length - 1])}
              r="5"
              fill={lineColor}
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ minHeight: 280 }}
          >
            No intraday chart data available for this session.
          </div>
        )}
      </div>

      {/* ── OHLV strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        {[
          { label: "Open",   value: `$${quote.open.toFixed(2)}`,   color: "" },
          { label: "High",   value: `$${quote.high.toFixed(2)}`,   color: "text-success" },
          { label: "Low",    value: `$${quote.low.toFixed(2)}`,    color: "text-destructive" },
          { label: "Volume", value: quote.volume?.toLocaleString() ?? "N/A", color: "" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-sm font-bold ${color || "text-foreground"}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartPanel;
