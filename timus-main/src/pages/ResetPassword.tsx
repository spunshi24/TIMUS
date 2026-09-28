import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Landing page for the link emailed by /api/auth/request-reset.
// The token arrives as ?token=... and is posted to /api/auth/reset-password.
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reset password");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <h1 className="text-foreground font-bold text-lg">Reset Password</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Choose a new password for your TiMUS account.
          </p>
        </div>

        {done ? (
          <div className="px-5 py-6 space-y-4">
            <p className="text-foreground text-sm">
              Your password has been updated and any existing sessions were signed out.
            </p>
            <Link
              to="/"
              className="block text-center w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-md py-2"
            >
              Back to TiMUS
            </Link>
          </div>
        ) : !token ? (
          <div className="px-5 py-6">
            <p className="text-destructive text-sm">
              This reset link is missing its token. Request a new link from the login screen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-muted-foreground text-xs">
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
                disabled={loading}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-ring"
              />
              <p className="text-muted-foreground/70 text-[11px]">
                At least 12 characters. Avoid common or breached passwords.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-muted-foreground text-xs">
                Confirm new password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={12}
                disabled={loading}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-ring"
              />
            </div>

            {error && (
              <p className="text-destructive text-xs bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
