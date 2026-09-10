import { useNavigate } from "react-router-dom";
import AppShell from "@/components/shell/AppShell";
import CustomWatchlistPanel from "@/components/simulator/CustomWatchlistPanel";
import { useAuth } from "@/context/AuthContext";

// Full-page watchlist (D4). Reuses CustomWatchlistPanel — same add/remove,
// prices, and auto-closing add panel as the embedded Simulator version.
const Watchlist = () => {
  const { user, token, openAuthModal } = useAuth();
  const navigate = useNavigate();

  // Same click-to-trade pattern as everywhere else (A2)
  const handleSelectTicker = (ticker: string) => {
    sessionStorage.setItem("timus_goto_ticker", ticker);
    navigate("/simulator");
  };

  return (
    <AppShell title="Watchlist">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Follow the stocks you care about — click any row to open it in the Simulator.
          </p>
        </div>

        {user ? (
          <CustomWatchlistPanel
            user={user}
            token={token}
            onSelectTicker={handleSelectTicker}
          />
        ) : (
          <div className="p-12 rounded-lg border-2 border-border bg-card text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to build a personal watchlist that syncs across devices.
            </p>
            <button
              onClick={openAuthModal}
              className="px-6 py-2.5 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Watchlist;
