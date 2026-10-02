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

// ─── Research & News (Section G) ────────────────────────────────────────────
// Public endpoints (no auth). One stored edition per ET calendar day.

export interface NewsArticle {
  id: number | string;
  ticker: string | null;
  headline: string;
  source: string | null;
  url: string;
  summary: string | null;
  image: string | null;
  published_at: string | null;
}

export interface NewsSection {
  featured: NewsArticle[];
  more: NewsArticle[];
}

export interface NewsEdition {
  date: string;
  status: "ready";
  lede: NewsArticle | null;
  top: NewsArticle[];
  sections: Record<string, NewsSection>;
  built_at: string | null;
}

export type NewsEditionResult =
  | { kind: "ready"; edition: NewsEdition }
  | { kind: "building"; latest: string | null }
  | { kind: "unavailable"; latest: string | null }
  | { kind: "notFound" }
  | { kind: "error" };

export interface NewsSector {
  name: string;
  tickers: string[];
}

export interface NewsSearchResponse {
  query: string;
  kind: "ticker" | "keyword";
  results: NewsArticle[];
}

/** Dates (YYYY-MM-DD) that have a ready edition, newest first. [] on failure. */
export async function fetchNewsEditions(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/news/editions`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.dates) ? data.dates : [];
  } catch {
    return [];
  }
}

/** One day's paper (today, ET, when date is omitted). Never throws. */
export async function fetchNewsEdition(date?: string): Promise<NewsEditionResult> {
  try {
    const qs = date ? `?date=${encodeURIComponent(date)}` : "";
    const res = await fetch(`${API_BASE}/api/news/edition${qs}`);
    // 400 = malformed or future date: same reader-facing state as "no edition"
    if (res.status === 404 || res.status === 400) return { kind: "notFound" };
    if (!res.ok && res.status !== 202) return { kind: "error" };
    const data = await res.json();
    if (data.status === "ready") return { kind: "ready", edition: data as NewsEdition };
    if (data.status === "building") return { kind: "building", latest: data.latest ?? null };
    if (data.status === "unavailable") return { kind: "unavailable", latest: data.latest ?? null };
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}

/** Ticker or keyword news search. Throws on network/server error. */
export async function searchNews(q: string): Promise<NewsSearchResponse> {
  const res = await fetch(`${API_BASE}/api/news/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`News search failed (${res.status})`);
  return res.json();
}

/** Ordered sector universe shared with the backend. [] on failure. */
export async function fetchNewsSectors(): Promise<NewsSector[]> {
  try {
    const res = await fetch(`${API_BASE}/api/news/sectors`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.sectors) ? data.sectors : [];
  } catch {
    return [];
  }
}
