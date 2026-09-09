import { TrendingUp, TrendingDown, Users, KeyRound, Trophy } from "lucide-react";
import AppShell from "@/components/shell/AppShell";
import GameRoomPanel from "@/components/simulator/GameRoomPanel";
import { useAuth } from "@/context/AuthContext";

// Static illustration data for the "what a live room looks like" mockup
const EXAMPLE_ROWS = [
  { rank: 1, name: "Maya",   return_pct: 12.84, equity: 112840, up: true },
  { rank: 2, name: "Jordan", return_pct: 7.31,  equity: 107310, up: true },
  { rank: 3, name: "Sam",    return_pct: 4.02,  equity: 104020, up: false },
  { rank: 4, name: "Priya",  return_pct: -1.66, equity: 98340,  up: true },
  { rank: 5, name: "Diego",  return_pct: -5.20, equity: 94800,  up: false },
];

const HOW_IT_WORKS = [
  {
    icon: KeyRound,
    title: "Create a room",
    text: "Pick an 8-character code — that code is your room. There's nothing else to configure.",
  },
  {
    icon: Users,
    title: "Share the code",
    text: "Classmates or friends join with the same code from their own accounts, on any device.",
  },
  {
    icon: Trophy,
    title: "Compete live",
    text: "Everyone trades their own $100k portfolio. The leaderboard ranks the room by total return and updates as trades fill.",
  },
];

const Gameroom = () => {
  const { user, token, openAuthModal } = useAuth();

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12 space-y-14 max-w-5xl">

        {/* ── Explainer ─────────────────────────────────────────────────── */}
        <section className="text-center max-w-2xl mx-auto">
          <p className="fraunces text-[11px] tracking-[2px] uppercase italic text-muted-foreground mb-3">
            Compete with your class
          </p>
          <h1 className="fraunces text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
            The Game Room
          </h1>
          <p className="fraunces text-lg leading-relaxed text-muted-foreground">
            A Game Room turns paper trading into a friendly competition. One person creates a
            room, everyone else joins with its code, and a live leaderboard ranks the group by
            portfolio return — same market, same starting cash, may the best trader win.
          </p>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="p-6 rounded-xl border-2 border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="fraunces text-[13px] tracking-[2px] font-bold text-muted-foreground">
                  0{i + 1}
                </span>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="fraunces text-xl font-medium text-foreground mb-2">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>

        {/* ── Example leaderboard (illustration) ────────────────────────── */}
        <section className="max-w-3xl mx-auto">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="fraunces text-2xl md:text-3xl font-medium text-foreground">
                What a live room looks like
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Example data — your room's leaderboard appears below once you create or join one.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {EXAMPLE_ROWS.map((r) => (
              <div
                key={r.rank}
                className="flex items-center gap-5 px-6 py-4 rounded-2xl border border-border bg-card shadow-sm"
              >
                <span
                  className={`fraunces text-3xl font-medium w-10 shrink-0 text-right ${
                    r.rank === 1 ? "text-foreground" : "text-muted-foreground/70"
                  }`}
                >
                  {r.rank}
                </span>
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-muted-foreground">{r.name[0]}</span>
                </div>
                <span className="flex-1 font-semibold text-foreground truncate">{r.name}</span>
                <span
                  className={`hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    r.up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {r.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {r.up ? "rising" : "falling"}
                </span>
                <span
                  className={`w-24 text-right font-bold ${
                    r.return_pct >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {r.return_pct >= 0 ? "+" : ""}
                  {r.return_pct.toFixed(2)}%
                </span>
                <span className="hidden md:block w-28 text-right text-sm text-muted-foreground">
                  ${r.equity.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Live create / join / active room ─────────────────────────── */}
        <section className="max-w-3xl mx-auto">
          <GameRoomPanel user={user} token={token} onAuthClick={openAuthModal} />
        </section>
      </div>
    </AppShell>
  );
};

export default Gameroom;
