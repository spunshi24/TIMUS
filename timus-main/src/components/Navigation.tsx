import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "#about" },
    { name: "Simulator", path: "/simulator" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Education", path: "#education" },
    { name: "Contact", path: "#contact" },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-foreground">TiMUS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => scrollToSection(e, item.path)}
                className="px-4 py-2 text-foreground/80 hover:text-foreground transition-colors duration-300 font-medium"
              >
                {item.name}
              </Link>
            ))}
            <Button variant="default" size="sm" className="ml-4" asChild>
              <Link to="/simulator">Start Trading</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => {
                  scrollToSection(e, item.path);
                  setIsOpen(false);
                }}
                className="block px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-muted transition-all"
              >
                {item.name}
              </Link>
            ))}
            <div className="px-4 pt-4">
              <Button variant="default" className="w-full" asChild>
                <Link to="/simulator">Start Trading</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
