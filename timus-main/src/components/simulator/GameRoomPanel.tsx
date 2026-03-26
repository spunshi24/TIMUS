import { useState } from "react";
import { API_BASE } from "@/lib/api";
import type { AuthUser } from "@/context/AuthContext";

type GameRoomView = "idle" | "create" | "join";

interface GameRoomPanelProps {
  user: AuthUser | null;
  token: string | null;
  onAuthClick: () => void;
}

function sanitizeCode(raw: string): string {
  return raw.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
}

const GameRoomPanel = ({ user, token, onAuthClick }: GameRoomPanelProps) => {
  const [view, setView] = useState<GameRoomView>("idle");

  // Create flow
  const [createCode, setCreateCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // Join flow
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinedCode, setJoinedCode] = useState<string | null>(null);

  const resetCreate = () => {
    setCreateCode("");
    setConfirmCode("");
    setCreateError(null);
    setCreatedCode(null);
  };

  const resetJoin = () => {
    setJoinCode("");
    setJoinError(null);
    setJoinedCode(null);
  };

  const handleOpenCreate = () => {
    if (!user) { onAuthClick(); return; }
    resetCreate();
    setView("create");
  };

  const handleOpenJoin = () => {
    resetJoin();
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
        setCreatedCode(data.code);
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
        setJoinedCode(data.code);
      }
    } catch {
      setJoinError("Network error. Please try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg">
      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <h3 className="text-2xl font-bold text-foreground mb-2">Game Room</h3>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        Immerse yourself in a team-based friendly competition. If you are an instructor, create a
        game for your classroom. If you are an individual, compete within your friend circle and
        put your trading knowledge to the test.
      </p>

      {/* ── Buttons ─────────────────────────────────────────────────────── */}
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

      {/* ── Create flow ─────────────────────────────────────────────────── */}
      {view === "create" && (
        <div className="max-w-sm space-y-4">
          {createdCode ? (
            <div className="p-5 rounded-lg border-2 border-success/40 bg-success/10 space-y-2">
              <p className="text-base font-bold text-foreground">Game Room Created!</p>
              <p className="text-sm text-muted-foreground">
                Share this code with your participants:
              </p>
              <p className="text-3xl font-bold tracking-widest text-foreground font-mono">
                {createdCode}
              </p>
              <button
                onClick={() => { resetCreate(); setView("idle"); }}
                className="mt-2 text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                ← Back
              </button>
            </div>
          ) : (
            <>
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
                  Your code must be exactly 8 characters. Use letters and numbers only. Special
                  characters are not allowed (no spaces, hyphens, underscores, symbols, or
                  punctuation of any kind). All letters will be automatically converted to
                  uppercase.
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
                  onClick={() => { resetCreate(); setView("idle"); }}
                  className="px-5 py-2.5 rounded-lg border-2 border-border bg-muted/40 hover:bg-muted/70 text-sm font-semibold text-muted-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Join flow ───────────────────────────────────────────────────── */}
      {view === "join" && (
        <div className="max-w-sm space-y-4">
          {joinedCode ? (
            <div className="p-5 rounded-lg border-2 border-success/40 bg-success/10 space-y-2">
              <p className="text-base font-bold text-foreground">You've Joined!</p>
              <p className="text-sm text-muted-foreground">
                Successfully joined game room:
              </p>
              <p className="text-3xl font-bold tracking-widest text-foreground font-mono">
                {joinedCode}
              </p>
              <button
                onClick={() => { resetJoin(); setView("idle"); }}
                className="mt-2 text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                ← Back
              </button>
            </div>
          ) : (
            <>
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
                  onClick={() => { resetJoin(); setView("idle"); }}
                  className="px-5 py-2.5 rounded-lg border-2 border-border bg-muted/40 hover:bg-muted/70 text-sm font-semibold text-muted-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GameRoomPanel;
