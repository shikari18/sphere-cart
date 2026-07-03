import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings, Package, Wallet, Heart, Star, Truck, Undo2,
  MessageCircle, Gift, Coins, MapPin, HelpCircle, ChevronRight,
  Bell, ShoppingBag, CreditCard, Ticket, LogOut, Eye, EyeOff,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/me")({
  component: MePage,
});

const orderStages = [
  { Icon: Wallet, label: "To Pay", count: 0 },
  { Icon: Package, label: "To Ship", count: 0 },
  { Icon: Truck, label: "Shipped", count: 0 },
  { Icon: Star, label: "Review", count: 0 },
  { Icon: Undo2, label: "Returns", count: 0 },
];

const rewards = [
  { Icon: Coins, label: "Coins", value: "0" },
  { Icon: Ticket, label: "Coupons", value: "0" },
  { Icon: Gift, label: "Credit", value: "₵0" },
  { Icon: CreditCard, label: "Cards", value: "0" },
];

const menu = [
  { Icon: Heart, label: "My Wishlist", meta: "" },
  { Icon: ShoppingBag, label: "Recently Viewed", meta: "" },
  { Icon: MapPin, label: "My Addresses", meta: "" },
  { Icon: Package, label: "Import Products", meta: "Admin", to: "/import" },
  { Icon: MessageCircle, label: "Messages", meta: "" },
  { Icon: Bell, label: "Notifications", meta: "On" },
  { Icon: HelpCircle, label: "Help Center", meta: "" },
  { Icon: Settings, label: "Settings", meta: "" },
];

// ── Auth Screen ───────────────────────────────────────────────────────────────
type AuthMode = "signin" | "signup";

function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = mode === "signup"
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);
    setLoading(false);
    if (err) setError(err);
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    const err = await signInWithGoogle();
    setLoading(false);
    if (err) setError(err);
  };

  const handleApple = async () => {
    setError("");
    setLoading(true);
    const err = await signInWithApple();
    setLoading(false);
    if (err) setError(err);
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

        {/* Mode tabs */}
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

        {/* Social buttons */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-border rounded-full py-3 bg-white hover:bg-secondary transition mb-3 font-semibold text-sm disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <button
          onClick={handleApple}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-border rounded-full py-3 bg-black text-white hover:bg-gray-900 transition mb-4 font-semibold text-sm disabled:opacity-50"
        >
          <svg width="16" height="19" viewBox="0 0 814 1000" fill="white">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.3 0 663 0 541.8c0-207.1 133.4-316.9 264.4-316.9 69.4 0 127.1 45.5 170.5 45.5 42.1 0 108.2-48 185.8-48 29.9 0 108.2 2.6 168.6 81.2zm-56.1-184.7c-28.1 33.5-74.8 59.8-132.3 59.8-5.5 0-11-.6-17.3-2.2-1.3-5.5-1.9-10.7-1.9-16.3 0-63.2 45.5-130.6 102.8-161.8 28.7-16.3 76.6-29.3 109.7-30.6.6 6.5 1.3 13 1.3 18.6 0 61-22.6 122-62.3 132.5z"/>
          </svg>
          Continue with Apple
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-foreground/70">Email Address</label>
            <input
              type="email" required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="e.g. john@example.com"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-foreground/70">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl border border-border px-4 py-3 pr-12 text-sm bg-white outline-none focus:border-primary transition"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2 font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-extrabold py-3.5 rounded-full mt-1 hover:opacity-90 active:scale-[0.98] transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}

// ── Onboarding Screen ─────────────────────────────────────────────────────────
function OnboardingScreen() {
  const { completeOnboarding, firebaseUser, profile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || firebaseUser?.displayName || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter your name.");
    setLoading(true);
    await completeOnboarding(form);
    setLoading(false);
  };

  const skip = () => completeOnboarding({
    name: profile?.name || firebaseUser?.displayName || "User",
    phone: "",
    address: "",
  });

  return (
    <PhoneShell>
      <div className="min-h-[85vh] flex flex-col justify-center px-6 pb-32">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold">Almost there!</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Add your details so we can deliver to you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-foreground/70">Full Name *</label>
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
              placeholder="e.g. Circle, Accra, Ghana"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white outline-none focus:border-primary transition"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2 font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-extrabold py-3.5 rounded-full mt-2 hover:opacity-90 active:scale-[0.98] transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue to Shop"}
          </button>

          <button
            type="button"
            onClick={skip}
            className="text-xs text-muted-foreground text-center"
          >
            Skip for now
          </button>
        </form>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────────────
function ProfileScreen() {
  const { profile, signOut, firebaseUser } = useAuth();
  const name = profile?.name || firebaseUser?.displayName || "User";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

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
          {firebaseUser?.photoURL ? (
            <img src={firebaseUser.photoURL} alt={name} className="w-16 h-16 rounded-full object-cover shadow-xl border-2 border-white" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center text-2xl font-extrabold text-primary shadow-xl">
              {initials}
            </div>
          )}
          <div>
            <p className="text-lg font-extrabold">{name}</p>
            <p className="text-xs text-white/85">{profile?.email || firebaseUser?.email}</p>
            {profile?.phone && <p className="text-xs text-white/70 mt-0.5">{profile.phone}</p>}
            <div className="mt-1.5">
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
                <Icon className="w-6 h-6 text-foreground/80" />
                <span className="text-[10px] font-semibold text-foreground/80">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Address */}
      {profile?.address && (
        <section className="px-4 mt-4">
          <div className="bg-white rounded-2xl border border-border/60 shadow-[var(--shadow-card)] px-4 py-3 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Default delivery address</p>
              <p className="text-sm font-semibold">{profile.address}</p>
            </div>
          </div>
        </section>
      )}

      {/* Promo */}
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

// ── Main ──────────────────────────────────────────────────────────────────────
function MePage() {
  const { isLoggedIn, isLoading, needsOnboarding } = useAuth();

  if (isLoading) {
    return (
      <PhoneShell>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <BottomNav />
      </PhoneShell>
    );
  }

  if (!isLoggedIn) return <AuthScreen />;
  if (needsOnboarding) return <OnboardingScreen />;
  return <ProfileScreen />;
}
