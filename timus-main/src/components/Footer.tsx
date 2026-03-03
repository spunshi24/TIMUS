const Footer = () => {
  return (
    <footer className="border-t border-primary/20 py-8 bg-card/20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gradient-cyber font-bold text-xl mb-1">TiMUS</p>
            <p className="text-sm text-muted-foreground">Trading In Markets Under Simulation</p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              Built with passion for financial education
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © {new Date().getFullYear()} TiMUS. Educational purposes only.
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-primary/10 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary">⚠️ Disclaimer:</span> TiMUS is a simulated trading platform for educational purposes only. 
            No real money is involved. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
