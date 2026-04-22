import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="absolute inset-0 opacity-10 tech-grid" />

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left: copy + CTAs */}
            <div className="space-y-8 animate-fadeIn text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-semibold text-foreground leading-tight tracking-tight">
                The trading simulator built for your finance class.
              </h1>

              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                Real market data. Market, limit, and stop orders. Free forever for students.
              </p>

              <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4">
                <Button variant="default" size="lg" className="group" asChild>
                  <Link to="/simulator">
                    Try the simulator
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.querySelector("#for-professors")?.scrollIntoView({ behavior: "smooth" })}
                >
                  For professors
                </Button>
              </div>
            </div>

            {/* Right: simulator UI mockup */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-lg rounded-xl border-2 border-zinc-700 bg-zinc-950 shadow-2xl overflow-hidden text-left">
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">AAPL</span>
                    <span className="text-zinc-400 text-xs">Apple Inc.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">$189.42</span>
                    <span className="text-green-400 text-xs ml-2">+1.24%</span>
                  </div>
                </div>
                {/* Fake chart */}
                <div className="px-4 pt-4 pb-2 bg-zinc-950">
                  <svg viewBox="0 0 320 90" className="w-full h-24" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      points="0,72 32,68 64,58 96,62 128,44 160,50 192,32 224,38 256,22 288,16 320,10"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="0,72 32,68 64,58 96,62 128,44 160,50 192,32 224,38 256,22 288,16 320,10 320,90 0,90"
                      fill="url(#chartFill)"
                    />
                  </svg>
                </div>
                {/* Order buttons */}
                <div className="grid grid-cols-2 gap-3 px-4 pb-3">
                  <div className="py-3 rounded-lg bg-green-600/20 border border-green-600/40 text-center text-green-400 text-sm font-bold">
                    Buy
                  </div>
                  <div className="py-3 rounded-lg bg-rose-600/20 border border-rose-600/40 text-center text-rose-400 text-sm font-bold">
                    Sell
                  </div>
                </div>
                {/* Footer row */}
                <div className="px-4 pb-4 flex items-center justify-between text-xs text-zinc-500">
                  <span>Balance: <span className="text-white font-semibold">$100,000</span></span>
                  <span className="text-yellow-400 font-semibold flex items-center gap-1">
                    ⚡ Turbo
                  </span>
                  <span>0 positions</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default Hero;
