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

            {/* Right: simulator screenshot */}
            {/* TODO: drop a real screenshot at public/screenshot-simulator.png */}
            <div className="flex items-center justify-center">
              <img
                src="/screenshot-simulator.png"
                alt="TiMUS simulator interface"
                loading="eager"
                className="rounded-xl border-2 border-border shadow-2xl w-full max-w-lg"
              />
            </div>

          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default Hero;
