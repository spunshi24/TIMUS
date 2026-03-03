import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { getStockQuote, getHistoricalData, getLivePrice, type StockQuote, type HistoricalDataPoint } from "@/services/marketApi";

interface ChartPanelProps {
  ticker: string;
  onPriceUpdate?: (price: number) => void;
}

const ChartPanel = ({ ticker, onPriceUpdate }: ChartPanelProps) => {
  const [priceData, setPriceData] = useState<HistoricalDataPoint[]>([]);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data when ticker changes
  useEffect(() => {
    loadStockData();
    const interval = setInterval(loadStockData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [ticker]);

  // Update live price more frequently
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const livePrice = await getLivePrice(ticker);
        if (onPriceUpdate) {
          onPriceUpdate(livePrice.price);
        }
        
        // Update quote with new price
        if (quote) {
          setQuote(prev => prev ? { ...prev, price: livePrice.price } : null);
        }
      } catch (err) {
        console.error("Failed to update live price:", err);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [ticker, quote, onPriceUpdate]);

  const loadStockData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both quote and historical data
      const [quoteData, histData] = await Promise.all([
        getStockQuote(ticker),
        getHistoricalData(ticker, '1d', '5m')
      ]);

      setQuote(quoteData);
      setPriceData(histData.data);
      
      if (onPriceUpdate) {
        onPriceUpdate(quoteData.price);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading stock data:", err);
      setError("Failed to load data. Please check ticker symbol.");
      setLoading(false);
    }
  };

  if (loading && !quote) {
    return (
      <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading real market data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg border-2 border-destructive bg-card shadow-lg">
        <div className="text-center">
          <p className="text-destructive font-semibold">{error}</p>
          <button 
            onClick={loadStockData}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!quote || priceData.length === 0) {
    return null;
  }

  // Calculate chart dimensions
  const prices = priceData.map(d => d.close);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const width = 800;
  const height = 400;

  // Generate SVG points for the price line
  const points = priceData
    .map((dataPoint, index) => {
      const x = (index / (priceData.length - 1)) * width;
      const y = height - ((dataPoint.close - minPrice) / priceRange) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const isPositive = quote.change >= 0;

  return (
    <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{ticker.toUpperCase()}</h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-2xl font-bold text-foreground">
              ${quote.price.toFixed(2)}
            </span>
            <span
              className={`flex items-center gap-1 text-lg font-semibold ${
                isPositive ? "text-success" : "text-destructive"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              {isPositive ? "+" : ""}
              {quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="px-4 py-2 rounded-lg bg-success/10">
          <span className="text-xs font-semibold text-success uppercase tracking-wide">
            ✓ LIVE YAHOO FINANCE DATA
          </span>
        </div>
      </div>

      {/* Stock Metrics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Beta</p>
          <p className="text-sm font-bold text-foreground">
            {typeof quote.beta === 'number' ? quote.beta.toFixed(2) : 'N/A'}
          </p>
        </div>
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">52W High</p>
          <p className="text-sm font-bold text-success">
            ${typeof quote.week52High === 'number' ? quote.week52High.toFixed(2) : 'N/A'}
          </p>
        </div>
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">52W Low</p>
          <p className="text-sm font-bold text-destructive">
            ${typeof quote.week52Low === 'number' ? quote.week52Low.toFixed(2) : 'N/A'}
          </p>
        </div>
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
          <p className="text-sm font-bold text-foreground">
            {typeof quote.marketCap === 'number' 
              ? `$${(quote.marketCap / 1e9).toFixed(1)}B` 
              : 'N/A'}
          </p>
        </div>
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">P/E Ratio</p>
          <p className="text-sm font-bold text-foreground">
            {typeof quote.peRatio === 'number' ? quote.peRatio.toFixed(2) : 'N/A'}
          </p>
        </div>
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Div Yield</p>
          <p className="text-sm font-bold text-foreground">
            {quote.dividendYield.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full overflow-hidden rounded-lg bg-muted/20 p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ minHeight: "300px" }}
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Price line */}
          <polyline
            points={points}
            fill="none"
            stroke={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Area under line */}
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
            opacity="0.1"
          />

          {/* Current price indicator */}
          {priceData.length > 0 && (
            <circle
              cx={(priceData.length - 1) * (width / (priceData.length - 1))}
              cy={
                height -
                ((priceData[priceData.length - 1].close - minPrice) / priceRange) * height
              }
              r="6"
              fill={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
              stroke="white"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>

      {/* Chart Info */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Open</p>
          <p className="text-sm font-bold text-foreground">
            ${quote.open.toFixed(2)}
          </p>
        </div>
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">High</p>
          <p className="text-sm font-bold text-success">${maxPrice.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Low</p>
          <p className="text-sm font-bold text-destructive">${minPrice.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Volume</p>
          <p className="text-sm font-bold text-foreground">
            {(quote.volume / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;
