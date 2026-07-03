import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Search, Flame, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard, FloatingCart } from "@/components/ProductCard";
import { categoryList } from "@/data/products";
import { fetchCjProducts } from "@/lib/cj-api";

export const Route = createFileRoute("/")({
  component: Home,
});

const heroSlides = [
  {
    id: 1,
    badge: "NEW USER OFFER",
    title: "Up to 90% off",
    subtitle: "Free shipping on your first order",
    cta: "Claim now",
    gradient: "var(--gradient-hero)",
    blob1: "bg-white/10",
    blob2: "bg-white/10",
  },
  {
    id: 2,
    badge: "FLASH SALE",
    title: "Buy 2 Get 1 Free",
    subtitle: "On all electronics this weekend only",
    cta: "Shop now",
    gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
    blob1: "bg-white/10",
    blob2: "bg-yellow-300/20",
  },
  {
    id: 3,
    badge: "MEMBERS ONLY",
    title: "Extra 20% off",
    subtitle: "Exclusive deals for loyal shoppers",
    cta: "Join free",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    blob1: "bg-white/10",
    blob2: "bg-pink-300/20",
  },
  {
    id: 4,
    badge: "LIMITED TIME",
    title: "Free Gift Wrap",
    subtitle: "On orders above $50 — today only",
    cta: "Add to cart",
    gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
    blob1: "bg-white/10",
    blob2: "bg-teal-200/20",
  },
];

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % heroSlides.length);
    }, 3900);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goTo = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActive(idx);
    startTimer();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      goTo(
        diff > 0
          ? (active + 1) % heroSlides.length
          : (active - 1 + heroSlides.length) % heroSlides.length,
      );
    }
    touchStartX.current = null;
  };

  return (
    <div className="px-3 mt-5">
      <div
        className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]"
        style={{ minHeight: 172 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className="absolute inset-0 p-6 text-white transition-all duration-500"
            style={{
              background: slide.gradient,
              opacity: idx === active ? 1 : 0,
              transform:
                idx === active
                  ? "translateX(0%)"
                  : idx < active
                    ? "translateX(-100%)"
                    : "translateX(100%)",
              pointerEvents: idx === active ? "auto" : "none",
              zIndex: idx === active ? 1 : 0,
            }}
          >
            {/* Decorative blobs */}
            <div className={`absolute -right-8 -top-10 w-40 h-40 rounded-full ${slide.blob1}`} />
            <div className={`absolute right-16 bottom-2 w-20 h-20 rounded-full ${slide.blob2}`} />

            <p className="text-[11px] font-bold tracking-[0.2em] text-white/90">{slide.badge}</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight">{slide.title}</h2>
            <p className="mt-1 text-sm text-white/90">{slide.subtitle}</p>
            <button className="mt-4 bg-white text-primary text-sm font-semibold px-5 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform">
              {slide.cta}
            </button>
          </div>
        ))}

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="transition-all duration-300"
              style={{
                width: idx === active ? 20 : 6,
                height: 6,
                borderRadius: 99,
                background: idx === active ? "#fff" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

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

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load products dynamically from CJ API
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["cj-products", debouncedSearch],
    queryFn: () => fetchCjProducts({ search: debouncedSearch, size: 24 }),
  });

  const productsList = Array.isArray(products) ? products : [];

  return (
    <PhoneShell>
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Dova" className="w-9 h-9 rounded-full object-cover shadow-[var(--shadow-soft)]" />
          <span className="text-xl font-extrabold tracking-tight">Dova</span>
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
          <input
            className="flex-1 bg-transparent outline-none text-sm py-2 placeholder:text-muted-foreground"
            placeholder="Search for anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition">
            Search
          </button>
        </div>
      </div>

      {/* Hero Carousel */}
      <HeroCarousel />

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
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="min-w-[46%] w-[46%]">
                <ProductCardSkeleton />
              </div>
            ))
          ) : (
            productsList.slice(0, 6).map((p) => (
              <div key={p.id} className="min-w-[46%] w-[46%]">
                <ProductCard product={p} />
              </div>
            ))
          )}
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
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))
          ) : (
            productsList.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>
      </section>

      <BottomNav />
      <FloatingCart />
    </PhoneShell>
  );
}
