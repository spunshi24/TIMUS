import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, X, Loader2, Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import { API_BASE } from "@/lib/api";
import type { AuthUser } from "@/context/AuthContext";

interface StockItem {
  ticker: string;
  name: string;
  price: number | null;
  change_pct: number | null;
}

interface CustomWatchlistPanelProps {
  user: AuthUser | null;
  token: string | null;
  onSelectTicker: (ticker: string) => void;
}

// ── Reusable stock row (used in dropdown and in saved watchlist) ───────────────
const StockRow = ({
  ticker,
  name,
  price,
  change_pct,
  actionState,
  inWatchlist,
  onAdd,
  onRemove,
  showPrice = true,
}: {
  ticker: string;
  name: string;
  price: number | null;
  change_pct: number | null;
  actionState: "idle" | "adding" | "added" | "removing";
  inWatchlist: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  showPrice?: boolean;
}) => {
  const isPos = (change_pct ?? 0) >= 0;
  return (
    <div className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors">
      <span className="font-bold text-foreground w-16 shrink-0 text-sm">{ticker}</span>
      <span className="text-sm text-muted-foreground truncate flex-1">{name}</span>
      {showPrice && (
        <span className="text-sm font-semibold text-foreground shrink-0 w-20 text-right">
          {price !== null
            ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "—"}
        </span>
      )}
      {showPrice && price !== null && (
        <span
          className={`text-xs font-semibold shrink-0 w-14 text-right ${
            isPos ? "text-success" : "text-destructive"
          }`}
        >
          {isPos ? "+" : ""}{(change_pct ?? 0).toFixed(2)}%
        </span>
      )}

      {/* Action button */}
      {!inWatchlist && onAdd && (
        <button
          onClick={onAdd}
          disabled={actionState !== "idle"}
          className="shrink-0 ml-2 w-8 h-8 flex items-center justify-center rounded border border-border hover:bg-muted-foreground/20 transition-colors disabled:opacity-60"
          title="Add to watchlist"
        >
          {actionState === "adding" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          ) : actionState === "added" ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      )}
      {inWatchlist && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          disabled={actionState === "removing"}
          className="shrink-0 ml-2 w-8 h-8 flex items-center justify-center rounded border border-border hover:bg-destructive/20 transition-colors disabled:opacity-60"
          title="Remove from watchlist"
        >
          {actionState === "removing" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const CustomWatchlistPanel = ({ user, token, onSelectTicker }: CustomWatchlistPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockItem[]>([]);
  const [top50, setTop50] = useState<{ ticker: string; name: string }[]>([]);
  const [top50Prices, setTop50Prices] = useState<Record<string, { price: number; change_pct: number }>>({});
  const [top50Loaded, setTop50Loaded] = useState(false);
  const [customList, setCustomList] = useState<StockItem[]>([]);
  const [customListPrices, setCustomListPrices] = useState<Record<string, { price: number; change_pct: number }>>({});
  const [actionState, setActionState] = useState<Record<string, "idle" | "adding" | "added" | "removing">>({});
  const [watchlistTickers, setWatchlistTickers] = useState<Set<string>>(new Set());
  const [listLoading, setListLoading] = useState(false);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  // ── Load user's saved watchlist ────────────────────────────────────────────
  const loadWatchlist = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const rows: { ticker: string; name: string }[] = await res.json();
      setWatchlistTickers(new Set(rows.map((r) => r.ticker)));
      setCustomList(rows.map((r) => ({ ticker: r.ticker, name: r.name, price: null, change_pct: null })));

      // Fetch prices for saved watchlist items
      const priceResults = await Promise.allSettled(
        rows.map((r) => fetch(`${API_BASE}/api/quote/${r.ticker}`).then((x) => x.json()))
      );
      const priceMap: Record<string, { price: number; change_pct: number }> = {};
      priceResults.forEach((result, i) => {
        if (result.status === "fulfilled" && result.value.price != null) {
          priceMap[rows[i].ticker] = {
            price: result.value.price,
            change_pct: result.value.change_pct ?? 0,
          };
        }
      });
      setCustomListPrices(priceMap);
    } catch {
      // silently ignore
    } finally {
      setListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) loadWatchlist();
  }, [user, token, loadWatchlist]);

  // ── Load top 50 + prices when dropdown opens for the first time ───────────
  const loadTop50 = useCallback(async () => {
    if (top50Loaded) return;
    try {
      const res = await fetch(`${API_BASE}/api/top50`);
      if (!res.ok) return;
      const list: { ticker: string; name: string }[] = await res.json();
      setTop50(list);
      setTop50Loaded(true);

      // Fetch prices in parallel (fire-and-forget per batch)
      const BATCH = 10;
      for (let i = 0; i < list.length; i += BATCH) {
        const batch = list.slice(i, i + BATCH);
        Promise.allSettled(
          batch.map((item) => fetch(`${API_BASE}/api/quote/${item.ticker}`).then((x) => x.json()))
        ).then((results) => {
          setTop50Prices((prev) => {
            const next = { ...prev };
            results.forEach((r, j) => {
              if (r.status === "fulfilled" && r.value.price != null) {
                next[batch[j].ticker] = { price: r.value.price, change_pct: r.value.change_pct ?? 0 };
              }
            });
            return next;
          });
        });
      }
    } catch {
      // silently ignore
    }
  }, [top50Loaded]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) loadTop50();
  };

  // ── Debounced search ──────────────────────────────────────────────────────
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) return;
        const data: { ticker: string; name: string }[] = await res.json();
        // Fetch prices for search results
        const priceResults = await Promise.allSettled(
          data.map((d) => fetch(`${API_BASE}/api/quote/${d.ticker}`).then((x) => x.json()))
        );
        setSearchResults(
          data.map((d, i) => {
            const r = priceResults[i];
            return {
              ticker: d.ticker,
              name: d.name,
              price: r.status === "fulfilled" ? (r.value.price ?? null) : null,
              change_pct: r.status === "fulfilled" ? (r.value.change_pct ?? null) : null,
            };
          })
        );
      } catch {
        // silently ignore
      }
    }, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  // ── Add / Remove ──────────────────────────────────────────────────────────
  const handleAdd = async (ticker: string, name: string) => {
    if (!token) return;
    setActionState((prev) => ({ ...prev, [ticker]: "adding" }));
    try {
      const res = await fetch(`${API_BASE}/api/watchlist/add`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ticker, name }),
      });
      if (res.ok) {
        setActionState((prev) => ({ ...prev, [ticker]: "added" }));
        setWatchlistTickers((prev) => new Set([...prev, ticker]));
        // Reload the saved list
        await loadWatchlist();
        setTimeout(() => setActionState((prev) => ({ ...prev, [ticker]: "idle" })), 2000);
      } else {
        setActionState((prev) => ({ ...prev, [ticker]: "idle" }));
      }
    } catch {
      setActionState((prev) => ({ ...prev, [ticker]: "idle" }));
    }
  };

  const handleRemove = async (ticker: string) => {
    if (!token) return;
    setActionState((prev) => ({ ...prev, [ticker]: "removing" }));
    try {
      const res = await fetch(`${API_BASE}/api/watchlist/remove`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ ticker }),
      });
      if (res.ok) {
        setWatchlistTickers((prev) => {
          const next = new Set(prev);
          next.delete(ticker);
          return next;
        });
        setCustomList((prev) => prev.filter((i) => i.ticker !== ticker));
      }
    } catch {
      // silently ignore
    } finally {
      setActionState((prev) => ({ ...prev, [ticker]: "idle" }));
    }
  };

  if (!user) return null;

  const displayList = searchQuery.trim() ? searchResults : top50;

  return (
    <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg">
      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Custom Watchlist</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Build your personal list of stocks to follow
          </p>
        </div>
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border bg-muted/40 hover:bg-muted/70 text-sm font-semibold text-foreground transition-colors"
        >
          {isOpen ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Close
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Stocks
            </>
          )}
        </button>
      </div>

      {/* ── Dropdown panel ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="mb-5 border-2 border-border rounded-lg bg-card shadow-xl overflow-hidden">
          {/* Search bar */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search by name or ticker…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Top label */}
          <div className="px-4 py-2 border-b border-border bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {searchQuery.trim() ? "Search Results" : "Top 50 by Market Cap"}
            </span>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {!top50Loaded && !searchQuery.trim() ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : displayList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery.trim() ? "No results found" : "No data"}
              </p>
            ) : (
              displayList.map((item) => {
                const prices = searchQuery.trim()
                  ? { price: item.price, change_pct: item.change_pct }
                  : (top50Prices[item.ticker] ?? { price: null, change_pct: null });
                const inWatchlist = watchlistTickers.has(item.ticker);
                const state = actionState[item.ticker] ?? "idle";
                return (
                  <StockRow
                    key={item.ticker}
                    ticker={item.ticker}
                    name={item.name}
                    price={prices.price}
                    change_pct={prices.change_pct}
                    actionState={state}
                    inWatchlist={inWatchlist}
                    onAdd={!inWatchlist ? () => handleAdd(item.ticker, item.name) : undefined}
                    showPrice
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── User's saved watchlist ────────────────────────────────────────── */}
      {listLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading your watchlist…</span>
        </div>
      ) : customList.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Your custom watchlist is empty. Click <strong>Add Stocks</strong> to build it.
        </p>
      ) : (
        <div className="border-2 border-border rounded-lg overflow-hidden divide-y divide-border">
          {customList.map((item) => {
            const prices = customListPrices[item.ticker] ?? { price: null, change_pct: null };
            const state = actionState[item.ticker] ?? "idle";
            return (
              <div
                key={item.ticker}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => onSelectTicker(item.ticker)}
              >
                <StockRow
                  ticker={item.ticker}
                  name={item.name}
                  price={prices.price}
                  change_pct={prices.change_pct}
                  actionState={state}
                  inWatchlist
                  onRemove={() => handleRemove(item.ticker)}
                  showPrice
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomWatchlistPanel;
