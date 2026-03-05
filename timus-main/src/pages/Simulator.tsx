import { useState, useRef, useEffect, useCallback } from "react";
import { Zap, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import SimulatorHeader from "@/components/simulator/SimulatorHeader";
import ChartPanel from "@/components/simulator/ChartPanel";
import OrderPanel from "@/components/simulator/OrderPanel";
import PositionsPanel from "@/components/simulator/PositionsPanel";
import TurboPanel from "@/components/simulator/TurboPanel";
import { useToast } from "@/hooks/use-toast";

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

  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const selectedTickerRef = useRef("AAPL");

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
  const pricesByTickerRef = useRef<Record<string, number>>({});
  const workingOrdersRef = useRef<Order[]>([]);

  // ── Persist to localStorage ─────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("timus_positions", JSON.stringify(positions));
    positionsRef.current = positions;
  }, [positions]);

  useEffect(() => {
    localStorage.setItem("timus_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("timus_balance", JSON.stringify(balance));
    balanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("timus_initial_balance", JSON.stringify(initialBalance));
  }, [initialBalance]);

  // ── Ticker change ───────────────────────────────────────────────────────
  const handleTickerChange = (ticker: string) => {
    selectedTickerRef.current = ticker;
    setSelectedTicker(ticker);
  };

  // ── Balance edit ────────────────────────────────────────────────────────
  const handleBalanceChange = (newBalance: number) => {
    balanceRef.current = newBalance;
    setBalance(newBalance);
    setInitialBalance(newBalance);
  };

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
        id: Math.random().toString(36).substr(2, 9),
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
  }, [toast]);

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

  // ── Place order (entry point from OrderPanel) ──────────────────────────
  const handlePlaceOrder = (order: Omit<Order, "id" | "status" | "timestamp">) => {
    // Market hours gate
    if (!isMarketOpen()) {
      setBlockedMsg("ORDER NOT FILLED — NEW YORK SESSION CLOSED");
      return;
    }

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
      id: Math.random().toString(36).substr(2, 9),
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
    if (!isMarketOpen()) {
      setBlockedMsg("ORDER NOT FILLED — NEW YORK SESSION CLOSED");
      return;
    }
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
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
        />

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart + Positions */}
            <div className="lg:col-span-2 space-y-6">
              <ChartPanel ticker={selectedTicker} onPriceUpdate={handlePriceUpdate} />
              <PositionsPanel
                positions={positionsWithLivePrice}
                onClosePosition={handleClosePosition}
              />
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

          {/* Orders Table */}
          <div className="mt-8">
            <div className="p-6 rounded-lg border-2 border-border bg-card">
              <h3 className="text-xl font-bold text-foreground mb-4">Order History</h3>
              <div className="space-y-2">
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                ) : (
                  orders
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 rounded bg-muted/50"
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-foreground w-16">{order.ticker}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              order.side === "buy"
                                ? "bg-success/20 text-success"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {order.side.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            {order.type}
                          </span>
                          <span className="text-sm text-foreground font-medium">
                            {order.quantity} shares
                          </span>
                          {order.price != null && (
                            <span className="text-sm text-muted-foreground">
                              @ ${order.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold shrink-0 ${
                            order.status === "filled"
                              ? "bg-success/20 text-success"
                              : order.status === "working"
                              ? "bg-yellow-400/20 text-yellow-600"
                              : order.status === "pending"
                              ? "bg-blue-400/20 text-blue-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Turbo FAB — always visible while on simulator */}
      {!turboOpen && (
        <button
          onClick={() => setTurboOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white text-sm bg-yellow-500 hover:bg-yellow-400 active:scale-95 transition-all shadow-2xl"
          style={{ boxShadow: "0 4px 24px rgba(234,179,8,0.4)" }}
        >
          <Zap className="w-4 h-4" />
          Turbo
        </button>
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
    </div>
  );
};

export default Simulator;
