import { useState } from "react";
import { BookOpen, TrendingUp, Brain, LineChart, DollarSign, Target, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Book list ────────────────────────────────────────────────────────────────
const BOOKS = [
  {
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    category: "Value Investing",
    note: "The bible of value investing. Warren Buffett calls it the best investing book ever written.",
  },
  {
    title: "A Random Walk Down Wall Street",
    author: "Burton Malkiel",
    category: "Market Theory",
    note: "Classic case for index funds and efficient markets. Essential foundation reading.",
  },
  {
    title: "Trading in the Zone",
    author: "Mark Douglas",
    category: "Psychology",
    note: "The definitive book on trader psychology — why discipline and mindset matter more than strategy.",
  },
  {
    title: "Market Wizards",
    author: "Jack Schwager",
    category: "Interviews",
    note: "Interviews with the world's greatest traders. Raw, honest, and full of real-world insight.",
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Behavioral Finance",
    note: "19 short stories on how people think about money. One of the most readable finance books ever.",
  },
  {
    title: "Technical Analysis of Financial Markets",
    author: "John Murphy",
    category: "Technical Analysis",
    note: "The most comprehensive guide to chart patterns, indicators, and technical trading methods.",
  },
  {
    title: "One Up on Wall Street",
    author: "Peter Lynch",
    category: "Stock Picking",
    note: "Lynch explains how everyday investors can beat Wall Street by investing in what they know.",
  },
  {
    title: "Reminiscences of a Stock Operator",
    author: "Edwin Lefèvre",
    category: "Trading Stories",
    note: "Fictionalized account of Jesse Livermore — still the most gripping trading story ever told.",
  },
  {
    title: "How to Make Money in Stocks",
    author: "William O'Neil",
    category: "Growth Investing",
    note: "Founder of IBD introduces the CAN SLIM system for finding leading growth stocks.",
  },
  {
    title: "The Little Book of Common Sense Investing",
    author: "John C. Bogle",
    category: "Index Investing",
    note: "Vanguard founder's case for low-cost index funds over active management. Short and powerful.",
  },
  {
    title: "Flash Boys",
    author: "Michael Lewis",
    category: "Market Structure",
    note: "Exposes high-frequency trading and how modern markets really work behind the scenes.",
  },
  {
    title: "Security Analysis",
    author: "Benjamin Graham & David Dodd",
    category: "Fundamental Analysis",
    note: "The original textbook for fundamental analysis. Dense but foundational for serious investors.",
  },
  {
    title: "When Genius Failed",
    author: "Roger Lowenstein",
    category: "Risk Management",
    note: "The collapse of Long-Term Capital Management — a masterclass in why leverage kills.",
  },
  {
    title: "Common Stocks and Uncommon Profits",
    author: "Philip Fisher",
    category: "Growth Investing",
    note: "Fisher's qualitative approach to finding exceptional businesses for the long term.",
  },
  {
    title: "The Big Short",
    author: "Michael Lewis",
    category: "Finance History",
    note: "How a handful of outsiders saw the 2008 mortgage crisis coming and bet against Wall Street.",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Value Investing":       "bg-blue-100 text-blue-700",
  "Market Theory":         "bg-purple-100 text-purple-700",
  "Psychology":            "bg-orange-100 text-orange-700",
  "Interviews":            "bg-yellow-100 text-yellow-700",
  "Behavioral Finance":    "bg-pink-100 text-pink-700",
  "Technical Analysis":    "bg-teal-100 text-teal-700",
  "Stock Picking":         "bg-green-100 text-green-700",
  "Trading Stories":       "bg-red-100 text-red-700",
  "Growth Investing":      "bg-emerald-100 text-emerald-700",
  "Index Investing":       "bg-cyan-100 text-cyan-700",
  "Market Structure":      "bg-indigo-100 text-indigo-700",
  "Fundamental Analysis":  "bg-slate-100 text-slate-700",
  "Risk Management":       "bg-rose-100 text-rose-700",
  "Finance History":       "bg-amber-100 text-amber-700",
};

// ── Book popup ───────────────────────────────────────────────────────────────
const BookPopup = ({ onClose }: { onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
    onClick={onClose}
  >
    <div
      className="relative bg-card rounded-2xl border-2 border-border w-full max-w-xl flex flex-col"
      style={{
        maxHeight: "85vh",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.04)",
        transform: "perspective(900px) rotateX(1.5deg)",
        transformOrigin: "top center",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-foreground" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Recommended Reading</h3>
            <p className="text-xs text-muted-foreground">{BOOKS.length} books curated for traders & investors</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto flex-1 px-4 py-3">
        <div className="space-y-2">
          {BOOKS.map((book, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors group"
            >
              {/* Number */}
              <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-foreground text-sm leading-snug">{book.title}</h4>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">{book.author}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{book.note}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[book.category] ?? "bg-muted text-muted-foreground"}`}>
                  {book.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border shrink-0">
        <p className="text-xs text-muted-foreground text-center">
          All titles available at major bookstores and Amazon. Start with what matches your trading style.
        </p>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const EducationSection = () => {
  const [showBooks, setShowBooks] = useState(false);

  const investmentTypes = [
    { icon: TrendingUp, title: "Day Trading", description: "Buy and sell securities within the same trading day to profit from short-term price movements" },
    { icon: LineChart, title: "Swing Trading", description: "Hold positions for several days or weeks to capture medium-term price trends" },
    { icon: Target, title: "Position Trading", description: "Long-term strategy holding investments for months or years based on fundamental analysis" },
    { icon: DollarSign, title: "Options Trading", description: "Trade contracts giving the right to buy or sell assets at predetermined prices (calls/puts)" },
    { icon: Brain, title: "Scalping", description: "Make numerous trades throughout the day to profit from small price changes" },
    { icon: BookOpen, title: "Value Investing", description: "Identify undervalued stocks trading below their intrinsic value for long-term growth" },
  ];

  const concepts = [
    {
      title: "Leverage & Margin",
      body: "Leverage lets you control a larger position than your account balance alone. A 2:1 margin means $1 of capital controls $2 of stock. It amplifies both gains and losses — a 50% drop wipes the account at 2:1 leverage.",
      bullets: ["2:1 leverage = control $2 with $1 of capital", "Margin call triggers if equity falls below requirement", "Most brokers offer 4:1 intraday margin for day traders"],
    },
    {
      title: "Options: Calls & Puts",
      body: "An option is a contract giving the right — but not obligation — to buy or sell a stock at a set price (strike) before expiration. Calls profit when price rises; puts profit when it falls.",
      bullets: ["Call = right to BUY at the strike price", "Put = right to SELL at the strike price", "Max loss on a long option is the premium paid"],
    },
    {
      title: "Market Sessions",
      body: "US equity markets run in three sessions. Liquidity and volatility differ significantly across them. Most retail traders should stick to regular hours for tighter spreads.",
      bullets: ["Pre-market: 4:00 AM – 9:30 AM ET", "Regular hours: 9:30 AM – 4:00 PM ET", "After-hours: 4:00 PM – 8:00 PM ET"],
    },
    {
      title: "Risk Management",
      body: "Protecting capital is more important than maximizing returns. Professional traders risk a fixed percentage of their account per trade, never more — regardless of conviction.",
      bullets: ["Risk no more than 1–2% of capital per trade", "Use stop-loss orders on every position", "Diversify across sectors to reduce correlated risk"],
    },
  ];

  return (
    <section id="education" className="py-24 relative">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Financial Education Hub
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master the strategies, tools, and psychology behind successful trading
          </p>
          <div className="h-1 w-24 bg-foreground mx-auto rounded-full mt-6" />
        </div>

        {/* Investment Strategies */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Investment & Trading Strategies</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {investmentTypes.map((type, i) => (
              <div key={i} className="p-6 rounded-lg border-2 border-border bg-card hover:shadow-md transition-all group">
                <type.icon className="w-9 h-9 text-foreground mb-4" />
                <h4 className="text-base font-bold text-foreground mb-2">{type.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Concepts */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Essential Trading Concepts</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {concepts.map((c, i) => (
              <div key={i} className="p-7 rounded-lg border-2 border-border bg-card">
                <h4 className="text-lg font-bold text-foreground mb-3">{c.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.body}</p>
                <ul className="space-y-1.5">
                  {c.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-1" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Book strip preview */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-2 text-center">Recommended Reading</h3>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {BOOKS.length} hand-picked books across investing, trading, psychology, and market theory
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {BOOKS.slice(0, 3).map((book, i) => (
              <div key={i} className="p-5 rounded-lg border-2 border-border bg-card flex items-start gap-3">
                <BookOpen className="w-7 h-7 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground text-sm leading-snug">{book.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[book.category] ?? "bg-muted text-muted-foreground"}`}>
                    {book.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" onClick={() => setShowBooks(true)} className="gap-2">
              <BookOpen className="w-4 h-4" />
              View All {BOOKS.length} Books
            </Button>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm">
            Knowledge is the foundation of successful trading. Study the concepts above, then apply
            them risk-free in the TiMUS simulator.
          </p>
          <Button variant="default" size="lg" onClick={() => setShowBooks(true)}>
            Explore Learning Modules
          </Button>
        </div>
      </div>

      {showBooks && <BookPopup onClose={() => setShowBooks(false)} />}
    </section>
  );
};

export default EducationSection;
