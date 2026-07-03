import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Users, Package, Bot, BarChart3, LogOut, Trash2, Edit2,
  Play, RefreshCw, Check, X, ChevronRight, ShoppingBag,
} from "lucide-react";
import {
  collection, onSnapshot, deleteDoc, doc, setDoc,
  getDocs, query, orderBy, limit, getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchCjProducts, runCjAutoBot } from "@/lib/cj-api";

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white">MB Shop Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to access dashboard</p>
        </div>
        <form onSubmit={handle} className="flex flex-col gap-4">
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-xs text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState({ users: 0, products: 0, botProducts: 0, orders: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [usersSnap, botSnap] = await Promise.all([
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "bot_products")),
        ]);
        setStats({
          users: usersSnap.data().count,
          botProducts: botSnap.data().count,
          products: botSnap.data().count,
          orders: 0,
        });
      } catch {}
    };
    load();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, color: "bg-blue-500" },
    { label: "Bot Products", value: stats.botProducts, color: "bg-purple-500" },
    { label: "Total Orders", value: stats.orders, color: "bg-green-500" },
    { label: "Active Today", value: "-", color: "bg-orange-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
          <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white">{c.value}</p>
          <p className="text-xs text-gray-400 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const removeUser = async (uid: string) => {
    setRemoving(uid);
    await deleteDoc(doc(db, "users", uid));
    setRemoving(null);
  };

  return (
    <div className="mt-4">
      <p className="text-xs text-gray-400 mb-3">{users.length} accounts registered</p>
      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div key={u.id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{u.name || "No name"}</p>
              <p className="text-xs text-gray-400 truncate">{u.email}</p>
              {u.phone && <p className="text-xs text-gray-500">{u.phone}</p>}
              {u.address && <p className="text-xs text-gray-500 truncate">{u.address}</p>}
              <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${u.onboardingComplete ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
                {u.onboardingComplete ? "✓ Onboarded" : "Pending onboarding"}
              </span>
            </div>
            <button
              onClick={() => removeUser(u.id)}
              disabled={removing === u.id}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-900/40 text-red-400 hover:bg-red-900/70 transition disabled:opacity-50"
            >
              {removing === u.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No users yet.</p>
        )}
      </div>
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [botProducts, setBotProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, botSnap, removedSnap] = await Promise.all([
          fetchCjProducts({ data: { size: 50 } }),
          getDocs(collection(db, "bot_products")),
          getDocs(collection(db, "removed_products")),
        ]);
        setProducts(Array.isArray(prods) ? prods : []);
        setBotProducts(botSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setRemovedIds(removedSnap.docs.map((d) => d.data().productId as string));
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const savePrice = async (id: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) return;
    await setDoc(doc(db, "product_overrides", id), { price }, { merge: true });
    setEditingId(null);
    setNewPrice("");
  };

  const removeProduct = async (id: string) => {
    await setDoc(doc(db, "removed_products", id), { productId: id, removedAt: new Date().toISOString() });
    setRemovedIds((prev) => [...prev, id]);
  };

  const restoreProduct = async (id: string) => {
    await deleteDoc(doc(db, "removed_products", id));
    setRemovedIds((prev) => prev.filter((x) => x !== id));
  };

  const allProducts = [...products, ...botProducts];

  return (
    <div className="mt-4">
      <p className="text-xs text-gray-400 mb-3">{allProducts.length} products ({botProducts.length} from bot)</p>
      {loading ? (
        <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 text-primary animate-spin" /></div>
      ) : (
        <div className="flex flex-col gap-3">
          {allProducts.map((p) => {
            const isRemoved = removedIds.includes(p.id);
            return (
              <div key={p.id} className={`bg-gray-800 rounded-2xl p-4 border ${isRemoved ? "border-red-800 opacity-60" : "border-gray-700"} flex gap-3`}>
                <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-700" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white line-clamp-2">{p.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {editingId === p.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number" value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-20 rounded-lg border border-gray-600 bg-gray-700 text-white text-xs px-2 py-1 outline-none"
                          placeholder="₵ price"
                        />
                        <button onClick={() => savePrice(p.id)} className="text-green-400"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="text-red-400"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-primary">₵{p.price?.toFixed?.(2) ?? p.price}</span>
                        <button onClick={() => { setEditingId(p.id); setNewPrice(String(p.price)); }}
                          className="text-gray-400 hover:text-white">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${p.addedAt ? "bg-purple-900 text-purple-300" : "bg-blue-900 text-blue-300"}`}>
                      {p.addedAt ? "Bot" : "CJ"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => isRemoved ? restoreProduct(p.id) : removeProduct(p.id)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition ${isRemoved ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400 hover:bg-red-900/70"}`}
                >
                  {isRemoved ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Bot Tab ───────────────────────────────────────────────────────────────────
function BotTab() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ added: number; timestamp: string } | null>(null);
  const [error, setError] = useState("");
  const [botProducts, setBotProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "bot_products"), orderBy("addedAt", "desc"), limit(20)),
      (snap) => setBotProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  const runBot = async () => {
    setRunning(true);
    setError("");
    try {
      const res = await runCjAutoBot({ data: {} });
      setResult(res as any);
    } catch (e: any) {
      setError(e.message || "Bot failed. Try again.");
    }
    setRunning(false);
  };

  return (
    <div className="mt-4">
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-white">CJ Auto-Import Bot</p>
            <p className="text-xs text-gray-400">Fetches 70 products/day with 15% markup</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
        <button
          onClick={runBot}
          disabled={running}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? "Bot running..." : "Run Bot Now"}
        </button>
        {result && (
          <div className="mt-3 bg-green-900/30 rounded-xl p-3 border border-green-800">
            <p className="text-xs text-green-400 font-semibold">✓ Added {result.added} products</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{result.timestamp}</p>
          </div>
        )}
        {error && (
          <p className="mt-3 text-xs text-red-400 bg-red-900/20 rounded-xl px-3 py-2">{error}</p>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-3">Recently added by bot ({botProducts.length} shown)</p>
      <div className="flex flex-col gap-2">
        {botProducts.map((p) => (
          <div key={p.id} className="bg-gray-800 rounded-xl p-3 border border-gray-700 flex items-center gap-3">
            {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-700 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{p.title}</p>
              <p className="text-xs text-primary">₵{p.price?.toFixed?.(2)}</p>
            </div>
            <span className="text-[10px] text-gray-500">{p.category}</span>
          </div>
        ))}
        {botProducts.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">No bot products yet. Run the bot to import.</p>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("stats");

  const tabs: { id: Tab; label: string; Icon: any }[] = [
    { id: "stats", label: "Stats", Icon: BarChart3 },
    { id: "users", label: "Users", Icon: Users },
    { id: "products", label: "Products", Icon: Package },
    { id: "bot", label: "Bot", Icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-extrabold">MB Shop Admin</h1>
            <p className="text-xs text-gray-400">Real-time dashboard</p>
          </div>
          <button onClick={onLogout} className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[11px] font-semibold transition ${
                tab === id ? "bg-primary text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-16 overflow-y-auto">
        {tab === "stats" && <StatsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "bot" && <BotTab />}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "true");

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={logout} />;
}
