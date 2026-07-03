import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings, Package, Wallet, Heart, Star, Truck, Undo2,
  MessageCircle, Gift, Coins, MapPin, HelpCircle, ChevronRight,
  Bell, ShoppingBag, CreditCard, Ticket, LogOut, Eye, EyeOff, User,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/me")({
  component: MePage,
});

const orderStages = [
  { Icon: Wallet, label: "To Pay", count: 2 },
  { Icon: Package, label: "To Ship", count: 1 },
  { Icon: Truck, label: "Shipped", count: 3 },
  { Icon: Star, label: "Review", count: 5 },
  { Icon: Undo2, label: "Returns", count: 0 },
];

const rewards = [
  { Icon: Coins, label: "Coins", value: "1,240" },
  { Icon: Ticket, label: "Coupons", value: "8" },
  { Icon: Gift, label: "Credit", value: "₵12.50" },
  { Icon: CreditCard, label: "Cards", value: "3" },
];

const menu = [
  { Icon: Heart, label: "My Wishlist", meta: "24 items" },
  { Icon: ShoppingBag, label: "Recently Viewed", meta: "" },
  { Icon: MapPin, label: "Addresses", meta: "" },
  { Icon: Package, label: "Import Products", meta: "Admin", to: "/import" },
  { Icon: MessageCircle, label: "Messages", meta: "" },
  { Icon: Bell, label: "Notifications", meta: "On" },
  { Icon: HelpCircle, label: "Help Center", meta: "" },
  { Icon: Settings, label: "Settings", meta: "" },
];

// ── Auth Forms ────────────────────────────────────────────────────────────────

type AuthMode = "signin" | "signup";

function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", password: "", confirmPassword: "",
  });

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      if (!form.name.trim()) return setError("Please enter your full name.");
      if (!form.email.includes("@")) return setError("Please enter a valid email.");
      if (form.password.length < 6) return setError("Password must be at least 6 characters.");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
      const err = signUp({ name: form.name, email: form.email, phone: form.phone, address: form.address, password: form.password });
      if (err) setError(err);
    } else {
      if (!form.email || !form.password) return setError("Please fill in all fields.");
      const err = signIn(form.email, form.password);
      if (err) setError(err);
    }
  };

  return (
    <PhoneShell>
      <div className="min-h-[85vh] flex flex-col justify-center px-6 pb-32">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="MB Shop" className="w-16 h-16 rounded-full object-cover shadow-lg mb-3" />
          <h1 className="text-2xl font-extrabold tracking-tight">MB Shop</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Toggle tabs */}
        <div className="flex bg-secondary rounded-full p-1 mb-6">
          {(["signin", "signup"] as AuthMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-full text-sm font-bold transition ${
                mode === m ? "bg-white shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/70">Full Name</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. John Mensah"
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white outline-none focus:border-primary transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/70">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="e.g. +233241234567"
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white outline-none focus:border-primary transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/70">Delivery Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="e.g. Circle, Accra"
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white outline-none focus:border-primary transition"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-foreground/70">Email Address</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-foreground/70">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} required
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl border border-border px-4 py-3 pr-12 text-sm bg-white outline-none focus:border-primary transition"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-foreground/70">Confirm Password</label>
              <input
                type="password" required
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white outline-none focus:border-primary transition"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2 font-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white font-extrabold py-3.5 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition shadow-lg"
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}

// ── Logged-in Profile ─────────────────────────────────────────────────────────

function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <PhoneShell>
      {/* Header */}
      <div
        className="relative rounded-b-[2rem] pt-12 pb-20 px-5 text-white overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute right-24 top-20 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest opacity-90">MY ACCOUNT</span>
          <button onClick={signOut} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="relative mt-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center text-2xl font-extrabold text-primary shadow-xl">
            {initials}
          </div>
          <div>
            <p className="text-lg font-extrabold">{user.name}</p>
            <p className="text-xs text-white/85">{user.email}</p>
            {user.phone && <p className="text-xs text-white/70 mt-0.5">{user.phone}</p>}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 font-semibold">🏆 MB Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div className="px-4 -mt-14 relative z-10">
        <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-4 grid grid-cols-4 gap-2 border border-border/60">
          {rewards.map(({ Icon, label, value }) => (
            <button key={label} className="flex flex-col items-center gap-1 py-1">
              <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-extrabold">{value}</span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <section className="px-4 mt-4">
        <div className="bg-white rounded-2xl border border-border/60 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-sm font-bold">My Orders</h3>
            <button className="text-xs text-muted-foreground font-semibold flex items-center">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1 px-2 pb-4">
            {orderStages.map(({ Icon, label, count }) => (
              <button key={label} className="relative flex flex-col items-center gap-1 py-2">
                <div className="relative">
                  <Icon className="w-6 h-6 text-foreground/80" />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-flame text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-foreground/80">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery address if set */}
      {user.address && (
        <section className="px-4 mt-4">
          <div className="bg-white rounded-2xl border border-border/60 shadow-[var(--shadow-card)] px-4 py-3 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Default delivery address</p>
              <p className="text-sm font-semibold">{user.address}</p>
            </div>
          </div>
        </section>
      )}

      {/* Promo strip */}
      <section className="px-4 mt-4">
        <div className="rounded-2xl bg-gradient-to-r from-flame/15 to-orange-50 border border-flame/20 p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-flame text-white flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Invite friends, earn ₵10</p>
            <p className="text-[11px] text-muted-foreground">For every friend who joins MB Shop</p>
          </div>
          <button className="text-xs font-bold text-flame">Invite ›</button>
        </div>
      </section>

      {/* Menu */}
      <section className="px-4 mt-4">
        <div className="bg-white rounded-2xl border border-border/60 shadow-[var(--shadow-card)] divide-y divide-border/60">
          {menu.map(({ Icon, label, meta, to }) => {
            const inner = (
              <>
                <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold flex-1 text-left">{label}</span>
                {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </>
            );
            if (to) {
              return (
                <Link key={label} to={to} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 first:rounded-t-2xl last:rounded-b-2xl transition">
                  {inner}
                </Link>
              );
            }
            return (
              <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 first:rounded-t-2xl last:rounded-b-2xl transition">
                {inner}
              </button>
            );
          })}
          {/* Sign out row */}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 last:rounded-b-2xl transition text-destructive"
          >
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-sm font-semibold flex-1 text-left">Sign Out</span>
          </button>
        </div>
      </section>

      <p className="text-center text-[10px] text-muted-foreground mt-6 mb-2">MB Shop · v1.0 · Made with ♡</p>
      <BottomNav />
    </PhoneShell>
  );
}

function MePage() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <ProfileScreen /> : <AuthScreen />;
}
