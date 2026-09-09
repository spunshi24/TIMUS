// Shared local/backend order-merge logic used by Simulator and Portfolio.
// Guarantees: an order present in only one source is never dropped, and a
// "filled" copy is never overwritten by a stale non-filled copy of itself.
export interface MergeableOrder {
  id?: unknown;
  status?: unknown;
  [key: string]: unknown;
}

export function mergeOrders(
  backendOrders: MergeableOrder[],
  localOrders: MergeableOrder[],
): MergeableOrder[] {
  const byId = new Map<string, MergeableOrder>();
  const keyless: MergeableOrder[] = [];

  const absorb = (o: MergeableOrder) => {
    const id = typeof o.id === "string" ? o.id : null;
    if (!id) {
      // No usable id — keep it rather than risk dropping a real trade.
      keyless.push(o);
      return;
    }
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, o);
      return;
    }
    // Conflict: a filled order must never revert to pending/working/cancelled.
    if (existing.status === "filled" && o.status !== "filled") return;
    byId.set(id, o);
  };

  // Backend first, then local — local wins ties unless it would un-fill an order.
  for (const o of backendOrders) absorb(o);
  for (const o of localOrders) absorb(o);

  return [...byId.values(), ...keyless];
}
