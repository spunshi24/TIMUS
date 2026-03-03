import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface OrderPanelProps {
  ticker: string;
  balance: number;
  currentPrice: number;
  onPlaceOrder: (order: {
    ticker: string;
    type: "market" | "limit" | "stop";
    side: "buy" | "sell";
    quantity: number;
    price?: number;
  }) => void;
}

const ORDER_HINTS: Record<string, string> = {
  market: "Fills immediately at the current market price.",
  limit:
    "Buy limit: fills when price drops to your price or lower.\nSell limit: fills when price rises to your price or higher.",
  stop:
    "Stop-loss sell: triggers when price falls to your stop.\nStop buy: triggers when price rises to your stop.",
};

const OrderPanel = ({ ticker, balance, currentPrice, onPlaceOrder }: OrderPanelProps) => {
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");

  const qty = parseInt(quantity) || 0;
  const parsedLimitPrice = parseFloat(limitPrice);

  // Estimated cost / proceeds for display
  const execPrice =
    orderType === "market"
      ? currentPrice
      : isNaN(parsedLimitPrice)
      ? 0
      : parsedLimitPrice;

  const estimatedTotal = qty > 0 && execPrice > 0 ? qty * execPrice : null;
  const canAfford = estimatedTotal != null && estimatedTotal <= balance;

  // Warn user when limit/stop price seems wrong
  const limitWarning = (() => {
    if (orderType === "market" || isNaN(parsedLimitPrice) || parsedLimitPrice <= 0 || currentPrice <= 0) return null;
    if (orderType === "limit") {
      // Unusual but not wrong — just inform
      if (parsedLimitPrice > currentPrice * 1.1)
        return `Limit $${parsedLimitPrice.toFixed(2)} is >10% above current price ($${currentPrice.toFixed(2)}). A buy limit this high will fill immediately.`;
      if (parsedLimitPrice < currentPrice * 0.5)
        return `Limit $${parsedLimitPrice.toFixed(2)} is >50% below current price. It may never fill.`;
    }
    if (orderType === "stop") {
      if (parsedLimitPrice > currentPrice * 1.5)
        return `Stop $${parsedLimitPrice.toFixed(2)} is far above current price ($${currentPrice.toFixed(2)}).`;
      if (parsedLimitPrice < currentPrice * 0.3)
        return `Stop $${parsedLimitPrice.toFixed(2)} is far below current price. It may never trigger.`;
    }
    return null;
  })();

  const handleSubmit = (side: "buy" | "sell") => {
    if (!qty || qty <= 0) {
      alert("Enter a valid quantity (≥ 1).");
      return;
    }
    if (orderType !== "market") {
      if (!limitPrice || isNaN(parsedLimitPrice) || parsedLimitPrice <= 0) {
        alert(`Enter a valid ${orderType === "limit" ? "limit" : "stop"} price.`);
        return;
      }
    }

    onPlaceOrder({
      ticker,
      type: orderType,
      side,
      quantity: qty,
      price: orderType !== "market" ? parsedLimitPrice : undefined,
    });

    setQuantity("");
    setLimitPrice("");
  };

  return (
    <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg sticky top-24">
      <h3 className="text-2xl font-bold text-foreground mb-1">Place Order</h3>

      {/* Current price ticker display */}
      <div className="mb-5 p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Trading</p>
          <p className="text-xl font-bold text-foreground">{ticker}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Live Price</p>
          <p className="text-xl font-bold text-foreground">
            {currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : "—"}
          </p>
        </div>
      </div>

      {/* Order Type */}
      <div className="mb-4">
        <Label className="text-sm font-semibold text-foreground mb-2 block">Order Type</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["market", "limit", "stop"] as const).map((type) => (
            <Button
              key={type}
              variant={orderType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
        {/* Hint */}
        <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span style={{ whiteSpace: "pre-line" }}>{ORDER_HINTS[orderType]}</span>
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <Label htmlFor="quantity" className="text-sm font-semibold text-foreground mb-2 block">
          Quantity (shares)
        </Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
          className="h-12 text-lg border-2"
        />
      </div>

      {/* Limit / Stop Price */}
      {orderType !== "market" && (
        <div className="mb-4">
          <Label htmlFor="price" className="text-sm font-semibold text-foreground mb-2 block">
            {orderType === "limit" ? "Limit" : "Stop"} Price ($)
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={currentPrice > 0 ? `e.g. ${currentPrice.toFixed(2)}` : "Enter price"}
            className="h-12 text-lg border-2"
          />
          {limitWarning && (
            <p className="text-xs text-yellow-600 mt-1 flex items-start gap-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {limitWarning}
            </p>
          )}
        </div>
      )}

      {/* Estimated cost / proceeds */}
      {estimatedTotal != null && estimatedTotal > 0 && (
        <div
          className={`mb-4 p-3 rounded border text-sm ${
            canAfford
              ? "border-success/30 bg-success/5 text-success"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          <span className="font-semibold">
            Est. {orderType === "market" ? "cost/proceeds" : "value"}:
          </span>{" "}
          ${estimatedTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          {!canAfford && " — insufficient balance"}
        </div>
      )}

      {/* Buy / Sell */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Button
          variant="success"
          size="lg"
          onClick={() => handleSubmit("buy")}
          className="h-14 text-lg font-bold gap-2"
          disabled={currentPrice <= 0}
        >
          <TrendingUp className="w-5 h-5" />
          BUY
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => handleSubmit("sell")}
          className="h-14 text-lg font-bold gap-2"
          disabled={currentPrice <= 0}
        >
          <TrendingDown className="w-5 h-5" />
          SELL
        </Button>
      </div>

      {/* Balance */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available Balance</span>
          <span className="text-sm font-bold text-foreground">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Quick quantity */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Quick Quantity</p>
        <div className="grid grid-cols-4 gap-2">
          {[1, 5, 10, 25].map((q) => (
            <Button
              key={q}
              variant="outline"
              size="sm"
              onClick={() => setQuantity(q.toString())}
            >
              {q}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;
