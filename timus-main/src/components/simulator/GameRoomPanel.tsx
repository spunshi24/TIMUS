import { useState, useEffect, useRef } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { API_BASE } from "@/lib/api";
import type { AuthUser } from "@/context/AuthContext";

type GameRoomView = "idle" | "create" | "join";

interface GameRoomPanelProps {
  user: AuthUser | null;
  token: string | null;
  onAuthClick: () => void;
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  return_pct: number;
  equity: number;
  direction: "up" | "down";
}

function sanitizeCode(raw: string): string {
  return raw.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
}

// ── Leaderboard Table ────────────────────────────────────────────────────────
function LeaderboardTable({
  entries,
  requestingUserId,
}: {
  entries: LeaderboardEntry[];
  requestingUserId: number | null;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-zinc-500 text-sm py-4 text-center italic">
        No data yet.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-zinc-500 text-[11px] uppercase tracking-wider">
          <th className="text-left py-2 px-3 font-medium">Rank</th>
          <th className="text-left py-2 px-3 font-medium">Player</th>
          <th className="text-right py-2 px-3 font-medium">Return</th>
          <th className="text-right py-2 px-3 font-medium">Equity</th>
          <th className="w-6"></th>
        </tr>
      </thead>
      <tbody>
        {(entries ?? []).map((e) => {
          const isYou = requestingUserId !== null && e.user_id === requestingUserId;
          return (
            <tr
              key={e.user_id}
              className={`border-t border-zinc-800 ${
                isYou ? "bg-green-900/20" : ""
              }`}
            >
              <td className="py-2.5 px-3 font-mono text-zinc-400">
                {String(e.rank).padStart(2, "0")}
              </td>
              <td className="py-2.5 px-3">
                {isYou ? (
                  <span className="font-bold text-yellow-400">YOU</span>
                ) : (
                  <span className="text-zinc-200">{e.username}</span>
                )}
              </td>
              <td
                className={`py-2.5 px-3 text-right font-semibold ${
                  e.return_pct >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {e.return_pct >= 0 ? "+" : ""}
                {e.return_pct.toFixed(2)}%
              </td>
              <td className="py-2.5 px-3 text-right text-zinc-300">
                ${e.equity.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </td>
              <td className="py-2.5 px-1 text-center">
                {e.direction === "up" ? (
                  <span className="text-green-400">▲</span>
                ) : (
                  <span className="text-red-400">▼</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Main Panel ──────────────────────────────────────────────────────────────
const GameRoomPanel = ({ user, token, onAuthClick }: GameRoomPanelProps) => {
  const [view, setView] = useState<GameRoomView>("idle");

  // Active room (persisted in localStorage)
  const [activeRoom, setActiveRoom] = useState<string | null>(() =>
    localStorage.getItem("timus_active_room")
  );

  // Create flow
  const [createCode, setCreateCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Join flow
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [requestingUserId, setRequestingUserId] = useState<number | null>(null);
  const [lbLoading, setLbLoading] = useState(false);

  // Copy
  const [copied, setCopied] = useState(false);

  // ── Persist active room ────────────────────────────────────────────────
  useEffect(() => {
    if (activeRoom) {
      localStorage.setItem("timus_active_room", activeRoom);
    } else {
      localStorage.removeItem("timus_active_room");
    }
  }, [activeRoom]);

  // Stable ref for token so the polling effect doesn't restart on token change
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  // ── Fetch leaderboard with AbortController ──────────────────────────
  useEffect(() => {
    if (!activeRoom) return;
    const controller = new AbortController();

    const doFetch = async () => {
      try {
        const headers: Record<string, string> = {};
        if (tokenRef.current) headers["Authorization"] = `Bearer ${tokenRef.current}`;
        const res = await fetch(
          `${API_BASE}/api/gameroom/${activeRoom}/leaderboard`,
          { headers, signal: controller.signal },
        );
        if (!res.ok) return;
        const data = await res.json();
        setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        setRequestingUserId(data.requesting_user_id ?? null);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Leaderboard fetch error:", err);
      }
    };

    setLbLoading(true);
    doFetch().finally(() => setLbLoading(false));
    const interval = setInterval(doFetch, 30000);
    return () => { controller.abort(); clearInterval(interval); };
  }, [activeRoom]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    if (!user) { onAuthClick(); return; }
    setCreateCode("");
    setConfirmCode("");
    setCreateError(null);
    setView("create");
  };

  const handleOpenJoin = () => {
    setJoinCode("");
    setJoinError(null);
    setView("join");
  };

  const handleCreate = async () => {
    setCreateError(null);
    if (createCode.length !== 8) {
      setCreateError("Code must be exactly 8 characters.");
      return;
    }
    if (createCode !== confirmCode) {
      setCreateError("Codes do not match. Please re-enter.");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/gameroom/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: createCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create game room.");
      } else {
        setActiveRoom(data.code);
        setView("idle");
      }
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoinError(null);
    if (joinCode.length !== 8) {
      setJoinError("Code must be exactly 8 characters.");
      return;
    }
    setJoinLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/gameroom/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to join game room.");
      } else {
        setActiveRoom(data.code);
        setView("idle");
      }
    } catch {
      setJoinError("Network error. Please try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    setLeaderboard([]);
    setRequestingUserId(null);
    setView("idle");
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Active room view (leaderboard) ────────────────────────────────────
  if (activeRoom) {
    return (
      <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg">
        <h3 className="text-2xl font-bold text-foreground mb-2">Game Room</h3>

        {/* Room code bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-bold tracking-widest text-foreground font-mono">
            {activeRoom}
          </span>
          <button
            onClick={handleCopyCode}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Copy room code"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Share this code with your group to compete.
        </p>

        {/* Leaderboard */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Leaderboard
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              LIVE
            </span>
          </div>

          <div className="p-2">
            {lbLoading && leaderboard.length === 0 ? (
              <p className="text-zinc-500 text-sm py-6 text-center">
                Loading leaderboard...
              </p>
            ) : leaderboard.length <= 1 ? (
              <p className="text-zinc-500 text-sm py-6 text-center italic">
                Share your room code to see the leaderboard. Waiting for players to join...
              </p>
            ) : (
              <LeaderboardTable entries={leaderboard} requestingUserId={requestingUserId} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-5">
          <a
            href={`${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/leaderboard/${activeRoom}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open fullscreen
          </a>
          <button
            onClick={handleLeaveRoom}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  // ── Default view (create/join) ────────────────────────────────────────
  return (
    <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg">
      <h3 className="text-2xl font-bold text-foreground mb-2">Game Room</h3>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        Compete in a team-based friendly competition. Create a room or join one with a code.
      </p>

      {view === "idle" && (
        <div className="flex flex-col gap-3 max-w-xs">
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-lg border-2 border-border bg-muted/40 hover:bg-muted/70 text-sm font-semibold text-foreground transition-colors text-left"
          >
            Custom Game Room
          </button>
          {user && (
            <button
              onClick={handleOpenJoin}
              className="px-5 py-2.5 rounded-lg border-2 border-border bg-muted/40 hover:bg-muted/70 text-sm font-semibold text-foreground transition-colors text-left"
            >
              Join a Game Room
            </button>
          )}
        </div>
      )}

      {/* Create flow */}
      {view === "create" && (
        <div className="max-w-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Create Your Unique 8-Digit Game Code
            </label>
            <input
              type="text"
              value={createCode}
              onChange={(e) => setCreateCode(sanitizeCode(e.target.value))}
              placeholder="e.g. TRADE123"
              maxLength={8}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground font-mono text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-foreground/40 transition-colors"
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your code must be exactly 8 characters. Letters and numbers only. All letters will be automatically converted to uppercase.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Confirm Your Game Code
            </label>
            <input
              type="text"
              value={confirmCode}
              onChange={(e) => setConfirmCode(sanitizeCode(e.target.value))}
              placeholder="Re-enter your code"
              maxLength={8}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground font-mono text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>

          {createError && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              {createError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={createLoading || createCode.length < 1}
              className="px-5 py-2.5 rounded-lg border-2 border-border bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createLoading ? "Creating…" : "CREATE GAME ROOM"}
            </button>
            <button
              onClick={() => setView("idle")}
              className="px-5 py-2.5 rounded-lg border-2 border-border bg-muted/40 hover:bg-muted/70 text-sm font-semibold text-muted-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Join flow */}
      {view === "join" && (
        <div className="max-w-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Enter 8-Digit Game Code
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(sanitizeCode(e.target.value))}
              placeholder="e.g. TRADE123"
              maxLength={8}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground font-mono text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>

          {joinError && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              {joinError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleJoin}
              disabled={joinLoading || joinCode.length < 1}
              className="px-5 py-2.5 rounded-lg border-2 border-border bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {joinLoading ? "Joining…" : "JOIN"}
            </button>
            <button
              onClick={() => setView("idle")}
              className="px-5 py-2.5 rounded-lg border-2 border-border bg-muted/40 hover:bg-muted/70 text-sm font-semibold text-muted-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoomPanel;
