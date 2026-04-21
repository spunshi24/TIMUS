import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const scrollTo = (id: string) => {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">

      {/* ── Main masthead bar ─────────────────────────────────────────── */}
      <div className="bg-paper border-b-[1.5px] border-ink">

        {/* Desktop 3-col layout */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center px-14 py-[18px]">
          <span className="fraunces text-[11px] tracking-[2.5px] text-dim uppercase">
            Vol. IV · No. 112 · {dateStr}
          </span>
          <Link to="/" className="fraunces text-[28px] font-bold italic text-ink leading-none tracking-[-0.5px]">
            TiMUS
          </Link>
          <div className="flex justify-end items-center gap-5 fraunces text-[11px] tracking-[1.4px] uppercase">
            <Link to="/simulator" className="text-ink hover:text-ered transition-colors">Floor</Link>
            <button onClick={() => scrollTo("education")} className="text-ink hover:text-ered transition-colors">Reading Room</button>
            <button onClick={() => scrollTo("for-professors")} className="text-ink hover:text-ered transition-colors">For Faculty</button>
            {user ? (
              <>
                <span className="text-dim">{user.username}</span>
                <button
                  onClick={logout}
                  className="text-ink border-b border-ink pb-0.5 hover:text-ered hover:border-ered transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/simulator"
                className="text-ink border-b border-ink pb-0.5 hover:text-ered hover:border-ered transition-colors"
              >
                Enroll
              </Link>
            )}
          </div>
        </div>

        {/* Mobile bar */}
        <div className="md:hidden flex items-center justify-between px-6 py-[18px]">
          <Link to="/" className="fraunces text-2xl font-bold italic text-ink">TiMUS</Link>
          <button onClick={() => setIsOpen(!isOpen)} className="text-ink p-1">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Masthead strip (desktop only) ─────────────────────────────── */}
      <div className="hidden md:flex bg-paper border-b border-ink/30 px-14 py-[14px] justify-between fraunces text-[11px] tracking-[1.2px] uppercase text-dim">
        <span>Opening Bell 09:30 ET</span>
        <span>Since MMXXIV · Free forever for learners &amp; classes</span>
        <span>Est. reading 4 min</span>
      </div>

      {/* ── Mobile dropdown ───────────────────────────────────────────── */}
      {isOpen && (
        <div className="md:hidden bg-paper border-b-[1.5px] border-ink px-6 py-4 space-y-1">
          <Link
            to="/simulator"
            onClick={() => setIsOpen(false)}
            className="block fraunces text-[11px] tracking-[1.4px] uppercase text-ink py-2.5 border-b border-ink/20"
          >Floor</Link>
          <button
            onClick={() => scrollTo("education")}
            className="block w-full text-left fraunces text-[11px] tracking-[1.4px] uppercase text-ink py-2.5 border-b border-ink/20"
          >Reading Room</button>
          <button
            onClick={() => scrollTo("for-professors")}
            className="block w-full text-left fraunces text-[11px] tracking-[1.4px] uppercase text-ink py-2.5 border-b border-ink/20"
          >For Faculty</button>
          {user ? (
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="flex items-center gap-2 fraunces text-[11px] tracking-[1.4px] uppercase text-ink py-2.5"
            >
              <LogOut className="w-3 h-3" /> Logout
            </button>
          ) : (
            <Link
              to="/simulator"
              onClick={() => setIsOpen(false)}
              className="block fraunces text-[11px] tracking-[1.4px] uppercase text-ink py-2.5"
            >Enroll →</Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Navigation;
