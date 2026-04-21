import { DollarSign, BarChart2, Trophy } from "lucide-react";

const steps = [
  {
    icon: DollarSign,
    step: "01",
    title: "Get $100,000 in virtual cash",
    description: "Start with a simulated portfolio — no real money at risk.",
  },
  {
    icon: BarChart2,
    step: "02",
    title: "Trade real stocks with live NYSE & NASDAQ prices",
    description:
      "Place market, limit, and stop orders on actual listed companies. Prices refresh every 30 seconds.",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Your whole class trades in the same room",
    description:
      "Everyone sees the leaderboard. Your professor sees every position and every trade.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">

          <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-16">
            How it works
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map(({ icon: Icon, step, title, description }) => (
              <div key={step}>
                <span className="garamond text-6xl font-bold text-muted-foreground/25 block mb-4 leading-none">
                  {step}
                </span>
                <Icon className="w-7 h-7 text-accent mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-2 leading-snug">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
