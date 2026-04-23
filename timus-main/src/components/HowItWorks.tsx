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
    title: "Compete with friends or your class.",
    description:
      "Create a Game Room, share the code, and race to the top of the leaderboard — whether it's a class assignment or a bet with friends.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Up and running in under a minute.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="p-8 rounded-xl border-2 border-border bg-card">
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4 block">
                {step}
              </span>
              <Icon className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
