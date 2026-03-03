import { useEffect, useState } from "react";
import { TrendingUp, Bitcoin, DollarSign, Gem, Droplet, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import marketViz from "@/assets/market-viz.jpg";
import cryptoForex from "@/assets/crypto-forex.jpg";

// Returns true if US stock market is currently open (Eastern Time, Mon–Fri 9:30–16:00)
function useMarketStatus() {
  const [isOpen, setIsOpen] = useState(false);

  const check = () => {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = et.getDay(); // 0 Sun, 6 Sat
    const mins = et.getHours() * 60 + et.getMinutes();
    setIsOpen(day >= 1 && day <= 5 && mins >= 570 && mins < 960); // 9:30–16:00
  };

  useEffect(() => {
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  return isOpen;
}

const LiveBadge = ({ open }: { open: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
      open
        ? "bg-green-500/15 text-green-600 border border-green-500/30"
        : "bg-muted text-muted-foreground border border-border"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        open ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
      }`}
    />
    {open ? "Now Live" : "Market Closed"}
  </span>
);

const SoonBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
    Launching Soon
  </span>
);

const MarketsSection = () => {
  const marketOpen = useMarketStatus();

  const markets = [
    {
      icon: TrendingUp,
      title: "Stocks & ETFs",
      description:
        "Practice trading real listed stocks and ETFs with live Yahoo Finance prices. S&P 500, Nasdaq, and more — no real money required.",
      live: true,
    },
    {
      icon: Bitcoin,
      title: "Cryptocurrency",
      description:
        "Trade Bitcoin, Ethereum, and other major cryptocurrencies. Coming soon to TiMUS.",
      live: false,
    },
    {
      icon: DollarSign,
      title: "Forex",
      description:
        "Master currency pairs and foreign exchange trading. Coming soon to TiMUS.",
      live: false,
    },
    {
      icon: Gem,
      title: "Commodities",
      description:
        "Trade gold, silver, and precious metals. Coming soon to TiMUS.",
      live: false,
    },
    {
      icon: Droplet,
      title: "Energy & Oil",
      description:
        "Explore crude oil, natural gas, and energy markets. Coming soon to TiMUS.",
      live: false,
    },
    {
      icon: BarChart3,
      title: "Indices",
      description:
        "Practice with S&P 500, Nasdaq, and Dow Jones index products. Coming soon to TiMUS.",
      live: false,
    },
  ];

  return (
    <section id="markets" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Multi-Asset Trading
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Currently live for stocks and ETFs — more asset classes launching soon
          </p>
          <div className="h-1 w-24 bg-foreground mx-auto rounded-full mt-6" />
        </div>

        {/* Markets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {markets.map((market, index) => (
            <div
              key={index}
              className={`group p-6 rounded-lg border-2 bg-card transition-all duration-300 relative ${
                market.live
                  ? "border-border hover:border-foreground/30 hover:shadow-md"
                  : "border-border/50 opacity-70"
              }`}
            >
              {/* Badge top-right */}
              <div className="absolute top-4 right-4">
                {market.live ? <LiveBadge open={marketOpen} /> : <SoonBadge />}
              </div>

              <market.icon
                className={`w-10 h-10 mb-4 ${market.live ? "text-foreground" : "text-muted-foreground"}`}
              />
              <h3 className="text-xl font-semibold text-foreground mb-2 pr-24">{market.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{market.description}</p>
            </div>
          ))}
        </div>

        {/* Featured visuals */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="relative rounded-lg overflow-hidden border border-border group">
            <img
              src={marketViz}
              alt="Market Visualization"
              className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h4 className="text-2xl font-bold text-foreground mb-2">Live Charts</h4>
              <p className="text-muted-foreground text-sm">
                Intraday price data from Yahoo Finance, refreshed every 30 seconds
              </p>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-border group">
            <img
              src={cryptoForex}
              alt="Coming Soon"
              className="w-full h-64 object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h4 className="text-2xl font-bold text-foreground mb-2">More Coming Soon</h4>
              <p className="text-muted-foreground text-sm">
                Crypto, Forex, Commodities, and Indices — all in development
              </p>
            </div>
          </div>
        </div>

        {/* Trading Modes */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-lg border-2 border-border bg-card">
            <div className="inline-block px-3 py-1 rounded-full bg-muted text-foreground text-xs font-bold mb-4 tracking-widest uppercase">
              Classic Mode
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Deliberate Trading</h3>
            <p className="text-muted-foreground mb-4">
              Take your time to analyze charts, study market conditions, and execute thoughtful
              trades. Perfect for learning long-term investment strategies.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-foreground" />Extended time to analyze positions</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-foreground" />Focus on strategy development</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-foreground" />Ideal for swing and position trading</li>
            </ul>
          </div>

          <div className="p-8 rounded-lg border-2 border-border bg-card">
            <div className="inline-block px-3 py-1 rounded-full bg-foreground text-background text-xs font-bold mb-4 tracking-widest uppercase">
              Turbo Mode
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Fast-Paced Intraday</h3>
            <p className="text-muted-foreground mb-4">
              Quick-fire order entry with one-click Buy MKT / Sell MKT buttons. Practice day
              trading and scalping with speed — just like a real trading desk.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-foreground" />One-click Buy / Sell at market price</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-foreground" />Ask / Bid spread simulation</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-foreground" />Instant position close button</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button variant="default" size="lg" asChild>
            <Link to="/simulator">Start Trading</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MarketsSection;
