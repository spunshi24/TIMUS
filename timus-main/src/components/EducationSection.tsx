import { BookOpen, TrendingUp, Brain, LineChart, DollarSign, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EducationSection = () => {
  const investmentTypes = [
    {
      icon: TrendingUp,
      title: "Day Trading",
      description: "Buy and sell securities within the same trading day to profit from short-term price movements"
    },
    {
      icon: LineChart,
      title: "Swing Trading",
      description: "Hold positions for several days or weeks to capture medium-term price trends"
    },
    {
      icon: Target,
      title: "Position Trading",
      description: "Long-term strategy holding investments for months or years based on fundamental analysis"
    },
    {
      icon: DollarSign,
      title: "Options Trading",
      description: "Trade contracts giving the right to buy or sell assets at predetermined prices (calls/puts)"
    },
    {
      icon: Brain,
      title: "Scalping",
      description: "Make numerous trades throughout the day to profit from small price changes"
    },
    {
      icon: BookOpen,
      title: "Value Investing",
      description: "Identify undervalued stocks trading below their intrinsic value for long-term growth"
    }
  ];

  const chartTypes = [
    { name: "Candlestick Charts", desc: "Show open, high, low, close prices in visual patterns" },
    { name: "Line Charts", desc: "Simple price movement visualization over time" },
    { name: "Bar Charts", desc: "Display price ranges with opening and closing ticks" },
    { name: "Renko Charts", desc: "Filter out time and focus purely on price movement" },
    { name: "Heikin-Ashi", desc: "Smoothed candlesticks to identify trends more clearly" },
    { name: "Point & Figure", desc: "Focus on significant price movements, ignoring time" }
  ];

  const bookRecommendations = [
    { title: "The Intelligent Investor", author: "Benjamin Graham", category: "Value Investing" },
    { title: "A Random Walk Down Wall Street", author: "Burton Malkiel", category: "Market Theory" },
    { title: "Trading in the Zone", author: "Mark Douglas", category: "Psychology" },
    { title: "Market Wizards", author: "Jack Schwager", category: "Trading Stories" },
    { title: "The Psychology of Money", author: "Morgan Housel", category: "Behavioral Finance" },
    { title: "Technical Analysis of Financial Markets", author: "John Murphy", category: "Technical" }
  ];

  return (
    <section id="education" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-cyber">Financial Education Hub</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master the strategies, tools, and psychology behind successful trading
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full mt-6" />
        </div>

        {/* Investment Strategies */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">
            Investment & Trading Strategies
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investmentTypes.map((type, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] group"
              >
                <type.icon className="w-10 h-10 text-primary mb-4 group-hover:animate-pulse-glow" />
                <h4 className="text-lg font-semibold text-foreground mb-2">{type.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Types */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">
            Understanding Chart Types
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chartTypes.map((chart, index) => (
              <div
                key={index}
                className="p-5 rounded-lg border border-accent/20 bg-card/20 backdrop-blur-sm hover:border-accent/40 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                  <h4 className="font-semibold text-foreground">{chart.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{chart.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Concepts */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">
            Essential Trading Concepts
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
              <h4 className="text-xl font-bold text-foreground mb-4">Leverage & Margin</h4>
              <p className="text-muted-foreground mb-4">
                Leverage allows you to control larger positions with less capital. While it can amplify gains, 
                it also magnifies losses. Understanding margin requirements and risk management is crucial.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">2:1 leverage = Control $2 with $1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Margin call occurs if equity falls below threshold</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-lg border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent backdrop-blur-sm">
              <h4 className="text-xl font-bold text-foreground mb-4">Options: Calls & Puts</h4>
              <p className="text-muted-foreground mb-4">
                Options give you the right (not obligation) to buy or sell at a set price. Calls profit from 
                price increases, puts profit from decreases. Advanced traders use complex strategies.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Call = Right to buy at strike price</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Put = Right to sell at strike price</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-lg border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent backdrop-blur-sm">
              <h4 className="text-xl font-bold text-foreground mb-4">Market Sessions</h4>
              <p className="text-muted-foreground mb-4">
                Markets operate in different sessions with varying liquidity and volatility characteristics. 
                Understanding these can improve timing and execution.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Pre-market: 4AM-9:30AM EST</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Regular hours: 9:30AM-4PM EST</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">After-hours: 4PM-8PM EST</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
              <h4 className="text-xl font-bold text-foreground mb-4">Risk Management</h4>
              <p className="text-muted-foreground mb-4">
                Protecting your capital is more important than maximizing gains. Use stop losses, position 
                sizing, and diversification to manage risk effectively.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Never risk more than 1-2% per trade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Use stop-loss orders to limit downside</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Book Recommendations */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">
            Recommended Reading
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookRecommendations.map((book, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-primary/20 bg-card/20 backdrop-blur-sm hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="w-8 h-8 text-accent flex-shrink-0 group-hover:animate-pulse-glow" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{book.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                      {book.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Knowledge is the foundation of successful trading. Start your journey with comprehensive education 
            and risk-free practice on TiMUS.
          </p>
          <Button variant="default" size="lg" asChild>
            <Link to="/simulator">Explore Learning Modules</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
