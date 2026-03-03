import { useState } from "react";
import { X, Minus, Plus, Zap } from "lucide-react";
import type { Position } from "@/pages/Simulator";

interface TurboPanelProps {
  ticker: string;
  currentPrice: number;
  balance: number;
  positions: Position[];
  onOrder: (side: "buy" | "sell", qty: number, execPrice: number) => void;
  onClose: () => void;
}

const QUICK_QTY = [1, 5, 10, 25, 50, 100];

export default function TurboPanel({
  ticker,
  currentPrice,
  balance,
  positions,
  onOrder,
  onClose,
}: TurboPanelProps) {
  const [qty, setQty] = useState(1);

  const held = positions
    .filter((p) => p.ticker === ticker)
    .reduce((s, p) => s + p.quantity, 0);

  const avgEntry = held > 0
    ? positions
        .filter((p) => p.ticker === ticker)
        .reduce((s, p) => s + p.entryPrice * p.quantity, 0) / held
    : 0;

  const livePnL = held > 0 ? (currentPrice - avgEntry) * held : 0;

  // Simulated bid/ask spread: ±$0.01
  const ask = currentPrice + 0.01;
  const bid = currentPrice - 0.01;

  const clampQty = (v: number) => Math.max(1, Math.floor(v));

  const fire = (side: "buy" | "sell", price: number) => {
    if (qty <= 0 || price <= 0) return;
    onOrder(side, qty, price);
  };

  const closeAll = () => {
    if (held <= 0) return;
    onOrder("sell", held, bid);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-950 border-t-2 border-zinc-700 rounded-t-2xl pb-safe"
        style={{
          boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white text-lg">Turbo</span>
            <span className="text-zinc-400 font-semibold">{ticker}</span>
          </div>
          <div className="flex items-center gap-4">
            {currentPrice > 0 && (
              <span className="text-white font-bold text-lg">${currentPrice.toFixed(2)}</span>
            )}
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* ── Bid / Ask strip ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="bg-green-950/60 border border-green-800/40 rounded-lg p-2">
              <p className="text-green-400 font-bold text-base">${bid.toFixed(2)}</p>
              <p className="text-green-600 mt-0.5">Bid</p>
            </div>
            <div className="bg-red-950/60 border border-red-800/40 rounded-lg p-2">
              <p className="text-red-400 font-bold text-base">${ask.toFixed(2)}</p>
              <p className="text-red-600 mt-0.5">Ask</p>
            </div>
          </div>

          {/* ── Quantity ──────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2">
              <button
                onClick={() => setQty(clampQty(qty - 1))}
                className="text-zinc-300 hover:text-white p-1 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-center">
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(clampQty(parseFloat(e.target.value) || 1))}
                  className="bg-transparent text-white text-xl font-bold text-center w-20 outline-none"
                />
                <p className="text-zinc-500 text-xs">shares</p>
              </div>
              <button
                onClick={() => setQty(clampQty(qty + 1))}
                className="text-zinc-300 hover:text-white p-1 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick qty presets */}
            <div className="grid grid-cols-6 gap-1.5 mt-2">
              {QUICK_QTY.map((q) => (
                <button
                  key={q}
                  onClick={() => setQty(q)}
                  className={`py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    qty === q
                      ? "bg-zinc-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main buttons ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Row 1 */}
            <button
              onClick={() => fire("buy", currentPrice)}
              disabled={currentPrice <= 0}
              className="py-4 rounded-xl font-bold text-white text-base bg-green-600 hover:bg-green-500 active:scale-95 transition-all disabled:opacity-40"
            >
              Buy MKT
            </button>
            <button
              onClick={() => fire("sell", currentPrice)}
              disabled={currentPrice <= 0}
              className="py-4 rounded-xl font-bold text-white text-base bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all disabled:opacity-40"
            >
              Sell MKT
            </button>

            {/* Row 2 */}
            <button
              onClick={() => fire("buy", ask)}
              disabled={currentPrice <= 0}
              className="py-3.5 rounded-xl font-semibold text-white text-sm bg-green-800 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-40"
            >
              Buy Ask&nbsp;
              <span className="text-green-400 text-xs font-bold">${ask.toFixed(2)}</span>
            </button>
            <button
              onClick={() => fire("sell", bid)}
              disabled={currentPrice <= 0}
              className="py-3.5 rounded-xl font-semibold text-white text-sm bg-rose-800 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-40"
            >
              Sell Bid&nbsp;
              <span className="text-rose-400 text-xs font-bold">${bid.toFixed(2)}</span>
            </button>

            {/* Row 3 */}
            <button
              onClick={() => fire("buy", bid)}
              disabled={currentPrice <= 0}
              className="py-3 rounded-xl font-semibold text-green-300 text-sm bg-zinc-800 border border-green-800/50 hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-40"
            >
              Buy Bid&nbsp;
              <span className="text-xs font-bold">${bid.toFixed(2)}</span>
            </button>
            <button
              onClick={() => fire("sell", ask)}
              disabled={currentPrice <= 0}
              className="py-3 rounded-xl font-semibold text-rose-300 text-sm bg-zinc-800 border border-rose-800/50 hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-40"
            >
              Sell Ask&nbsp;
              <span className="text-xs font-bold">${ask.toFixed(2)}</span>
            </button>
          </div>

          {/* ── Bottom row ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={closeAll}
              disabled={held <= 0}
              className="py-3 rounded-xl font-bold text-white text-sm bg-zinc-700 hover:bg-zinc-600 active:scale-95 transition-all disabled:opacity-30"
            >
              {held > 0 ? `Close All (${held} shares)` : "No Position"}
            </button>
            <button
              onClick={onClose}
              className="py-3 rounded-xl font-semibold text-zinc-300 text-sm bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all"
            >
              Done
            </button>
          </div>

          {/* ── Position info ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between text-xs border-t border-zinc-800 pt-3 pb-1">
            <span className="text-zinc-500">
              Holding: <span className="text-white font-semibold">{held} shares</span>
              {held > 0 && <span className="text-zinc-400"> @ ${avgEntry.toFixed(2)}</span>}
            </span>
            {held > 0 && (
              <span className={`font-bold ${livePnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                {livePnL >= 0 ? "+" : ""}${livePnL.toFixed(2)}
              </span>
            )}
            <span className="text-zinc-500">
              Cash: <span className="text-white font-semibold">${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
