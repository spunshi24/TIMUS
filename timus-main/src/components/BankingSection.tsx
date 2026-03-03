import { Wallet, TrendingUp, Lock, Clock, PiggyBank, Building2 } from "lucide-react";

const BankingSection = () => {
  const accountTypes = [
    {
      icon: TrendingUp,
      title: "High-Yield Savings (HYS)",
      rate: "4.5-5.0% APY",
      description: "Maximize your cash reserves with competitive interest rates while maintaining liquidity",
      benefits: ["FDIC insured up to $250k", "Easy access to funds", "No market risk"]
    },
    {
      icon: Wallet,
      title: "Checking Account",
      rate: "0.01-0.5% APY",
      description: "Essential for daily transactions and bill payments with minimal interest earning",
      benefits: ["Instant access", "Debit card & checks", "Direct deposit"]
    },
    {
      icon: Clock,
      title: "Certificate of Deposit (CD)",
      rate: "4.0-5.5% APY",
      description: "Lock in higher rates for fixed terms (3-60 months) with guaranteed returns",
      benefits: ["Fixed interest rate", "FDIC insured", "Predictable returns"]
    },
    {
      icon: Building2,
      title: "Money Market Account",
      rate: "3.5-4.5% APY",
      description: "Hybrid of savings and checking with higher yields and limited transaction flexibility",
      benefits: ["Check writing ability", "Higher interest than savings", "FDIC insured"]
    }
  ];

  const financialInstitutions = [
    {
      icon: Building2,
      title: "Traditional Banks",
      description: "Full-service institutions offering checking, savings, loans, and investment services with physical branches"
    },
    {
      icon: PiggyBank,
      title: "Credit Unions",
      description: "Member-owned cooperatives often offering better rates and lower fees than traditional banks"
    },
    {
      icon: Lock,
      title: "Online Banks",
      description: "Digital-only banks with lower overhead, typically offering higher interest rates on savings"
    },
    {
      icon: Wallet,
      title: "Brokerages",
      description: "Firms facilitating buying and selling of securities, from discount to full-service advisors"
    }
  ];

  const fundTypes = [
    {
      type: "Mutual Funds",
      description: "Professionally managed pools of money from many investors, investing in stocks, bonds, or other assets",
      structure: "Actively managed, priced once daily at NAV"
    },
    {
      type: "Hedge Funds",
      description: "Exclusive investment partnerships using complex strategies for high-net-worth individuals",
      structure: "Limited partners, high minimums, less regulated"
    },
    {
      type: "Index Funds",
      description: "Passively managed funds tracking specific market indices like S&P 500 with low fees",
      structure: "Rules-based, low expense ratios, tax efficient"
    },
    {
      type: "ETFs (Exchange-Traded Funds)",
      description: "Basket of securities trading on exchanges like stocks, combining mutual fund diversification with stock liquidity",
      structure: "Intraday trading, typically lower fees than mutual funds"
    }
  ];

  return (
    <section id="banking" className="py-24 relative bg-gradient-to-b from-background to-card/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-cyber">Banking & Finance 101</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Understand how to make your money work for you through smart banking and investment choices
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full mt-6" />
        </div>

        {/* Interest Philosophy */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="p-8 md:p-12 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-4">
              <TrendingUp className="w-12 h-12 text-accent flex-shrink-0" />
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Play the Long Game: Earn More, Pay Less
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  The key to building wealth is simple: <span className="text-primary font-semibold">maximize the interest you EARN</span> 
                  {" "}while <span className="text-destructive font-semibold">minimizing the interest you PAY</span>.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Use your everyday balance wisely. Keep emergency funds in high-yield savings, invest surplus in 
                  diversified assets, and avoid high-interest debt. Every dollar earning interest compounds over time, 
                  while every dollar paying interest to others erodes your wealth. Make your money work for you, 
                  not against you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Types */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">
            Banking Account Types
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {accountTypes.map((account, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <account.icon className="w-10 h-10 text-primary flex-shrink-0 group-hover:animate-pulse-glow" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-xl font-semibold text-foreground">{account.title}</h4>
                      <span className="text-accent font-bold text-sm whitespace-nowrap ml-2">{account.rate}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{account.description}</p>
                    <div className="space-y-2">
                      {account.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span className="text-xs text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Institutions */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">
            Types of Financial Institutions
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialInstitutions.map((institution, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-accent/20 bg-card/20 backdrop-blur-sm hover:border-accent/40 transition-all"
              >
                <institution.icon className="w-10 h-10 text-accent mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">{institution.title}</h4>
                <p className="text-sm text-muted-foreground">{institution.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fund Types */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">
            Investment Funds & Vehicles
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {fundTypes.map((fund, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-primary/20 bg-gradient-to-br from-card/50 to-transparent backdrop-blur-sm"
              >
                <h4 className="text-xl font-bold text-foreground mb-3">{fund.type}</h4>
                <p className="text-muted-foreground mb-3 leading-relaxed">{fund.description}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-primary/10">
                  <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{fund.structure}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Banking Tips */}
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-lg border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Smart Banking Strategies</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Maximize Earning
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Move idle cash to high-yield savings (4-5% APY)</li>
                  <li>• Ladder CDs for better rates and liquidity</li>
                  <li>• Use money market accounts for active reserves</li>
                  <li>• Invest long-term funds in diversified portfolios</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Minimize Paying
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Pay off high-interest credit cards first</li>
                  <li>• Avoid overdraft fees with account alerts</li>
                  <li>• Refinance high-rate loans when possible</li>
                  <li>• Use 0% promotional periods strategically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BankingSection;
