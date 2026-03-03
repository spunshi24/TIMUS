import { useState, useRef, useEffect, useCallback } from "react";
import { Zap } from "lucide-react";
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
    // Revive Date objects for positions/orders
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

  // Per-ticker live prices so positions across all tickers show correct P&L
  const [pricesByTicker, setPricesByTicker] = useState<Record<string, number>>({});
  const [turboOpen, setTurboOpen] = useState(false);

  // Refs — avoid stale closures inside callbacks
  const balanceRef = useRef(balance);
  const positionsRef = useRef<Position[]>(positions);
  const pricesByTickerRef = useRef<Record<string, number>>({});
  // Working orders (limit/stop not yet triggered)
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
  // Called when an order should execute. Uses refs to avoid stale state.
  const fillOrder = useCallback((order: Order, executionPrice: number) => {
    // Mark filled
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: "filled" as const } : o))
    );

    if (order.side === "buy") {
      const cost = executionPrice * order.quantity;
      if (cost > balanceRef.current) {
        toast({
          title: "Insufficient Funds",
          description: `Need $${cost.toFixed(2)}, have $${balanceRef.current.toFixed(2)}`,
          variant: "destructive",
        });
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
        toast({
          title: "Insufficient Shares",
          description: `You only have ${pos?.quantity ?? 0} shares of ${order.ticker}`,
          variant: "destructive",
        });
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
        // Buy limit: fill when price falls to/below the limit price
        // Sell limit: fill when price rises to/above the limit price
        fires =
          (order.side === "buy" && price <= trigger) ||
          (order.side === "sell" && price >= trigger);
      } else if (order.type === "stop") {
        // Stop sell (stop-loss): triggers when price falls to/below stop
        // Stop buy  (breakout): triggers when price rises to/above stop
        fires =
          (order.side === "sell" && price <= trigger) ||
          (order.side === "buy" && price >= trigger);
      }

      if (fires) {
        // Mark as pending (transitioning) then fill at current market price
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
    const livePrice = pricesByTickerRef.current[order.ticker] ?? 0;

    if (livePrice <= 0) {
      toast({
        title: "Price unavailable",
        description: "Live price not yet loaded. Wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate limit/stop price
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
      // Execute at exact live price — no hidden slippage
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
      // Buy limit: fills if market is at or BELOW the limit (you get ≤ what you're willing to pay)
      // Sell limit: fills if market is at or ABOVE the limit (you get ≥ what you want)
      const immediatelyFillable =
        (order.side === "buy" && livePrice <= triggerPrice) ||
        (order.side === "sell" && livePrice >= triggerPrice);

      if (immediatelyFillable) {
        // Fill at the current market price (better than or equal to limit)
        const execPrice =
          order.side === "buy"
            ? Math.min(livePrice, triggerPrice)   // pay the lower of the two
            : Math.max(livePrice, triggerPrice);  // receive the higher of the two
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
          description: `${order.side === "buy" ? "Buy" : "Sell"} ${order.quantity} ${order.ticker} — waiting for price to reach $${triggerPrice.toFixed(2)} (now $${livePrice.toFixed(2)})`,
        });
      }
      return;
    }

    // ── Stop order ───────────────────────────────────────────────────────
    if (order.type === "stop") {
      // Stop sell (stop-loss): triggers when price DROPS to/below stop price
      // Stop buy (breakout entry): triggers when price RISES to/above stop price
      const alreadyTriggered =
        (order.side === "sell" && livePrice <= triggerPrice) ||
        (order.side === "buy" && livePrice >= triggerPrice);

      if (alreadyTriggered) {
        // Stop already triggered — fill at market immediately
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

  // ── Turbo order (direct fill at specified execution price) ────────────
  const handleTurboOrder = (side: "buy" | "sell", qty: number, execPrice: number) => {
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

  // Each position gets the latest price for its own ticker, falls back to entry price
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
            <div className="lg:col-span-1 space-y-4">
              <OrderPanel
                ticker={selectedTicker}
                balance={balance}
                currentPrice={currentPrice}
                onPlaceOrder={handlePlaceOrder}
              />
              {/* Turbo Button */}
              <button
                onClick={() => setTurboOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm bg-yellow-500 hover:bg-yellow-400 active:scale-95 transition-all shadow-lg"
              >
                <Zap className="w-4 h-4" />
                Turbo Trade
              </button>
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
    </div>
  );
};

export default Simulator;
