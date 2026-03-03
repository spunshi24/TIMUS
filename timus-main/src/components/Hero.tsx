import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-cyber-trading.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-10 tech-grid"
      />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-muted/50 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm text-foreground/80 font-medium">Trading In Markets Under Simulation</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-tight tracking-tight">
            TiMUS
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light">
            Your Financial Hub
          </p>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Simulated fictional data. Zero financial risk. Practice trading across stocks, 
            crypto, forex, and commodities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button variant="default" size="lg" className="group" asChild>
              <Link to="/simulator">
                Launch Simulator
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              {
                icon: TrendingUp,
                title: "Simulated Data",
                description: "Trade with fictional price action and realistic market behavior"
              },
              {
                icon: Shield,
                title: "Zero Risk",
                description: "Practice with virtual funds, learn without losing real money"
              },
              {
                icon: Zap,
                title: "Multiple Markets",
                description: "Stocks, crypto, forex, commodities, and ETFs all in one platform"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg border-2 border-border bg-card/80 backdrop-blur-sm hover:border-accent/40 transition-all hover:shadow-md group"
              >
                <feature.icon className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default Hero;
