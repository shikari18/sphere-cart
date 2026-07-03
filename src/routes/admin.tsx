import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users, Package, Bot, BarChart3, LogOut, Trash2, Edit2,
  Play, RefreshCw, Check, X, ChevronRight, ShoppingBag,
  ShieldCheck, Eye, EyeOff, TrendingUp, Star, Bell,
} from "lucide-react";
import {
  collection, onSnapshot, deleteDoc, doc, setDoc,
  getDocs, query, orderBy, limit, getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchCjProducts, runCjAutoBot, fetchBotCandidates, saveBotProduct } from "@/lib/cj-api";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "goodies1992";
const SESSION_KEY = "mbshop_admin";

type Tab = "stats" | "users" | "products" | "bot";

// ── Login ─────────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      onLogin();
    } else {
      setError("Invalid admin credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-lg mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold">Admin Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">MB Shop Control Center</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-border/60">
          <form onSubmit={handle} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/70">Admin Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/70">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border px-4 py-3 pr-12 text-sm outline-none focus:border-primary transition"
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2 font-semibold">{error}</p>}
            <button type="submit" className="w-full bg-primary text-white font-extrabold py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition shadow-lg">
              Sign In to Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState({ users: 0, botProducts: 0, orders: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [usersSnap, botSnap] = await Promise.all([
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "bot_products")),
        ]);
        setStats({ users: usersSnap.data().count, botProducts: botSnap.data().count, orders: 0 });
      } catch {}
    };
    load();
    // Real-time user count
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setStats(s => ({ ...s, users: snap.size }));
    });
    return unsub;
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, Icon: Users, color: "bg-blue-500", sub: "Registered accounts" },
    { label: "Bot Products", value: stats.botProducts, Icon: Bot, color: "bg-purple-500", sub: "Auto-imported" },
    { label: "Total Orders", value: stats.orders, Icon: Package, color: "bg-green-500", sub: "All time" },
    { label: "Active Now", value: "-", Icon: TrendingUp, color: "bg-orange-500", sub: "Live sessions" },
  ];

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-4 border border-border/60 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <c.Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-extrabold">{c.value}</p>
            <p className="text-xs font-semibold text-foreground/80 mt-0.5">{c.label}</p>
            <p className="text-[10px] text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-border/60 shadow-sm">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "View Users", tab: "users" },
            { label: "View Products", tab: "products" },
            { label: "Run Bot", tab: "bot" },
            { label: "Edit Prices", tab: "products" },
          ].map((a) => (
            <button key={a.label} className="flex items-center justify-between bg-secondary/60 rounded-xl px-3 py-2.5 text-xs font-semibold hover:bg-secondary transition">
              {a.label} <ChevronRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const removeUser = async (uid: string) => {
    if (!confirm("Remove this user?")) return;
    setRemoving(uid);
    await deleteDoc(doc(db, "users", uid));
    setRemoving(null);
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-4 flex flex-col gap-3">
      <input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary bg-white"
      />
      <p className="text-xs text-muted-foreground">{filtered.length} of {users.length} accounts</p>
      {filtered.map((u) => {
        const initials = (u.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
        return (
          <div key={u.id} className="bg-white rounded-2xl p-4 border border-border/60 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-extrabold text-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{u.name || "No name"}</p>
              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
              {u.address && <p className="text-xs text-muted-foreground truncate">📍 {u.address}</p>}
              <div className="flex gap-1 mt-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${u.onboardingComplete ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {u.onboardingComplete ? "✓ Active" : "Pending"}
                </span>
              </div>
            </div>
            <button
              onClick={() => removeUser(u.id)}
              disabled={removing === u.id}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition disabled:opacity-50"
            >
              {removing === u.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, removedSnap] = await Promise.all([
          fetchCjProducts({ data: { size: 100 } }),
          getDocs(collection(db, "removed_products")),
        ]);
        setProducts(Array.isArray(prods) ? prods : []);
        setRemovedIds(new Set(removedSnap.docs.map((d) => d.id)));
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const savePrice = async (id: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) return;
    await setDoc(doc(db, "product_overrides", id), { price }, { merge: true });
    setProducts(ps => ps.map(p => p.id === id ? { ...p, price } : p));
    setEditingId(null);
  };

  const toggleRemove = async (id: string) => {
    if (removedIds.has(id)) {
      await deleteDoc(doc(db, "removed_products", id));
      setRemovedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      await setDoc(doc(db, "removed_products", id), { productId: id, removedAt: new Date().toISOString() });
      setRemovedIds(prev => new Set([...prev, id]));
    }
  };

  const filtered = products.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mt-4 flex flex-col gap-3">
      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary bg-white"
      />
      <p className="text-xs text-muted-foreground">{filtered.length} products · {removedIds.size} hidden</p>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 text-primary animate-spin" /></div>
      ) : filtered.map((p) => {
        const isRemoved = removedIds.has(p.id);
        return (
          <div key={p.id} className={`bg-white rounded-2xl p-3 border shadow-sm flex gap-3 ${isRemoved ? "opacity-50 border-destructive/30" : "border-border/60"}`}>
            <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 bg-secondary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold line-clamp-2 leading-snug">{p.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{p.category}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {editingId === p.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">₵</span>
                    <input
                      type="number" value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-20 rounded-lg border border-border px-2 py-1 text-xs outline-none focus:border-primary"
                      placeholder="New price"
                      autoFocus
                    />
                    <button onClick={() => savePrice(p.id)} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-destructive"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-extrabold text-primary">₵{p.price?.toFixed?.(2)}</span>
                    <button onClick={() => { setEditingId(p.id); setNewPrice(String(p.price)); }}
                      className="text-muted-foreground hover:text-foreground transition">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleRemove(p.id)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition shrink-0 ${isRemoved ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-destructive/10 text-destructive hover:bg-destructive/20"}`}
            >
              {isRemoved ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        );
      })}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
}

// ── Bot Tab ───────────────────────────────────────────────────────────────────
function BotTab() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentProduct: any | null }>({ current: 0, total: 0, currentProduct: null });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [botProducts, setBotProducts] = useState<any[]>([]);
  const [botStatus, setBotStatus] = useState<{ lastRun?: string; addedToday?: number } | null>(null);
  const cancelRef = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "bot_products"), orderBy("addedAt", "desc"), limit(10)),
      (snap) => setBotProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    getDocs(collection(db, "bot_status")).then(snap => {
      const latest = snap.docs.find(d => d.id === "latest");
      if (latest) setBotStatus(latest.data() as any);
    });
    return unsub;
  }, []);

  const runBot = async () => {
    setRunning(true);
    setDone(false);
    setError("");
    setProgress({ current: 0, total: 0, currentProduct: null });
    cancelRef[1](false);

    try {
      // Step 1: Fetch candidates from CJ (fast — no Firestore writes)
      const candidates = await fetchBotCandidates({ data: {} });
      if (!candidates || candidates.length === 0) {
        throw new Error("No products found in your CJ My Products list.");
      }

      // Get existing IDs to skip duplicates
      const existingSnap = await getDocs(collection(db, "bot_products"));
      const existingIds = new Set(existingSnap.docs.map((d) => d.id));
      const toAdd = candidates.filter((p: any) => !existingIds.has(String(p.id)));

      setProgress({ current: 0, total: toAdd.length, currentProduct: null });

      if (toAdd.length === 0) {
        setDone(true);
        setRunning(false);
        return;
      }

      // Step 2: Save one product at a time with live progress
      let added = 0;
      for (const product of toAdd) {
        if (cancelRef[0]) break;

        setProgress({ current: added, total: toAdd.length, currentProduct: product });

        await saveBotProduct({ data: { product } });
        added++;

        // Small delay so UI updates are visible
        await new Promise(r => setTimeout(r, 200));
      }

      // Update bot status
      await setDoc(doc(db, "bot_status", "latest"), {
        lastRun: new Date().toISOString(),
        addedToday: added,
      });

      setProgress({ current: added, total: toAdd.length, currentProduct: null });
      setDone(true);
      setBotStatus({ lastRun: new Date().toISOString(), addedToday: added });
    } catch (e: any) {
      setError(e.message || "Bot failed. Check your CJ My Products list.");
    }

    setRunning(false);
  };

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 border border-border/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold">Auto-Import Bot</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Imports your CJ products with 15% markup</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot className={`w-6 h-6 text-primary ${running ? "animate-pulse" : ""}`} />
          </div>
        </div>

        {botStatus && !running && (
          <div className="bg-secondary/60 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold">Last run</p>
              <p className="text-[11px] text-muted-foreground">{botStatus.lastRun ? new Date(botStatus.lastRun).toLocaleString() : "Never"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold">Added</p>
              <p className="text-lg font-extrabold text-primary">{botStatus.addedToday ?? 0}</p>
            </div>
          </div>
        )}

        {/* Live progress */}
        {running && (
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{progress.current} / {progress.total} products</span>
              <span className="text-primary">{pct}%</span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            {progress.currentProduct && (
              <div className="flex items-center gap-2 bg-secondary/60 rounded-xl p-2.5">
                {progress.currentProduct.image && (
                  <img src={progress.currentProduct.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 bg-secondary" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate">{progress.currentProduct.title}</p>
                  <p className="text-[10px] text-muted-foreground">Adding... ₵{progress.currentProduct.price?.toFixed(2)}</p>
                </div>
                <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
              </div>
            )}
          </div>
        )}

        {done && !running && (
          <div className="mb-4 bg-green-50 rounded-xl p-3 border border-green-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-xs text-green-700 font-semibold">Done! {progress.current} products imported successfully.</p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-destructive/10 rounded-xl p-3 border border-destructive/20">
            <p className="text-xs text-destructive font-semibold">{error}</p>
          </div>
        )}

        <button
          onClick={runBot}
          disabled={running}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-extrabold py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition disabled:opacity-60 shadow-lg"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? `Importing... (${progress.current}/${progress.total})` : "Run Bot Now"}
        </button>
      </div>

      {/* Recent bot products */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Recently Added</h3>
        <div className="flex flex-col gap-2">
          {botProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-3 border border-border/60 shadow-sm flex items-center gap-3">
              {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover bg-secondary shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{p.title}</p>
                <p className="text-xs text-primary font-bold">₵{p.price?.toFixed?.(2)}</p>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold shrink-0">{p.category}</span>
            </div>
          ))}
          {botProducts.length === 0 && !running && (
            <div className="text-center py-8 bg-white rounded-2xl border border-border/60">
              <Bot className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No bot products yet</p>
              <p className="text-xs text-muted-foreground">Run the bot to import your products</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("stats");

  const tabs: { id: Tab; label: string; Icon: any }[] = [
    { id: "stats", label: "Stats", Icon: BarChart3 },
    { id: "users", label: "Users", Icon: Users },
    { id: "products", label: "Products", Icon: Package },
    { id: "bot", label: "Bot", Icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-border/60 px-5 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold">MB Shop Admin</h1>
              <p className="text-[11px] text-muted-foreground">Real-time dashboard</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition" title="Sign out">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-secondary rounded-2xl p-1">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-[11px] font-bold transition ${
                tab === id ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-20 overflow-y-auto">
        {tab === "stats" && <StatsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "bot" && <BotTab />}
      </div>
    </div>
  );
}

function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "true");
  const logout = () => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); };
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={logout} />;
}
