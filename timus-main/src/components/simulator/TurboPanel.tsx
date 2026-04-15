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

  const clampQty = (v: number) => Math.max(1, Math.floor(v));

  const fire = (side: "buy" | "sell") => {
    if (qty <= 0 || currentPrice <= 0) return;
    onOrder(side, qty, currentPrice);
  };

  const closeAll = () => {
    if (held <= 0) return;
    onOrder("sell", held, currentPrice);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-700 rounded-2xl overflow-y-auto"
        style={{
          maxHeight: "90vh",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
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
            <button
              onClick={() => fire("buy")}
              disabled={currentPrice <= 0}
              className="py-5 rounded-xl font-bold text-white text-lg bg-green-600 hover:bg-green-500 active:scale-95 transition-all disabled:opacity-40"
            >
              Buy
            </button>
            <button
              onClick={() => fire("sell")}
              disabled={currentPrice <= 0}
              className="py-5 rounded-xl font-bold text-white text-lg bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all disabled:opacity-40"
            >
              Sell
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
