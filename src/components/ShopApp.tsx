import { useState } from "react";
import {
  Bell,
  Search,
  Shirt,
  Smartphone,
  Sparkles,
  Home as HomeIcon,
  Footprints,
  ShoppingBag,
  Watch,
  Gamepad2,
  Flame,
  Heart,
  ShoppingCart,
  Type,
  Pencil,
  MessageSquare,
  Scan,
  User,
} from "lucide-react";
import { Splash } from "@/components/Splash";

type Category = {
  label: string;
  Icon: typeof Shirt;
  bg: string;
  fg: string;
};

const categories: Category[] = [
  { label: "Fashion", Icon: Shirt, bg: "bg-pill-pink/50", fg: "text-rose-600" },
  { label: "Electronics", Icon: Smartphone, bg: "bg-pill-blue/50", fg: "text-sky-700" },
  { label: "Beauty", Icon: Sparkles, bg: "bg-pill-coral/50", fg: "text-orange-600" },
  { label: "Home", Icon: HomeIcon, bg: "bg-pill-green/50", fg: "text-emerald-700" },
  { label: "Shoes", Icon: Footprints, bg: "bg-pill-orange/60", fg: "text-orange-700" },
  { label: "Bags", Icon: ShoppingBag, bg: "bg-pill-lavender/60", fg: "text-purple-700" },
  { label: "Watches", Icon: Watch, bg: "bg-pill-teal/60", fg: "text-teal-700" },
  { label: "Gaming", Icon: Gamepad2, bg: "bg-pill-indigo/60", fg: "text-indigo-700" },
];

type Deal = {
  title: string;
  discount: string;
  price: string;
  original: string;
  emoji: string;
  bg: string;
};

const deals: Deal[] = [
  { title: "Wireless Earbuds Pro", discount: "-74%", price: "$18.99", original: "$72.00", emoji: "🎧", bg: "from-slate-100 to-slate-200" },
  { title: "Leather Crossbody Bag", discount: "-73%", price: "$24.50", original: "$89.99", emoji: "👜", bg: "from-amber-50 to-orange-100" },
  { title: "Smart Fitness Watch", discount: "-68%", price: "$29.99", original: "$94.00", emoji: "⌚", bg: "from-pink-50 to-rose-100" },
  { title: "Retro Sneakers", discount: "-55%", price: "$34.90", original: "$78.00", emoji: "👟", bg: "from-sky-50 to-indigo-100" },
];

export function ShopHome() {
  return (
    <div
      className="relative min-h-screen w-full max-w-md mx-auto pb-24"
      style={{
        background:
          "var(--background)",
        backgroundImage:
          "radial-gradient(ellipse 70% 45% at 100% 0%, oklch(0.62 0.22 300 / 0.22), transparent 70%), radial-gradient(ellipse 40% 30% at 0% 0%, oklch(0.75 0.15 320 / 0.12), transparent 70%)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-soft)]">
            <div className="w-4 h-4 rounded-full border-2 border-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Sphere</span>
        </div>
        <button
          aria-label="Notifications"
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition"
        >
          <Bell className="w-5 h-5 text-foreground/80" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-flame" />
        </button>
      </header>

      {/* Search */}
      <div className="px-5">
        <div className="flex items-center gap-2 bg-white rounded-full pl-4 pr-1.5 py-1.5 shadow-[var(--shadow-card)] border border-border/60">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent outline-none text-sm py-2 placeholder:text-muted-foreground"
            placeholder="Search for anything..."
          />
          <button className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition">
            Search
          </button>
        </div>
      </div>

      {/* Hero banner */}
      <div className="px-5 mt-5">
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white shadow-[var(--shadow-soft)]"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-16 bottom-2 w-20 h-20 rounded-full bg-white/10" />
          <p className="text-[11px] font-bold tracking-[0.2em] text-white/90">
            NEW USER OFFER
          </p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight">Up to 90% off</h2>
          <p className="mt-1 text-sm text-white/90">Free shipping on your first order</p>
          <button className="mt-4 bg-white text-primary text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/95 transition">
            Claim now
          </button>
        </div>
      </div>

      {/* Categories */}
      <section className="px-5 mt-6 grid grid-cols-4 gap-y-5 gap-x-2">
        {categories.map(({ label, Icon, bg, fg }) => (
          <button key={label} className="flex flex-col items-center gap-2 group">
            <div
              className={`w-16 h-16 rounded-full ${bg} flex items-center justify-center transition group-active:scale-95 shadow-[var(--shadow-card)]`}
            >
              <Icon className={`w-7 h-7 ${fg}`} strokeWidth={2} />
            </div>
            <span className="text-xs font-semibold text-foreground/90">{label}</span>
          </button>
        ))}
      </section>

      {/* Flash deals header */}
      <div className="px-5 mt-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-flame text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-[var(--shadow-soft)]">
            <Flame className="w-3.5 h-3.5" />
            Flash Deals
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Ends in <span className="text-foreground font-semibold">02:14:37</span>
          </span>
        </div>
        <button className="text-xs font-semibold text-primary flex items-center gap-0.5">
          See all ›
        </button>
      </div>

      {/* Deals row */}
      <div className="mt-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-5 pb-2">
          {deals.map((d) => (
            <DealCard key={d.title} deal={d} />
          ))}
        </div>
      </div>

      {/* Floating cart */}
      <button
        aria-label="Cart"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[var(--shadow-soft)] hover:scale-105 active:scale-95 transition z-30"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 bg-flame text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
          3
        </span>
      </button>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md">
        <div className="mx-3 mb-3 bg-white/95 backdrop-blur rounded-3xl border border-border/70 shadow-[0_-4px_24px_-8px_oklch(0.2_0.02_280/0.15)] flex items-center justify-between px-4 py-2.5">
          <NavItem icon={<HomeIcon className="w-5 h-5" />} label="Home" active />
          <div className="flex items-center gap-2 bg-secondary rounded-full px-3 py-2">
            <ActionBtn icon={<Scan className="w-4 h-4" />} />
            <ActionBtn icon={<Type className="w-4 h-4" />} />
            <ActionBtn icon={<Pencil className="w-4 h-4" />} />
            <ActionBtn icon={<MessageSquare className="w-4 h-4" />} />
          </div>
          <NavItem icon={<User className="w-5 h-5" />} label="Me" />
        </div>
      </nav>
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="min-w-[46%] w-[46%] rounded-2xl overflow-hidden bg-white border border-border/60 shadow-[var(--shadow-card)]">
      <div className={`relative aspect-square bg-gradient-to-br ${deal.bg} flex items-center justify-center`}>
        <span className="text-6xl drop-shadow-sm">{deal.emoji}</span>
        <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          {deal.discount}
        </span>
        <button
          onClick={() => setLiked((l) => !l)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:scale-105 transition"
          aria-label="Favorite"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-flame text-flame" : "text-foreground/60"}`} />
        </button>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold line-clamp-1">{deal.title}</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-primary">{deal.price}</span>
          <span className="text-[10px] text-muted-foreground line-through">{deal.original}</span>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-0.5 px-3 ${active ? "text-primary" : "text-muted-foreground"}`}>
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

function ActionBtn({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-8 h-8 flex items-center justify-center rounded-full text-foreground/70 hover:bg-white transition">
      {icon}
    </button>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  return (
    <>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <ShopHome />
    </>
  );
}
