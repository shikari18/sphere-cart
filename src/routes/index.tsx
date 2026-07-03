import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Search, Flame, ChevronRight } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ProductCard";
import { products, categoryList } from "@/data/products";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <PhoneShell>
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-soft)]">
            <div className="w-4 h-4 rounded-full border-2 border-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Sphere</span>
        </div>
        <button aria-label="Notifications" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition">
          <Bell className="w-5 h-5 text-foreground/80" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-flame" />
        </button>
      </header>

      {/* Search */}
      <div className="px-5">
        <div className="flex items-center gap-2 bg-white rounded-full pl-4 pr-1.5 py-1.5 shadow-[var(--shadow-card)] border border-border/60">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input className="flex-1 bg-transparent outline-none text-sm py-2 placeholder:text-muted-foreground" placeholder="Search for anything..." />
          <button className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition">Search</button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 mt-5">
        <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-16 bottom-2 w-20 h-20 rounded-full bg-white/10" />
          <p className="text-[11px] font-bold tracking-[0.2em] text-white/90">NEW USER OFFER</p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight">Up to 90% off</h2>
          <p className="mt-1 text-sm text-white/90">Free shipping on your first order</p>
          <button className="mt-4 bg-white text-primary text-sm font-semibold px-5 py-2 rounded-full">Claim now</button>
        </div>
      </div>

      {/* Categories — professional pill tiles */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">Shop by category</h3>
          <Link to="/categories" className="text-xs font-semibold text-primary flex items-center">
            All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {categoryList.map((c) => (
            <Link
              key={c.slug}
              to="/categories"
              className={`flex flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-b ${c.tint} p-2 border border-white shadow-[var(--shadow-card)] active:scale-95 transition`}
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-white">
                <img src={c.cover} alt={c.label} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-semibold text-foreground/90">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash deals */}
      <div className="px-5 mt-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-flame text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-[var(--shadow-soft)]">
            <Flame className="w-3.5 h-3.5" /> Flash Deals
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Ends in <span className="text-foreground font-semibold">02:14:37</span>
          </span>
        </div>
        <button className="text-xs font-semibold text-primary">See all ›</button>
      </div>

      <div className="mt-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-5 pb-1">
          {products.slice(0, 6).map((p) => (
            <div key={p.id} className="min-w-[46%] w-[46%]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      {/* For You grid */}
      <section className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span className="w-1 h-4 rounded bg-primary" /> For You
          </h3>
          <span className="text-[10px] text-muted-foreground">Handpicked daily</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <BottomNav />
    </PhoneShell>
  );
}
