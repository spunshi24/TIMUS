import { Sparkles, Target, Users, Zap } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Why TiMUS?
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-foreground via-accent to-destructive mx-auto rounded-full" />
          </div>

          {/* Mission Statement */}
          <div className="mb-16 text-center">
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              TiMUS was born from a simple idea: everyone should be able to learn trading without risking real money. 
              We've created a realistic simulation platform that mirrors actual market conditions, helping you build 
              confidence and skills before entering live markets.
            </p>
          </div>

          {/* Story Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Origin */}
            <div className="p-8 rounded-lg border-2 border-border bg-card hover:shadow-lg transition-all duration-300">
              <Sparkles className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">The Beginning</h3>
              <p className="text-muted-foreground leading-relaxed">
                During the 2020 pandemic, I discovered the world of trading through a unique paper-and-pencil game 
                with my father. We tracked stocks manually, calculated P&L by hand, and learned market mechanics 
                without any digital tools. That experience sparked a passion for market education.
              </p>
            </div>

            {/* The Problem */}
            <div className="p-8 rounded-lg border-2 border-border bg-card hover:shadow-lg transition-all duration-300">
              <Target className="w-10 h-10 text-destructive mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">The Challenge</h3>
              <p className="text-muted-foreground leading-relaxed">
                While online brokerages now offer paper trading, most platforms are either too simplified or 
                too complex for beginners. Emotions cloud judgment when real money is involved, and quality 
                education tools remain scarce. There had to be a better way to learn.
              </p>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-lg border-2 border-accent bg-card hover:shadow-lg transition-all duration-300">
              <Zap className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Approach</h3>
              <p className="text-muted-foreground leading-relaxed">
                TiMUS focuses on market mechanics and execution, not prediction. We provide two distinct trading 
                modes—Classic for deliberate strategy and Turbo for fast-paced intraday practice—allowing you to 
                master different trading styles in a risk-free environment.
              </p>
            </div>

            {/* Who It's For */}
            <div className="p-8 rounded-lg border-2 border-border bg-card hover:shadow-lg transition-all duration-300">
              <Users className="w-10 h-10 text-foreground mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Built For You</h3>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a student exploring finance, an educator teaching market concepts, or an aspiring 
                trader perfecting your strategy, TiMUS provides the tools and realistic environment you need to 
                succeed without financial risk.
              </p>
            </div>
          </div>

          {/* Core Philosophy */}
          <div className="p-8 rounded-lg bg-gradient-to-br from-muted to-background border-2 border-border">
            <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
              Learn by Doing, Not by Losing
            </h3>
            <p className="text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
              TiMUS isn't about predicting markets—it's about understanding them. Practice with realistic price 
              action, learn from your mistakes, and develop the discipline and psychology needed for successful 
              trading. All without risking a single dollar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
