import { createContext, useContext, useState, type ReactNode } from "react";

export type AuthUser = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type AuthContextType = {
  user: AuthUser | null;
  signUp: (data: AuthUser & { password: string }) => string | null;
  signIn: (email: string, password: string) => string | null;
  signOut: () => void;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "mbshop_users";
const SESSION_KEY = "mbshop_session";

function getUsers(): Record<string, AuthUser & { password: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, AuthUser & { password: string }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSession(): AuthUser | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getSession());

  const signUp = (data: AuthUser & { password: string }): string | null => {
    const users = getUsers();
    if (users[data.email.toLowerCase()]) {
      return "An account with this email already exists.";
    }
    const { password, ...profile } = data;
    users[data.email.toLowerCase()] = { ...profile, password };
    saveUsers(users);
    const sessionUser: AuthUser = profile;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return null; // no error
  };

  const signIn = (email: string, password: string): string | null => {
    const users = getUsers();
    const account = users[email.toLowerCase()];
    if (!account) return "No account found with this email.";
    if (account.password !== password) return "Incorrect password.";
    const { password: _, ...profile } = account;
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    setUser(profile);
    return null;
  };

  const signOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
