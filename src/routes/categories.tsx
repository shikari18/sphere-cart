import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ProductCard";
import { categoryList } from "@/data/products";
import { fetchCjProducts } from "@/lib/cj-api";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-border/60 shadow-[var(--shadow-card)] animate-pulse">
      <div className="aspect-square bg-secondary/80" />
      <div className="p-2.5 flex flex-col gap-2">
        <div className="h-3.5 bg-secondary rounded w-5/6" />
        <div className="h-3 bg-secondary rounded w-2/3" />
        <div className="flex items-center justify-between gap-1 mt-1">
          <div className="h-5 bg-secondary rounded w-16" />
          <div className="w-7 h-7 rounded-full bg-secondary" />
        </div>
      </div>
    </div>
  );
}

function CategoriesPage() {
  const [active, setActive] = useState(categoryList[0].slug);
  const [search, setSearch] = useState("");

  // Query products dynamically from CJ based on selected category & search input
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["cj-category-products", active, search],
    queryFn: () => fetchCjProducts({ 
      category: active, 
      search: search || undefined, 
      size: 20 
    }),
  });

  const productsList = Array.isArray(products) ? products : [];

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
            <input 
              placeholder="Search categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" 
            />
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
                onClick={() => {
                  setActive(c.slug);
                  setSearch(""); // Reset search on category change
                }}
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
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))
            ) : (
              productsList.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            )}
            {!isLoading && productsList.length === 0 && (
              <p className="col-span-2 text-center text-sm text-muted-foreground py-10">No products found.</p>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </PhoneShell>
  );
}
