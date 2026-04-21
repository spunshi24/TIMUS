const Footer = () => {
  return (
    <footer className="border-t border-primary/20 py-10 bg-card/20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Left — brand */}
          <div>
            <p className="text-gradient-cyber font-bold text-xl mb-1">TiMUS</p>
            <p className="text-sm text-muted-foreground">Trading In Markets Under Simulation</p>
            <p className="text-sm text-muted-foreground mt-3">
              Paper trading for finance students
            </p>
          </div>

          {/* Right — founder */}
          <div className="text-left md:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Founder &amp; CEO</p>
            <p className="garamond text-lg font-semibold text-foreground italic">Sumit Punshi</p>
            <p className="text-xs text-muted-foreground mt-3">
              © {new Date().getFullYear()} TiMUS. Self learning purposes only.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary/10 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary">⚠️ Disclaimer:</span> TiMUS is a simulated trading platform for self learning purposes only.
            No real money is involved. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
