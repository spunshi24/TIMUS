import type { Position } from "@/pages/Simulator";

// Merge duplicate position entries for the same ticker into one row (avg cost).
// Shared by the Portfolio page and the Stock Positions widget.
export function aggregatePositions(
  positions: Position[],
): Map<string, { shares: number; avgCost: number }> {
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
