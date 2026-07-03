import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ProductCard";
import { products, categoryList } from "@/data/products";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [active, setActive] = useState(categoryList[0].slug);
  const list = products.filter((p) => p.category === active);

  return (
    <PhoneShell>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-3 px-4 pt-5 pb-3">
          <Link to="/" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 flex items-center gap-2 bg-secondary rounded-full px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input placeholder="Search categories..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left rail */}
        <aside className="w-24 shrink-0 bg-secondary/60 min-h-[70vh]">
          {categoryList.map((c) => {
            const isActive = c.slug === active;
            return (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`relative w-full flex flex-col items-center gap-1 py-4 text-[11px] font-semibold transition ${
                  isActive ? "bg-white text-primary" : "text-foreground/70"
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-primary" />}
                <div className={`w-11 h-11 rounded-xl overflow-hidden border ${isActive ? "border-primary/40" : "border-transparent"}`}>
                  <img src={c.cover} alt={c.label} loading="lazy" className="w-full h-full object-cover" />
                </div>
                {c.label}
              </button>
            );
          })}
        </aside>

        {/* Right content */}
        <main className="flex-1 p-3">
          <div className="rounded-2xl bg-gradient-to-r from-primary-soft to-white p-3 mb-3 border border-border/60">
            <p className="text-[10px] font-bold tracking-widest text-primary">FEATURED</p>
            <p className="text-sm font-bold mt-0.5">{active} deals up to 70% off</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {list.length === 0 && (
              <p className="col-span-2 text-center text-sm text-muted-foreground py-10">No products yet.</p>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </PhoneShell>
  );
}
