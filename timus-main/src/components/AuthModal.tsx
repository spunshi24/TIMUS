import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Tab = "signup" | "login";

export default function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth();

  const [tab, setTab] = useState<Tab>("signup");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetFields = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError(null);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    resetFields();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "signup") {
        await register(username.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-zinc-950 border border-zinc-700 rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-white font-bold text-lg">
              {tab === "signup" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-zinc-400 text-xs mt-0.5">
              {tab === "signup"
                ? "Save your portfolio and trade without limits"
                : "Log in to access your saved portfolio"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors ml-4 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex mx-5 mt-4 bg-zinc-900 rounded-xl p-1">
          {(["signup", "login"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t === "signup" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5 space-y-3">
          {tab === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="auth-username" className="text-zinc-300 text-xs">
                Username
              </Label>
              <Input
                id="auth-username"
                type="text"
                autoComplete="username"
                placeholder="tradingpro"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-500"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="auth-email" className="text-zinc-300 text-xs">
              Email
            </Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-password" className="text-zinc-300 text-xs">
              Password
            </Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold disabled:opacity-60"
          >
            {loading
              ? tab === "signup" ? "Creating account…" : "Logging in…"
              : tab === "signup" ? "Create Account" : "Log In"}
          </Button>

          <p className="text-center text-zinc-500 text-xs pt-1">
            {tab === "signup" ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => switchTab(tab === "signup" ? "login" : "signup")}
              className="text-zinc-300 hover:text-white underline underline-offset-2"
            >
              {tab === "signup" ? "Log In" : "Sign Up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
