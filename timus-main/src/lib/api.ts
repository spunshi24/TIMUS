// In dev, VITE_API_URL is empty so fetch calls hit the Vite proxy (→ localhost:5000).
// In production (GitHub Pages), VITE_API_URL is set to the hosted Render backend URL.
export const API_BASE = (import.meta.env.VITE_API_URL as string) || "";

// ─── Session-expiry handling ────────────────────────────────────────────────
// AuthContext registers a handler here so any authenticated request that comes
// back 401 (token expired, revoked via logout, or rejected after a secret
// rotation) forces a client-side logout + re-auth prompt instead of leaving the
// UI stuck on silently-failing calls.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

/**
 * fetch() wrapper for requests that carry a session token. On a 401 it invokes
 * the registered unauthorized handler (clear session + open the login modal),
 * then returns the response so callers keep their existing error handling.
 * Use plain fetch() for public endpoints and for the auth endpoints themselves.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    unauthorizedHandler?.();
  }
  return res;
}

export interface Quote {
  ticker: string;
  name: string;
  price: number | null;
  change: number | null;
  change_pct: number | null;
  [key: string]: unknown;
}

// Server caps /api/quotes at 60 tickers per request
const QUOTES_BATCH_MAX = 60;

/**
 * Fetch quotes for many tickers in one request via GET /api/quotes.
 * Returns a map keyed by ticker; tickers the server couldn't quote are absent.
 * Never throws — a failed request yields an empty (or partial) map.
 */
export async function fetchQuotes(tickers: string[]): Promise<Record<string, Quote>> {
  const unique = [...new Set(tickers.map((t) => t.toUpperCase().trim()).filter(Boolean))];
  if (unique.length === 0) return {};

  const out: Record<string, Quote> = {};
  for (let i = 0; i < unique.length; i += QUOTES_BATCH_MAX) {
    const chunk = unique.slice(i, i + QUOTES_BATCH_MAX);
    try {
      const res = await fetch(`${API_BASE}/api/quotes?tickers=${encodeURIComponent(chunk.join(","))}`);
      if (!res.ok) continue;
      Object.assign(out, await res.json());
    } catch {
      // best-effort — callers treat missing tickers as "no data yet"
    }
  }
  return out;
}
