import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, MoreVertical, Check, Trash2, Clock, MapPin } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { products } from "@/data/products";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

const cartItems = products.slice(0, 6).map((p, i) => ({
  ...p,
  qty: i === 0 ? 3 : 1,
  variant: ["Black", "Silver", "White / L", "Rose Gold", "One Size", "Blue / 42"][i] ?? "Default",
  status: ["ONLY 10 LEFT", "ALMOST SOLD OUT", "BIG SALE", "LAST 2 DAYS", "BEST SELLER", "FLASH DEAL"][i] ?? "SALE",
}));

function CartPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(cartItems.map((c) => [c.id, true]))
  );
  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const allSelected = cartItems.every((c) => checked[c.id]);
  const selected = cartItems.filter((c) => checked[c.id]);
  const total = selected.reduce((s, c) => s + c.price * c.qty, 0);
  const savings = selected.reduce((s, c) => s + (c.original - c.price) * c.qty, 0);

  return (
    <PhoneShell gradient={false}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-2 px-4 pt-5 pb-3">
          <Link to="/" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <button
            onClick={() => {
              const next = !allSelected;
              setChecked(Object.fromEntries(cartItems.map((c) => [c.id, next])));
            }}
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${allSelected ? "bg-black border-black" : "border-muted-foreground"}`}>
              {allSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
            </span>
            All
          </button>
          <div className="flex items-center gap-1 ml-2 text-flame font-bold text-sm">
            <span className="italic">FF expires in</span>
            <span className="bg-flame text-white rounded px-1 py-0.5 text-xs font-mono">09</span>
            <span className="text-flame">:</span>
            <span className="bg-flame text-white rounded px-1 py-0.5 text-xs font-mono">25</span>
            <span className="text-flame">:</span>
            <span className="bg-flame text-white rounded px-1 py-0.5 text-xs font-mono">27</span>
          </div>
          <button className="ml-auto w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-4 mb-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <p className="text-xs font-semibold text-emerald-700">✓ Free shipping special for you</p>
          <span className="text-[10px] text-emerald-700/80 font-medium">Limited-time</span>
        </div>

        <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-foreground/80">Deliver to <span className="font-semibold">Circle, Labbadi</span> · Accra, Ghana</p>
        </div>
      </header>

      {/* Items */}
      <div className="divide-y divide-border/60">
        {cartItems.map((c) => (
          <div key={c.id} className="flex gap-3 px-4 py-3">
            <button onClick={() => toggle(c.id)} className="pt-10">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${checked[c.id] ? "bg-black border-black" : "border-muted-foreground"}`}>
                {checked[c.id] && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
              </span>
            </button>
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-secondary shrink-0">
              <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-bold px-1 py-0.5 text-center">
                {c.status}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm line-clamp-2 leading-snug">{c.title}</p>
                <button className="text-muted-foreground shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{c.variant} ⌄</p>
              <p className="mt-1 text-[11px] font-extrabold text-flame flex items-center gap-1">
                BIG SALE <Clock className="w-3 h-3" /> LAST 2 DAYS
              </p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-extrabold text-flame">
                    ${c.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-muted-foreground line-through">${c.original.toFixed(2)}</span>
                  <span className="text-[10px] bg-flame/10 text-flame border border-flame/30 rounded px-1 font-bold">
                    {c.badge}
                  </span>
                </div>
                <select
                  defaultValue={c.qty}
                  className="text-xs border border-border rounded px-2 py-0.5 bg-white"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-6 text-center text-xs text-muted-foreground">
        You have reached the bottom · Recommendations coming soon
      </div>

      {/* Sticky checkout bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
        <div className="mx-3 mb-3 rounded-full bg-black text-white flex items-center justify-between p-1.5 shadow-2xl">
          <div className="flex flex-col items-start pl-4 pr-2">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] line-through text-white/60">${(total + savings).toFixed(2)}</span>
            </div>
            <div className="flex items-baseline gap-1 text-flame">
              <span className="text-xs">$</span>
              <span className="text-lg font-extrabold leading-none">{total.toFixed(2)}</span>
              <span className="text-[10px] text-flame/80">▲</span>
            </div>
          </div>
          <button className="flex-1 mx-1 bg-flame hover:bg-flame/90 transition rounded-full py-2.5 text-center">
            <p className="text-sm font-extrabold">Checkout ({selected.length})</p>
            <p className="text-[10px] font-semibold text-white/90">Save ${savings.toFixed(2)} · 09:25:26</p>
          </button>
        </div>
      </div>

      <BottomNav />
    </PhoneShell>
  );
}
