import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchQuotes, type NewsSector, type Quote } from "@/lib/api";

// Sector heat map for today's edition (Section G4). One batched /api/quotes
// call for every NEWS_SECTORS ticker, refreshed every 60s while the tab is
// visible. Tile colours are opacity steps of the existing success/destructive
// tokens (the success steps are scoped to .heatmap in index.css).

const REFRESH_MS = 60_000;
const LONG_PRESS_MS = 450;
const KICKER = "fraunces text-[11px] tracking-[2px] uppercase italic text-ered";

// Strong tiles: the light-theme *-foreground tokens are near-white, which
// measures under 3:1 on an 80% tint, so light mode uses dark foreground text.
function tileClass(pct: number | null): string {
  if (pct === null) return "bg-muted text-muted-foreground";
  if (pct >= 2) return "bg-success/80 text-foreground dark:text-card";
  if (pct >= 0.5) return "bg-success/40";
  if (pct > -0.5) return "bg-muted";
  if (pct > -2) return "bg-destructive/40";
  return "bg-destructive/80 text-foreground dark:text-destructive-foreground";
}

function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  return `${pct > 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

function HeatTile({
  ticker,
  quote,
  onOpen,
}: {
  ticker: string;
  quote: Quote | undefined;
  onOpen: (ticker: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const press = useRef<{ timer?: ReturnType<typeof setTimeout>; long: boolean }>({ long: false });
  const pct = typeof quote?.change_pct === "number" ? quote.change_pct : null;

  const clearPress = () => {
    if (press.current.timer) clearTimeout(press.current.timer);
    press.current.timer = undefined;
  };

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          onClick={() => {
            // A long-press only reveals the tooltip; a tap opens the stock
            if (press.current.long) {
              press.current.long = false;
              return;
            }
            onOpen(ticker);
          }}
          // Hover is Radix's default; touch gets the tooltip on long-press
          onPointerDown={(e) => {
            if (e.pointerType === "mouse") return;
            press.current.long = false;
            clearPress();
            press.current.timer = setTimeout(() => {
              press.current.long = true;
              setOpen(true);
            }, LONG_PRESS_MS);
          }}
          onPointerUp={clearPress}
          onPointerCancel={clearPress}
          onContextMenu={(e) => e.preventDefault()}
          aria-label={`${ticker} ${formatPct(pct)} — open in Simulator`}
          className={`min-h-[44px] select-none touch-manipulation rounded-md border border-border px-1 py-1.5 text-center transition-opacity hover:opacity-90 ${tileClass(pct)}`}
        >
          <span className="block text-sm font-bold leading-tight">{ticker}</span>
          <span className="block text-[11px] leading-tight">{formatPct(pct)}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {quote?.name ?? ticker}
          {typeof quote?.price === "number" && ` · $${quote.price.toFixed(2)}`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function SectorHeatMap({
  sectors,
  onOpenTicker,
}: {
  sectors: NewsSector[];
  onOpenTicker: (ticker: string) => void;
}) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const groups = sectors.filter((s) => s.tickers.length > 0);
  const tickerKey = groups.flatMap((s) => s.tickers).join(",");

  useEffect(() => {
    if (!tickerKey) return;
    let cancelled = false;
    const load = async () => {
      const next = await fetchQuotes(tickerKey.split(","));
      // Keep the last good snapshot if a refresh comes back empty
      if (!cancelled && Object.keys(next).length > 0) setQuotes(next);
    };
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [tickerKey]);

  // Quotes unavailable → hide quietly; the newspaper still renders
  if (groups.length === 0 || Object.keys(quotes).length === 0) return null;

  return (
    <section className="heatmap border-t border-border pt-8">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <p className={KICKER}>Sector heat map</p>
        <p className="text-xs text-muted-foreground">Today's change · tap a tile to trade</p>
      </div>
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
        {groups.map((sector) => {
          const pcts = sector.tickers
            .map((t) => quotes[t]?.change_pct)
            .filter((p): p is number => typeof p === "number");
          const avg = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;
          const avgClass =
            avg === null || avg === 0 ? "text-muted-foreground" : avg > 0 ? "text-success" : "text-destructive";
          return (
            <div key={sector.name} className="min-w-0">
              <div className="mb-2 flex items-baseline justify-between gap-2 border-b border-border pb-1.5">
                <p className={KICKER}>{sector.name}</p>
                <span className={`text-xs font-semibold ${avgClass}`}>{formatPct(avg)}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 md:grid-cols-6">
                {sector.tickers.map((t) => (
                  <HeatTile key={t} ticker={t} quote={quotes[t]} onOpen={onOpenTicker} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
