import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "@/lib/api";

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  return_pct: number;
  equity: number;
  direction: "up" | "down";
}

const Leaderboard = () => {
  const { code } = useParams<{ code: string }>();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    const controller = new AbortController();

    const doFetch = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/gameroom/${code}/leaderboard`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Room not found");
          return;
        }
        const data = await res.json();
        setEntries(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        setError(null); // clear transient errors on success
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    doFetch();
    const interval = setInterval(doFetch, 15000);
    return () => { controller.abort(); clearInterval(interval); };
  }, [code]);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Game Room{" "}
            <span className="font-mono text-zinc-400">{code}</span>
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            TiMUS Leaderboard
          </p>
        </div>
        <span className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          LIVE — refreshes every 15s
        </span>
      </div>

      {/* Error banner (non-blocking — shows above the table, not instead of it) */}
      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-zinc-500 text-lg">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-zinc-500 text-lg italic">
              No players yet. Waiting for participants...
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                <th className="text-left py-4 px-6 font-medium">Rank</th>
                <th className="text-left py-4 px-6 font-medium">Player</th>
                <th className="text-right py-4 px-6 font-medium">Return</th>
                <th className="text-right py-4 px-6 font-medium">Equity</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {(entries ?? []).map((e) => (
                <tr
                  key={e.user_id}
                  className="border-t border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-5 px-6 font-mono text-2xl text-zinc-400 font-bold">
                    {String(e.rank).padStart(2, "0")}
                  </td>
                  <td className="py-5 px-6 text-xl text-white font-semibold">
                    {e.username}
                  </td>
                  <td
                    className={`py-5 px-6 text-right text-xl font-bold ${
                      e.return_pct >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {e.return_pct >= 0 ? "+" : ""}
                    {e.return_pct.toFixed(2)}%
                  </td>
                  <td className="py-5 px-6 text-right text-xl text-zinc-300">
                    ${e.equity.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="py-5 px-3 text-center text-lg">
                    {e.direction === "up" ? (
                      <span className="text-green-400">▲</span>
                    ) : (
                      <span className="text-red-400">▼</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
