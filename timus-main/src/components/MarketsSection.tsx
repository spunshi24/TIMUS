import { TrendingUp, Bitcoin, DollarSign, Gem, Droplet, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import marketViz from "@/assets/market-viz.jpg";
import cryptoForex from "@/assets/crypto-forex.jpg";

const MarketsSection = () => {
  const markets = [
    {
      icon: TrendingUp,
      title: "Stocks & ETFs",
      description: "Trade individual stocks and exchange-traded funds from major exchanges worldwide",
      color: "text-primary",
      image: marketViz
    },
    {
      icon: Bitcoin,
      title: "Cryptocurrency",
      description: "Practice trading Bitcoin, Ethereum, and other major cryptocurrencies with realistic volatility",
      color: "text-accent",
      image: cryptoForex
    },
    {
      icon: DollarSign,
      title: "Forex",
      description: "Master currency pairs and foreign exchange trading with simulated market conditions",
      color: "text-secondary"
    },
    {
      icon: Gem,
      title: "Commodities",
      description: "Trade gold, silver, and other precious metals with real-world market dynamics",
      color: "text-primary"
    },
    {
      icon: Droplet,
      title: "Energy & Oil",
      description: "Explore crude oil, natural gas, and energy commodity trading strategies",
      color: "text-accent"
    },
    {
      icon: BarChart3,
      title: "Indices",
      description: "Practice with major market indices like S&P 500, NASDAQ, and Dow Jones",
      color: "text-secondary"
    }
  ];

  return (
    <section id="markets" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-cyber">Multi-Asset Trading</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Practice trading across all major asset classes in one unified platform
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full mt-6" />
        </div>

        {/* Markets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {markets.map((market, index) => (
            <div
              key={index}
              className="group p-6 rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] hover:scale-[1.02]"
            >
              <market.icon className={`w-12 h-12 ${market.color} mb-4 group-hover:animate-pulse-glow`} />
              <h3 className="text-xl font-semibold text-foreground mb-2">{market.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{market.description}</p>
            </div>
          ))}
        </div>

        {/* Featured Market Visuals */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="relative rounded-lg overflow-hidden border border-primary/20 group">
            <img 
              src={marketViz} 
              alt="Market Visualization" 
              className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h4 className="text-2xl font-bold text-foreground mb-2">Advanced Charts</h4>
              <p className="text-muted-foreground">Real-time price visualization with technical indicators</p>
            </div>
          </div>
          
          <div className="relative rounded-lg overflow-hidden border border-primary/20 group">
            <img 
              src={cryptoForex} 
              alt="Crypto & Forex Trading" 
              className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h4 className="text-2xl font-bold text-foreground mb-2">Digital Assets</h4>
              <p className="text-muted-foreground">Cryptocurrency and forex trading simulation</p>
            </div>
          </div>
        </div>

        {/* Trading Modes */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
            <div className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold mb-4">
              CLASSIC MODE
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Deliberate Trading</h3>
            <p className="text-muted-foreground mb-4">
              Take your time to analyze charts, study market conditions, and execute thoughtful trades. 
              Perfect for learning long-term investment strategies and building a solid foundation.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Extended time to analyze positions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Focus on strategy development
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Ideal for swing and position trading
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-lg border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent backdrop-blur-sm">
            <div className="inline-block px-4 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-4">
              TURBO MODE
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Fast-Paced Intraday</h3>
            <p className="text-muted-foreground mb-4">
              Experience rapid market movements and quick decision-making. Practice day trading techniques, 
              scalping strategies, and high-frequency decision making in a compressed timeframe.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Accelerated market simulation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Quick execution practice
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Perfect for day trading skills
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button variant="default" size="lg" asChild>
            <Link to="/simulator">Start Trading All Markets</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MarketsSection;
