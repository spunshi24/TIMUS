import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Navigation from "@/components/Navigation";
import SimulatorHeader from "@/components/simulator/SimulatorHeader";
import ChartPanel from "@/components/simulator/ChartPanel";
import OrderPanel from "@/components/simulator/OrderPanel";
import TurboPanel from "@/components/simulator/TurboPanel";
import WatchlistPanel from "@/components/simulator/WatchlistPanel";
import CustomWatchlistPanel from "@/components/simulator/CustomWatchlistPanel";
import GameRoomPanel from "@/components/simulator/GameRoomPanel";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/api";

export interface Position {
  id: string;
  ticker: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  type: "long" | "short";
  timestamp: Date;
}

export interface Order {
  id: string;
  ticker: string;
  type: "market" | "limit" | "stop";
  side: "buy" | "sell";
  quantity: number;
  price?: number;        // limit price or stop price
  status: "pending" | "working" | "filled" | "cancelled";
  timestamp: Date;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item: Record<string, unknown>) => ({
        ...item,
        timestamp: item.timestamp ? new Date(item.timestamp as string) : new Date(),
      })) as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

// Returns true if US equity markets are currently open (ET Mon–Fri 9:30–16:00)
function isMarketOpen(): boolean {
  const et = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = et.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const totalMin = et.getHours() * 60 + et.getMinutes();
  return totalMin >= 9 * 60 + 30 && totalMin < 16 * 60;
}

// ─── Blocked-order modal ─────────────────────────────────────────────────────
function BlockedModal({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const isMarketClosed = message.includes("SESSION CLOSED");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onDismiss}
    >
      <div
        className="bg-zinc-950 border-2 border-red-500/50 rounded-2xl p-8 max-w-sm w-full text-center"
        style={{ boxShadow: "0 0 60px rgba(239,68,68,0.25), 0 24px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="text-5xl mb-4">{isMarketClosed ? "🔔" : "🚫"}</div>
        <h3 className="text-lg font-bold text-white mb-2 leading-snug">{message}</h3>
        {isMarketClosed && (
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
            US equity markets are open<br />
            <span className="text-white font-semibold">Monday – Friday, 9:30 AM – 4:00 PM ET</span>
          </p>
        )}
        {!isMarketClosed && (
          <p className="text-zinc-400 text-sm mt-2">
            Add funds or reduce your order size.
          </p>
        )}
        <button
          className="mt-6 px-8 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors text-sm"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const Simulator = () => {
  const { toast } = useToast();
  const { user, token } = useAuth();

  const [selectedTicker, setSelectedTicker] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const selectedTickerRef = useRef("");

  const [balance, setBalance] = useState<number>(() =>
    loadFromStorage("timus_balance", 100000)
  );
  const [initialBalance, setInitialBalance] = useState<number>(() =>
    loadFromStorage("timus_initial_balance", 100000)
  );
  const [positions, setPositions] = useState<Position[]>(() =>
    loadFromStorage("timus_positions", [])
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage("timus_orders", [])
  );

  const [pricesByTicker, setPricesByTicker] = useState<Record<string, number>>({});
  const [turboOpen, setTurboOpen] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  // Refs — avoid stale closures inside callbacks
  const balanceRef = useRef(balance);
  const positionsRef = useRef<Position[]>(positions);
  const ordersRef = useRef<Order[]>(orders);
  const pricesByTickerRef = useRef<Record<string, number>>({});
  const workingOrdersRef = useRef<Order[]>([]);

  // ── Persist to localStorage ─────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("timus_positions", JSON.stringify(positions));
    positionsRef.current = positions;
  }, [positions]);

  useEffect(() => {
    localStorage.setItem("timus_orders", JSON.stringify(orders));
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("timus_balance", JSON.stringify(balance));
    balanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("timus_initial_balance", JSON.stringify(initialBalance));
  }, [initialBalance]);

  // ── Reset to defaults when user logs out ─────────────────────────────────
  const prevUserRef = useRef(user);
  useEffect(() => {
    if (prevUserRef.current !== null && user === null) {
      setBalance(100000);
      setInitialBalance(100000);
      setPositions([]);
      setOrders([]);
      selectedTickerRef.current = "";
      setSelectedTicker("");
    }
    prevUserRef.current = user;
  }, [user]);

  // ── T key shortcut to toggle Turbo panel ────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "t") return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      setTurboOpen((prev) => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Ticker change ───────────────────────────────────────────────────────
  const handleTickerChange = (ticker: string) => {
    selectedTickerRef.current = ticker;
    setSelectedTicker(ticker);
  };

  const handleShowWatchlist = () => {
    selectedTickerRef.current = "";
    setSelectedTicker("");
  };

  // ── Balance edit ────────────────────────────────────────────────────────
  const handleBalanceChange = (newBalance: number) => {
    balanceRef.current = newBalance;
    setBalance(newBalance);
    setInitialBalance(newBalance);
  };

  // ── Portfolio sync (fire-and-forget) ────────────────────────────────────
  const syncPortfolio = useCallback(async (
    currentBalance: number,
    currentPositions: Position[],
    currentOrders: Order[],
    currentInitialBalance: number,
  ) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/portfolio/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          balance: currentBalance,
          initialBalance: currentInitialBalance,
          positions: currentPositions,
          orders: currentOrders,
        }),
      });
    } catch {
      // Silently ignore — never block trading on a sync failure
    }
  }, [token]);

  // ── Load portfolio from backend (on login / cross-device) ───────────────
  const loadPortfolioFromBackend = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/portfolio/load`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.found) return;

      localStorage.setItem("timus_balance", JSON.stringify(data.balance));
      localStorage.setItem("timus_initial_balance", JSON.stringify(data.initialBalance));
      localStorage.setItem("timus_positions", JSON.stringify(data.positions));
      localStorage.setItem("timus_orders", JSON.stringify(data.orders));

      setBalance(data.balance);
      setInitialBalance(data.initialBalance);
      setPositions(
        (data.positions as Record<string, unknown>[]).map((p) => ({
          ...p,
          timestamp: p.timestamp ? new Date(p.timestamp as string) : new Date(),
        })) as Position[]
      );
      setOrders(
        (data.orders as Record<string, unknown>[]).map((o) => ({
          ...o,
          timestamp: o.timestamp ? new Date(o.timestamp as string) : new Date(),
        })) as Order[]
      );
    } catch {
      // Silently fall back to local data
    }
  }, [token]);

  // Load from backend when token becomes available (login / page reload while logged in)
  useEffect(() => {
    if (user && token) loadPortfolioFromBackend();
  }, [user, token, loadPortfolioFromBackend]);

  // ── Core fill logic ─────────────────────────────────────────────────────
  const fillOrder = useCallback((order: Order, executionPrice: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: "filled" as const } : o))
    );

    if (order.side === "buy") {
      const cost = executionPrice * order.quantity;
      if (cost > balanceRef.current) {
        setBlockedMsg("ORDER NOT FILLED — INSUFFICIENT FUNDS");
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" as const } : o))
        );
        return;
      }
      balanceRef.current -= cost;
      setBalance(balanceRef.current);

      const newPos: Position = {
        id: crypto.randomUUID(),
        ticker: order.ticker,
        quantity: order.quantity,
        entryPrice: executionPrice,
        currentPrice: executionPrice,
        type: "long",
        timestamp: new Date(),
      };
      positionsRef.current = [...positionsRef.current, newPos];
      setPositions(positionsRef.current);

      toast({
        title: "Order Filled ✓",
        description: `Bought ${order.quantity} ${order.ticker} @ $${executionPrice.toFixed(2)}`,
      });
    } else {
      // Sell
      const pos = positionsRef.current.find((p) => p.ticker === order.ticker);
      if (!pos || pos.quantity < order.quantity) {
        setBlockedMsg("ORDER NOT FILLED — INSUFFICIENT SHARES");
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" as const } : o))
        );
        return;
      }

      const proceeds = executionPrice * order.quantity;
      balanceRef.current += proceeds;
      setBalance(balanceRef.current);

      const updated = positionsRef.current
        .map((p) => {
          if (p.ticker === order.ticker) {
            const remaining = p.quantity - order.quantity;
            return remaining > 0 ? { ...p, quantity: remaining } : null;
          }
          return p;
        })
        .filter((p): p is Position => p !== null);

      positionsRef.current = updated;
      setPositions(updated);

      const profit = (executionPrice - pos.entryPrice) * order.quantity;
      toast({
        title: "Order Filled ✓",
        description: `Sold ${order.quantity} ${order.ticker} @ $${executionPrice.toFixed(2)} — P&L: ${profit >= 0 ? "+" : ""}$${profit.toFixed(2)}`,
      });
    }

    // Post-fill: track anon trades or sync logged-in portfolio
    if (!user) {
      const prev = parseInt(localStorage.getItem("timus_anon_trades") || "0", 10);
      localStorage.setItem("timus_anon_trades", String(prev + 1));
    } else {
      syncPortfolio(balanceRef.current, positionsRef.current, ordersRef.current, initialBalance);
    }
  }, [toast, user, syncPortfolio, initialBalance]);

  // ── Check working orders when a new price arrives ──────────────────────
  const checkWorkingOrders = useCallback((ticker: string, price: number) => {
    const stillWorking: Order[] = [];
    for (const order of workingOrdersRef.current) {
      if (order.ticker !== ticker) {
        stillWorking.push(order);
        continue;
      }
      const trigger = order.price!;
      let fires = false;

      if (order.type === "limit") {
        fires =
          (order.side === "buy" && price <= trigger) ||
          (order.side === "sell" && price >= trigger);
      } else if (order.type === "stop") {
        fires =
          (order.side === "sell" && price <= trigger) ||
          (order.side === "buy" && price >= trigger);
      }

      if (fires) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "pending" as const } : o))
        );
        fillOrder(order, price);
      } else {
        stillWorking.push(order);
      }
    }
    workingOrdersRef.current = stillWorking;
  }, [fillOrder]);

  // ── Price update from ChartPanel ────────────────────────────────────────
  const handlePriceUpdate = useCallback((price: number) => {
    const ticker = selectedTickerRef.current;
    pricesByTickerRef.current = { ...pricesByTickerRef.current, [ticker]: price };
    setPricesByTicker((prev) => ({ ...prev, [ticker]: price }));
    checkWorkingOrders(ticker, price);
  }, [checkWorkingOrders]);

  // ── Auth success: save anon portfolio then load from backend ────────────
  const handleAuthSuccess = useCallback(async () => {
    await syncPortfolio(balanceRef.current, positionsRef.current, ordersRef.current, initialBalance);
    await loadPortfolioFromBackend();
  }, [syncPortfolio, loadPortfolioFromBackend, initialBalance]);

  // ── Shared order guard (auth cap + market hours) ────────────────────────
  const guardOrder = (): boolean => {
    if (!user) {
      const anonCount = parseInt(localStorage.getItem("timus_anon_trades") || "0", 10);
      if (anonCount >= 4) {
        setAuthModalOpen(true);
        return false;
      }
    }
    if (!isMarketOpen()) {
      setBlockedMsg("ORDER NOT FILLED — NEW YORK SESSION CLOSED");
      return false;
    }
    return true;
  };

  // ── Place order (entry point from OrderPanel) ──────────────────────────
  const handlePlaceOrder = (order: Omit<Order, "id" | "status" | "timestamp">) => {
    if (!guardOrder()) return;

    const livePrice = pricesByTickerRef.current[order.ticker] ?? 0;

    if (livePrice <= 0) {
      toast({
        title: "Price unavailable",
        description: "Live price not yet loaded. Wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    if (order.type !== "market") {
      const p = order.price;
      if (!p || isNaN(p) || p <= 0) {
        toast({
          title: "Invalid price",
          description: "Enter a valid price greater than $0.",
          variant: "destructive",
        });
        return;
      }
    }

    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      status: "pending",
      timestamp: new Date(),
    };

    setOrders((prev) => [...prev, newOrder]);

    // ── Market order ─────────────────────────────────────────────────────
    if (order.type === "market") {
      setTimeout(() => fillOrder(newOrder, livePrice), 300);
      toast({
        title: "Market Order Placed",
        description: `${order.side === "buy" ? "Buy" : "Sell"} ${order.quantity} ${order.ticker} @ $${livePrice.toFixed(2)}`,
      });
      return;
    }

    const triggerPrice = order.price!;

    // ── Limit order ──────────────────────────────────────────────────────
    if (order.type === "limit") {
      const immediatelyFillable =
        (order.side === "buy" && livePrice <= triggerPrice) ||
        (order.side === "sell" && livePrice >= triggerPrice);

      if (immediatelyFillable) {
        const execPrice =
          order.side === "buy"
            ? Math.min(livePrice, triggerPrice)
            : Math.max(livePrice, triggerPrice);
        setTimeout(() => fillOrder(newOrder, execPrice), 300);
        toast({
          title: "Limit Order — Filling Now",
          description: `${order.ticker} market price $${livePrice.toFixed(2)} already ${order.side === "buy" ? "at/below" : "at/above"} limit $${triggerPrice.toFixed(2)}`,
        });
      } else {
        const workingOrder = { ...newOrder, status: "working" as const };
        setOrders((prev) =>
          prev.map((o) => (o.id === newOrder.id ? workingOrder : o))
        );
        workingOrdersRef.current = [...workingOrdersRef.current, workingOrder];
        toast({
          title: "Limit Order Working",
          description: `${order.side === "buy" ? "Buy" : "Sell"} ${order.quantity} ${order.ticker} — waiting for $${triggerPrice.toFixed(2)} (now $${livePrice.toFixed(2)})`,
        });
      }
      return;
    }

    // ── Stop order ───────────────────────────────────────────────────────
    if (order.type === "stop") {
      const alreadyTriggered =
        (order.side === "sell" && livePrice <= triggerPrice) ||
        (order.side === "buy" && livePrice >= triggerPrice);

      if (alreadyTriggered) {
        setTimeout(() => fillOrder(newOrder, livePrice), 300);
        toast({
          title: "Stop Order — Triggered Immediately",
          description: `Price $${livePrice.toFixed(2)} already past stop $${triggerPrice.toFixed(2)}, filling at market`,
        });
      } else {
        const workingOrder = { ...newOrder, status: "working" as const };
        setOrders((prev) =>
          prev.map((o) => (o.id === newOrder.id ? workingOrder : o))
        );
        workingOrdersRef.current = [...workingOrdersRef.current, workingOrder];
        toast({
          title: "Stop Order Working",
          description: `${order.side === "sell" ? "Stop-loss" : "Stop-buy"} at $${triggerPrice.toFixed(2)} — triggers when price ${order.side === "sell" ? "falls to" : "rises to"} $${triggerPrice.toFixed(2)} (now $${livePrice.toFixed(2)})`,
        });
      }
    }
  };

  // ── Turbo order ────────────────────────────────────────────────────────
  const handleTurboOrder = (side: "buy" | "sell", qty: number, execPrice: number) => {
    if (!guardOrder()) return;
    const newOrder: Order = {
      id: crypto.randomUUID(),
      ticker: selectedTickerRef.current,
      type: "market",
      side,
      quantity: qty,
      status: "pending",
      timestamp: new Date(),
    };
    setOrders((prev) => [...prev, newOrder]);
    fillOrder(newOrder, execPrice);
  };

  // ── Close a position via market sell ──────────────────────────────────
  const handleClosePosition = (positionId: string) => {
    const position = positionsRef.current.find((p) => p.id === positionId);
    if (!position) return;
    handlePlaceOrder({
      ticker: position.ticker,
      type: "market",
      side: "sell",
      quantity: position.quantity,
    });
  };

  // ── Derived values ────────────────────────────────────────────────────
  const currentPrice = pricesByTicker[selectedTicker] ?? 0;

  const positionsWithLivePrice = positions.map((p) => ({
    ...p,
    currentPrice: pricesByTicker[p.ticker] ?? p.entryPrice,
  }));

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <SimulatorHeader
          balance={balance}
          initialBalance={initialBalance}
          positions={positionsWithLivePrice}
          selectedTicker={selectedTicker}
          onTickerChange={handleTickerChange}
          onBalanceChange={handleBalanceChange}
          onAuthClick={() => setAuthModalOpen(true)}
          onShowWatchlist={handleShowWatchlist}
        />

        <div className="container mx-auto px-4 py-8 space-y-6">
          {selectedTicker ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2">
                <ChartPanel ticker={selectedTicker} onPriceUpdate={handlePriceUpdate} />
              </div>

              {/* Order Panel */}
              <div className="lg:col-span-1">
                <OrderPanel
                  ticker={selectedTicker}
                  balance={balance}
                  currentPrice={currentPrice}
                  onPlaceOrder={handlePlaceOrder}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <WatchlistPanel
                selectedTicker={selectedTicker}
                onSelectTicker={handleTickerChange}
              />
              {user && (
                <CustomWatchlistPanel
                  user={user}
                  token={token}
                  onSelectTicker={handleTickerChange}
                />
              )}
            </div>
          )}

          {/* Game Room — always visible */}
          <GameRoomPanel
            user={user}
            token={token}
            onAuthClick={() => setAuthModalOpen(true)}
          />
        </div>
      </div>

      {/* Turbo keyboard hint */}
      {!turboOpen && (
        <div className="fixed bottom-6 right-6 z-30 text-xs text-muted-foreground/50 select-none pointer-events-none">
          Press <kbd className="font-mono font-semibold">T</kbd> for Quick Trade
        </div>
      )}

      {/* Turbo Panel */}
      {turboOpen && (
        <TurboPanel
          ticker={selectedTicker}
          currentPrice={currentPrice}
          balance={balance}
          positions={positionsWithLivePrice}
          onOrder={handleTurboOrder}
          onClose={() => setTurboOpen(false)}
        />
      )}

      {/* Blocked Order Modal */}
      {blockedMsg && (
        <BlockedModal message={blockedMsg} onDismiss={() => setBlockedMsg(null)} />
      )}

      {/* Auth Modal — shown when anonymous user hits 5-trade limit */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Simulator;
