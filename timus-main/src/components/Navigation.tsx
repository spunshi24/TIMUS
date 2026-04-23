import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">

      {/* Desktop nav */}
      <div className="hidden md:flex items-center justify-between px-8 py-4">
        <Link to="/" className="font-bold text-xl text-foreground tracking-tight">
          TiMUS
        </Link>

        <div className="flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <Link to="/simulator" className="hover:text-foreground transition-colors">
            Simulator
          </Link>
          <button
            onClick={() => scrollTo("for-educators")}
            className="hover:text-foreground transition-colors"
          >
            For Educators
          </button>
          <Link to="/portfolio" className="hover:text-foreground transition-colors">
            Portfolio
          </Link>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          {user ? (
            <>
              <span className="text-muted-foreground">{user.username}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/simulator"
              className="px-4 py-2 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4">
        <Link to="/" className="font-bold text-lg text-foreground">TiMUS</Link>
        <button onClick={() => setIsOpen(!isOpen)} className="text-foreground p-1">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-5 py-3 space-y-1">
          <Link
            to="/simulator"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-foreground py-2.5 border-b border-border/50"
          >
            Simulator
          </Link>
          <button
            onClick={() => scrollTo("for-educators")}
            className="block w-full text-left text-sm font-medium text-foreground py-2.5 border-b border-border/50"
          >
            For Educators
          </button>
          <Link
            to="/portfolio"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-foreground py-2.5 border-b border-border/50"
          >
            Portfolio
          </Link>
          {user ? (
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground py-2.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          ) : (
            <Link
              to="/simulator"
              onClick={() => setIsOpen(false)}
              className="block text-sm font-semibold text-foreground py-2.5"
            >
              Sign In →
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Navigation;
