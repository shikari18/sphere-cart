import { useState, useEffect } from "react";
import { Star, ShoppingCart, X, ChevronLeft, Minus, Plus, Truck, Shield, RotateCcw, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/data/products";
import { useCart } from "@/hooks/use-cart";
import { fetchCjVariants, type CJVariant } from "@/lib/cj-api";

// ─── Product Detail Sheet (Temu-style) ───────────────────────────────────────

function ProductSheet({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem, items } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<CJVariant | null>(null);

  // Fetch variants from CJ Dropshipping API
  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["cj-variants", product.id],
    queryFn: () => fetchCjVariants({ data: { pid: product.id } }),
    enabled: !!product.id,
  });

  // Automatically select the first variant when loaded
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

  // Determine current display fields based on selection
  const displayImage = selectedVariant?.variantImage || product.image;
  const displayTitle = selectedVariant 
    ? `${product.title} (${selectedVariant.variantNameEn})`
    : product.title;
  const displaySku = selectedVariant?.variantSku || product.sku;
  
  // CJ prices are USD. Convert to GHC with rate of 15
  const rawPriceUSD = selectedVariant?.variantSellPrice || (product.price / 15.0);
  const displayPrice = rawPriceUSD * 15.0;
  
  const discount = Math.round(((product.original - displayPrice) / product.original) * 100);

  const cartItem = items.find((i) => i.id === (selectedVariant ? `${product.id}-${selectedVariant.vid}` : product.id));

  const handleAdd = () => {
    const productToAdd = {
      ...product,
      id: selectedVariant ? `${product.id}-${selectedVariant.vid}` : product.id,
      vid: selectedVariant ? selectedVariant.vid : undefined,
      title: displayTitle,
      image: displayImage,
      price: parseFloat(displayPrice.toFixed(2)),
      sku: displaySku,
    };
    for (let i = 0; i < qty; i++) addItem(productToAdd);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Close & nav strip */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-1 rounded-full bg-border mx-auto" />
          <div className="w-9" />
        </div>

        <div className="overflow-y-auto max-h-[80vh] pb-32">
          {/* Hero image */}
          <div className="relative aspect-[4/3] bg-secondary overflow-hidden mx-4 rounded-2xl">
            <img
              src={displayImage}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-extrabold px-2 py-0.5 rounded-md">
                {product.badge}
              </span>
            )}
            {product.topRated && (
              <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">
                #1 TOP RATED
              </span>
            )}
          </div>

          {/* Info */}
          <div className="px-4 mt-4">
            {/* Sale badge row */}
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-destructive/10 text-destructive text-[10px] font-extrabold px-2 py-0.5 rounded">SALE</span>
              <span className="text-[11px] text-emerald-600 font-semibold">✓ Free shipping</span>
              <span className="text-[11px] text-emerald-600 font-semibold">· Arrives in 7 days</span>
            </div>

            <h2 className="text-base font-bold leading-snug text-foreground">{displayTitle}</h2>

            {/* Price row */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-extrabold text-destructive">₵{displayPrice.toFixed(2)}</span>
              {product.original > displayPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">₵{product.original.toFixed(2)}</span>
                  <span className="text-xs font-bold text-destructive bg-destructive/10 rounded px-1">
                    {discount > 0 ? `-${discount}% OFF` : "SALE"}
                  </span>
                </>
              )}
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()} reviews)</span>
              <span className="text-xs text-muted-foreground">· {product.sold}</span>
            </div>

            {/* Variant Selector */}
            {isLoading ? (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading product options...</span>
              </div>
            ) : variants.length > 0 ? (
              <div className="mt-4">
                <span className="text-xs font-bold text-foreground/85 block mb-2">Style / Option:</span>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.vid === v.vid;
                    return (
                      <button
                        key={v.vid}
                        onClick={() => setSelectedVariant(v)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary font-bold"
                            : "border-border hover:bg-secondary text-foreground/80"
                        }`}
                      >
                        {v.variantImage && (
                          <img src={v.variantImage} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                        )}
                        <span className="max-w-[120px] truncate">{v.variantNameEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Qty selector */}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm font-semibold text-foreground/80">Quantity</span>
              <div className="flex items-center gap-3 bg-secondary rounded-full px-3 py-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-bold w-6 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {cartItem && (
                <span className="text-xs text-primary font-semibold">{cartItem.qty} in cart</span>
              )}
            </div>

            {/* Guarantees */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: <Truck className="w-4 h-4" />, label: "Free shipping" },
                { icon: <Shield className="w-4 h-4" />, label: "Secure pay" },
                { icon: <RotateCcw className="w-4 h-4" />, label: "90-day return" },
              ].map((g) => (
                <div key={g.label} className="flex flex-col items-center gap-1 bg-secondary rounded-xl p-2 text-center">
                  <div className="text-primary">{g.icon}</div>
                  <span className="text-[10px] font-semibold text-foreground/80">{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-border/60 px-4 py-3">
          <button
            onClick={handleAdd}
            disabled={isLoading}
            className="w-full bg-destructive hover:bg-destructive/90 active:scale-[0.98] transition text-white font-extrabold text-base py-3.5 rounded-full shadow-lg disabled:opacity-50"
          >
            {discount > 0 ? `-${discount}% now! Add to cart!` : "Add to cart!"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-border/60 shadow-[var(--shadow-card)] transition active:scale-[0.98] cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-square bg-secondary overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            width={512}
            height={512}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.badge && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm">
              {product.badge}
            </span>
          )}
          {product.topRated && (
            <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              #1 TOP RATED
            </span>
          )}
        </div>
        <div className="p-2.5 flex flex-col gap-1.5">
          <p className="text-[12px] leading-snug line-clamp-2 text-foreground/90 min-h-[2.4em]">
            {product.title}
          </p>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-semibold text-primary">₵</span>
              <span className="text-lg font-extrabold text-primary leading-none">
                {product.price.toFixed(2)}
              </span>
              {product.original > product.price && (
                <span className="text-[10px] text-muted-foreground line-through">
                  ₵{product.original.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              aria-label="Add to cart"
              className="shrink-0 text-foreground hover:text-primary active:scale-90 transition"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3h2l.4 2M7 13h10l2-6H6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="17" cy="18" r="1.5" fill="currentColor"/>
                <line x1="18" y1="4" x2="18" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="15.5" y1="6.5" x2="20.5" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && <ProductSheet product={product} onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── Floating Cart FAB ────────────────────────────────────────────────────────

export function FloatingCart() {
  const { count } = useCart();

  return (
    <Link
      to="/cart"
      aria-label="View cart"
      className="fixed bottom-24 right-4 z-40 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-primary shadow-2xl active:scale-95 transition"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6 text-primary" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-destructive text-white text-[10px] font-extrabold flex items-center justify-center px-1 leading-none">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </div>
      <span className="text-[9px] font-bold text-primary mt-0.5 leading-none">Cart</span>
      {count > 0 && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 whitespace-nowrap">
          Free shipping
        </span>
      )}
    </Link>
  );
}

export function CartIconBtn() {
  return <ShoppingCart className="w-4 h-4" />;
}
