const Footer = () => (
  <footer className="py-16 bg-muted/30 border-t border-border">
    <div className="container mx-auto px-4 text-center">

      <p className="text-3xl font-bold text-foreground mb-1">TiMUS</p>
      <p className="text-muted-foreground mb-6">Trading In Markets Under Simulation</p>

      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
        Founder &amp; CEO
      </p>
      <p className="text-lg font-medium text-foreground" style={{ fontFamily: '"EB Garamond", Georgia, serif' }}>
        Sumit Punshi
      </p>

      <div className="mt-8 pt-8 border-t border-border space-y-2">
        <p className="text-sm text-muted-foreground">
          © 2026 TiMUS. Self learning purposes only.
        </p>
        <p className="text-xs text-muted-foreground max-w-xl mx-auto">
          TiMUS is a paper trading simulator using delayed market data. No real money is ever at risk.
          This platform is intended for educational use and does not constitute financial advice.
        </p>
      </div>

    </div>
  </footer>
);

export default Footer;
