/**
 * Market API Service - Connects to Python Backend for REAL Yahoo Finance Data
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface StockQuote {
  ticker: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap: string | number;
  peRatio: string | number;
  dividendYield: number;
  week52High: string | number;
  week52Low: string | number;
  beta: string | number;
  timestamp: string;
}

export interface HistoricalDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalData {
  ticker: string;
  period: string;
  interval: string;
  data: HistoricalDataPoint[];
}

export interface LivePrice {
  ticker: string;
  price: number;
  timestamp: string;
}

/**
 * Fetch current stock quote with all metrics
 */
export async function getStockQuote(ticker: string): Promise<StockQuote> {
  const response = await fetch(`${API_BASE_URL}/quote/${ticker}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch quote for ${ticker}`);
  }
  
  return response.json();
}

/**
 * Fetch historical data for charts
 * @param ticker - Stock ticker symbol
 * @param period - Time period (1d, 5d, 1mo, 3mo, 1y)
 * @param interval - Data interval (1m, 5m, 15m, 1h, 1d)
 */
export async function getHistoricalData(
  ticker: string,
  period: string = '1d',
  interval: string = '5m'
): Promise<HistoricalData> {
  const response = await fetch(
    `${API_BASE_URL}/history/${ticker}?period=${period}&interval=${interval}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch historical data for ${ticker}`);
  }
  
  return response.json();
}

/**
 * Fetch just the current price (lightweight for frequent updates)
 */
export async function getLivePrice(ticker: string): Promise<LivePrice> {
  const response = await fetch(`${API_BASE_URL}/live/${ticker}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch live price for ${ticker}`);
  }
  
  return response.json();
}

/**
 * Search for ticker symbols
 */
export async function searchTicker(query: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/search?q=${query}`);
  
  if (!response.ok) {
    throw new Error('Search failed');
  }
  
  const data = await response.json();
  return data.results || [];
}

/**
 * Check if backend is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
