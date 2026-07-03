import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ChevronLeft, Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ProductCard";
import { categoryList } from "@/data/products";
import { fetchCjProducts } from "@/lib/cj-api";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

// Discount badges — varied, not all the same
const DISCOUNT_BADGES = ["-20%", "-25%", "-30%", "-35%", "-40%", "-45%", "-50%", "-55%", "-60%", "-65%", "-70%"];

function getRandomBadge(id: string): string {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return DISCOUNT_BADGES[hash % DISCOUNT_BADGES.length];
}

// Deterministic shuffle based on a seed string
function shuffleWithSeed<T>(arr: T[], seed: string): T[] {
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return [...arr].sort((a: any, b: any) => {
    const ai = (a.id?.charCodeAt(0) + hash) % 97;
    const bi = (b.id?.charCodeAt(0) + hash) % 97;
    return ai - bi;
  });
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-border/60 shadow-sm animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-2.5 flex flex-col gap-2">
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-5 bg-gray-100 rounded w-16 mt-1" />
      </div>
    </div>
  );
}

function CategoriesPage() {
  const [active, setActive] = useState(categoryList[0].slug);
  const [search, setSearch] = useState("");

  // Fetch all products once, then filter client-side by category
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["cj-all-products"],
    queryFn: () => fetchCjProducts({ data: { size: 200 } }),
    staleTime: 5 * 60 * 1000,
  });

  // Filter by active category + search, then shuffle so new products appear anywhere
  const productsList = useMemo(() => {
    const filtered = (Array.isArray(allProducts) ? allProducts : [])
      .filter((p: any) => {
        const matchesCategory = p.category?.toLowerCase() === active.toLowerCase();
        const matchesSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      // Assign varied discount badges
      .map((p: any) => ({
        ...p,
        badge: getRandomBadge(p.id),
      }));
    // Shuffle so new products don't always appear at top
    return shuffleWithSeed(filtered, active);
  }, [allProducts, active, search]);

  const activeCategory = categoryList.find((c) => c.slug === active);

  return (
    <PhoneShell>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border/60">
        <div className="flex items-center gap-3 px-4 pt-5 pb-2">
          <Link to="/" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-extrabold flex-1">Shop by Category</h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5">
            <SlidersHorizontal className="w-4 h-4 text-foreground/70" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              placeholder={`Search in ${active}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground text-xs">✕</button>
            )}
          </div>
        </div>

        {/* Category pills scroll */}
        <div className="overflow-x-auto no-scrollbar px-4 pb-3">
          <div className="flex gap-2 w-max">
            {categoryList.map((c) => {
              const isActive = c.slug === active;
              return (
                <button
                  key={c.slug}
                  onClick={() => { setActive(c.slug); setSearch(""); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-foreground/70 border-border hover:bg-secondary"
                  }`}
                >
                  <img src={c.cover} alt="" className="w-4 h-4 rounded-full object-cover" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Category hero banner */}
      {activeCategory && (
        <div className={`mx-4 mt-4 mb-2 rounded-2xl overflow-hidden bg-gradient-to-r ${activeCategory.tint} border border-white shadow-sm`}>
          <div className="flex items-center gap-3 p-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
              <img src={activeCategory.cover} alt={activeCategory.label} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary tracking-widest uppercase">{activeCategory.label}</p>
              <p className="text-sm font-extrabold mt-0.5">Up to 70% off today</p>
              <p className="text-[11px] text-muted-foreground">{productsList.length} items available</p>
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="px-4 pb-32">
        <div className="grid grid-cols-2 gap-3 mt-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
          ) : productsList.length > 0 ? (
            productsList.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
              <p className="text-4xl mb-3">🛍️</p>
              <p className="text-sm font-bold text-foreground/60">No {active} products yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add products to your list on your supplier dashboard</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </PhoneShell>
  );
}
