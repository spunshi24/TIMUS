import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "About", path: "#about" },
    { name: "Simulator", path: "/simulator" },
    { name: "For Professors", path: "#for-professors" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Contact", path: "#contact" },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith("#")) {
      e.preventDefault();
      setIsOpen(false);
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        // Not on homepage — navigate there with hash so browser auto-scrolls
        window.location.href = window.location.origin + import.meta.env.BASE_URL + path;
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
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => scrollToSection(e, item.path)}
                className="px-4 py-2 text-foreground/80 hover:text-foreground transition-colors duration-300 font-medium"
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-3 ml-4">
                <span className="text-sm text-foreground/80 font-medium">{user.username}</span>
                <Button variant="outline" size="sm" onClick={logout} className="gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="default" size="sm" className="ml-4" asChild>
                <Link to="/simulator">Sign In</Link>
              </Button>
            )}
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
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => { scrollToSection(e, item.path); setIsOpen(false); }}
                className="block px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-muted transition-all"
              >
                {item.name}
              </Link>
            ))}
            <div className="px-4 pt-4">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/80 font-medium">{user.username}</span>
                  <Button variant="outline" size="sm" onClick={() => { logout(); setIsOpen(false); }} className="gap-1.5">
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button variant="default" className="w-full" asChild>
                  <Link to="/simulator" onClick={() => setIsOpen(false)}>Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
