import { ShoppingCart, Star, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/cart"
      className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-border/60 shadow-[var(--shadow-card)] transition active:scale-[0.98]"
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
      <div className="p-2.5 flex flex-col gap-1">
        <p className="text-[12px] leading-snug line-clamp-2 text-foreground/90 min-h-[2.4em]">
          {product.title}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-0.5 text-foreground">
            <Star className="w-2.5 h-2.5 fill-flame text-flame" />
            <span className="font-semibold">{product.rating}</span>
          </div>
          <span>·</span>
          <span>{product.sold}</span>
        </div>
        <div className="flex items-end justify-between mt-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-semibold text-primary">$</span>
            <span className="text-lg font-extrabold text-primary leading-none">
              {product.price.toFixed(2)}
            </span>
            <span className="text-[10px] text-muted-foreground line-through">
              ${product.original.toFixed(2)}
            </span>
          </div>
          <button
            onClick={(e) => e.preventDefault()}
            aria-label="Add to cart"
            className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-[var(--shadow-soft)]"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </Link>
  );
}

export function CartIconBtn() {
  return <ShoppingCart className="w-4 h-4" />;
}
