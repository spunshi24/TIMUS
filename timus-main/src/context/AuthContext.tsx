import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { API_BASE } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  username: string;
  email: string;
}

type AuthSuccessHandler = (() => void | Promise<void>) | null;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  // Globally shared auth modal (rendered once in App.tsx)
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  // Pages can register a callback to run after a successful login/signup
  setAuthSuccessHandler: (fn: AuthSuccessHandler) => void;
  notifyAuthSuccess: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem("timus_user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("timus_token")
  );

  useEffect(() => {
    if (token) localStorage.setItem("timus_token", token);
    else localStorage.removeItem("timus_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("timus_user", JSON.stringify(user));
    else localStorage.removeItem("timus_user");
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setToken(data.token as string);
    setUser(data.user as AuthUser);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setToken(data.token as string);
    setUser(data.user as AuthUser);
  };

  const logout = () => {
    // Clear portfolio data so simulator resets to $100k on next visit
    localStorage.removeItem("timus_balance");
    localStorage.removeItem("timus_initial_balance");
    localStorage.removeItem("timus_positions");
    localStorage.removeItem("timus_orders");
    localStorage.removeItem("timus_working_orders");
    localStorage.removeItem("timus_anon_trades");
    setUser(null);
    setToken(null);
  };

  // ── Global auth modal state ─────────────────────────────────────────────
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const authSuccessHandlerRef = useRef<AuthSuccessHandler>(null);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);
  const setAuthSuccessHandler = useCallback((fn: AuthSuccessHandler) => {
    authSuccessHandlerRef.current = fn;
  }, []);
  const notifyAuthSuccess = useCallback(() => {
    authSuccessHandlerRef.current?.();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        setAuthSuccessHandler,
        notifyAuthSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
